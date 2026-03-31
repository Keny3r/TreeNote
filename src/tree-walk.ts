import type { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { foldable, foldEffect, unfoldEffect, foldedRanges } from "@codemirror/language";
import { getIndent } from "./indent-fold";

// ── Walk state (module-level, reset on demand) ───────────────────────

interface WalkStep {
  prevCursorPos: number;
  unfolded: { from: number; to: number }[];
  folded: { from: number; to: number }[];
  stackSnapshot: number[]; // line numbers before this step
}

let walkStack: number[] = [];
let walkHistory: WalkStep[] = [];

export function resetWalk(): void {
  walkStack = [];
  walkHistory = [];
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Get the foldable range for a line, or null if not foldable. */
function getFoldRange(
  state: EditorView["state"],
  lineNo: number
): { from: number; to: number } | null {
  const line = state.doc.line(lineNo);
  return foldable(state, line.from, line.to);
}

/**
 * Check whether a line is currently folded.
 * Indent folds start at line.to (end of the header line), so we probe there.
 */
function isLineFolded(state: EditorView["state"], lineNo: number): boolean {
  const line = state.doc.line(lineNo);
  let found = false;
  foldedRanges(state).between(line.to - 1, line.to + 1, (from) => {
    if (from <= line.to) {
      found = true;
      return false; // stop iteration
    }
  });
  return found;
}

/**
 * Return the first non-empty line number strictly after lineNo
 * that has a greater indent level. Returns null if none.
 */
function firstNonEmptyChild(state: EditorView["state"], lineNo: number): number | null {
  const parent = state.doc.line(lineNo);
  const parentIndent = getIndent(parent.text);

  for (let i = lineNo + 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i);
    if (!line.text.trim()) continue;
    const indent = getIndent(line.text);
    if (indent > parentIndent) return i;
    break; // same or lesser indent — no children
  }
  return null;
}

/**
 * Return the next sibling line: the next non-empty line with the
 * SAME indent as lineNo. Returns null if a line with lesser indent
 * is encountered first (meaning we've left the parent's scope).
 */
function nextSibling(state: EditorView["state"], lineNo: number): number | null {
  const myLine = state.doc.line(lineNo);
  const myIndent = getIndent(myLine.text);

  for (let i = lineNo + 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i);
    if (!line.text.trim()) continue;
    const indent = getIndent(line.text);
    if (indent === myIndent) return i;
    if (indent < myIndent) return null; // left this scope
    // indent > myIndent: child line, keep scanning
  }
  return null;
}

/** Move the cursor to the start of a line. */
function moveCursorTo(view: EditorView, lineNo: number): void {
  const line = view.state.doc.line(lineNo);
  view.dispatch({
    selection: EditorSelection.cursor(line.from),
    scrollIntoView: true,
  });
}

/** Find the current non-empty line at or after the cursor. */
function currentNonEmptyLine(view: EditorView): number | null {
  const { state } = view;
  const cursorPos = state.selection.main.head;
  const startLine = state.doc.lineAt(cursorPos).number;

  for (let i = startLine; i <= state.doc.lines; i++) {
    if (state.doc.line(i).text.trim()) return i;
  }
  return null;
}

// ── Main commands ────────────────────────────────────────────────────

/**
 * Walk forward one step through the tree (depth-first).
 * Returns true always (consumes the key event).
 */
export function walkForward(view: EditorView): boolean {
  const { state } = view;
  const lineNo = currentNonEmptyLine(view);
  if (lineNo === null) return true;

  const cursorPos = state.selection.main.head;
  const step: WalkStep = {
    prevCursorPos: cursorPos,
    unfolded: [],
    folded: [],
    stackSnapshot: [...walkStack],
  };

  // Rule 1: foldable AND currently folded → unfold and descend
  const foldRange = getFoldRange(state, lineNo);
  if (foldRange && isLineFolded(state, lineNo)) {
    const child = firstNonEmptyChild(state, lineNo);
    const effects: ReturnType<typeof unfoldEffect.of>[] = [
      unfoldEffect.of(foldRange),
    ];
    step.unfolded.push(foldRange);
    walkStack = [...walkStack, lineNo];

    if (child !== null) {
      const childLine = state.doc.line(child);
      view.dispatch({
        effects,
        selection: EditorSelection.cursor(childLine.from),
        scrollIntoView: true,
      });
    } else {
      // Unfolded but no children visible — just move past it
      view.dispatch({ effects });
    }
    walkHistory.push(step);
    return true;
  }

  // Rule 2: leaf or already open → find next sibling
  const sib = nextSibling(state, lineNo);
  if (sib !== null) {
    const sibLine = state.doc.line(sib);
    view.dispatch({
      selection: EditorSelection.cursor(sibLine.from),
      scrollIntoView: true,
    });
    walkHistory.push(step);
    return true;
  }

  // Rule 3: no sibling → fold parents back one by one until we find a sibling
  const effects: (ReturnType<typeof foldEffect.of>)[] = [];
  let target: number | null = null;
  const stackCopy = [...walkStack];

  while (stackCopy.length > 0) {
    const parent = stackCopy.pop()!;
    const parentFoldRange = getFoldRange(state, parent);
    if (parentFoldRange) {
      effects.push(foldEffect.of(parentFoldRange));
      step.folded.push(parentFoldRange);
    }
    const parentSib = nextSibling(state, parent);
    if (parentSib !== null) {
      target = parentSib;
      break;
    }
  }

  walkStack = stackCopy;

  if (effects.length > 0 || target !== null) {
    if (target !== null) {
      const targetLine = state.doc.line(target);
      view.dispatch({
        effects,
        selection: EditorSelection.cursor(targetLine.from),
        scrollIntoView: true,
      });
    } else {
      // All ancestors folded back, no more siblings — walk complete
      view.dispatch({ effects });
      resetWalk();
    }
    walkHistory.push(step);
  } else {
    // Nothing to do, walk is already at the end
    resetWalk();
  }

  return true;
}

/**
 * Walk backward one step (undo the last forward step).
 * Returns true always.
 */
export function walkBackward(view: EditorView): boolean {
  if (walkHistory.length === 0) return true;

  const step = walkHistory.pop()!;
  walkStack = [...step.stackSnapshot];

  const effects: (ReturnType<typeof foldEffect.of> | ReturnType<typeof unfoldEffect.of>)[] = [];

  // Re-fold what was unfolded
  for (const range of step.unfolded) {
    effects.push(foldEffect.of(range));
  }
  // Re-unfold what was folded
  for (const range of step.folded) {
    effects.push(unfoldEffect.of(range));
  }

  view.dispatch({
    effects,
    selection: EditorSelection.cursor(step.prevCursorPos),
    scrollIntoView: true,
  });

  return true;
}
