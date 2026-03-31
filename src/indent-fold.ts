import { foldService, foldEffect } from "@codemirror/language";
import type { EditorView } from "@codemirror/view";

const TAB_SIZE = 4;

export function getIndent(text: string): number {
  const expanded = text.replace(/\t/g, " ".repeat(TAB_SIZE));
  return expanded.length - expanded.trimStart().length;
}

/**
 * Fold service that folds based on indentation depth.
 * A line is foldable if the next non-empty line is more indented.
 * The fold region extends until a non-empty line with equal or less indent.
 * Empty lines don't break a fold region.
 */
export const indentFoldService = foldService.of((state, lineStart, lineEnd) => {
  const line = state.doc.lineAt(lineStart);
  if (!line.text.trim()) return null;

  const myIndent = getIndent(line.text);
  let lastInRegion = line.number;

  for (let i = line.number + 1; i <= state.doc.lines; i++) {
    const next = state.doc.line(i);
    if (next.text.trim() && getIndent(next.text) <= myIndent) break;
    lastInRegion = i;
  }

  if (lastInRegion === line.number) return null;

  const lastLine = state.doc.line(lastInRegion);
  return { from: lineEnd, to: lastLine.to };
});

/**
 * Get the subtree range for a given line (the line + all more-indented children).
 * Returns { from, to } character positions, or null if the line has no children.
 */
export function getSubtreeRange(
  state: { doc: { lineAt(pos: number): { number: number; text: string; from: number; to: number }; line(n: number): { text: string; from: number; to: number }; lines: number } },
  pos: number
): { from: number; to: number } | null {
  const line = state.doc.lineAt(pos);
  if (!line.text.trim()) return null;

  const myIndent = getIndent(line.text);
  let lastInRegion = line.number;

  for (let i = line.number + 1; i <= state.doc.lines; i++) {
    const next = state.doc.line(i);
    if (next.text.trim() && getIndent(next.text) <= myIndent) break;
    lastInRegion = i;
  }

  const lastLine = state.doc.line(lastInRegion);
  return { from: line.from, to: lastLine.to };
}

/**
 * Custom fold-all that scans every line in the document and applies
 * all fold effects in a single transaction. Unlike the built-in foldAll,
 * this folds at every indentation level, not just currently-visible lines.
 */
export function foldAllDeep(view: EditorView): boolean {
  const { state } = view;
  const effects = [];

  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i);
    if (!line.text.trim()) continue;

    const myIndent = getIndent(line.text);
    let lastInRegion = i;

    for (let j = i + 1; j <= state.doc.lines; j++) {
      const next = state.doc.line(j);
      if (next.text.trim() && getIndent(next.text) <= myIndent) break;
      lastInRegion = j;
    }

    if (lastInRegion === i) continue;

    const lastLine = state.doc.line(lastInRegion);
    effects.push(foldEffect.of({ from: line.to, to: lastLine.to }));
  }

  if (effects.length === 0) return false;
  view.dispatch({ effects });
  return true;
}
