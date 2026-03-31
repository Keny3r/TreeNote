import { EditorView } from "@codemirror/view";
import { getSubtreeRange } from "./indent-fold";

/**
 * Copy the subtree (current line + all more-indented children) to clipboard.
 */
export function copySubtree(view: EditorView): boolean {
  const pos = view.state.selection.main.head;
  const range = getSubtreeRange(view.state, pos);
  if (!range) return false;

  const text = view.state.sliceDoc(range.from, range.to);
  navigator.clipboard.writeText(text);
  return true;
}

/**
 * Cut the subtree: copy to clipboard, then delete.
 */
export function cutSubtree(view: EditorView): boolean {
  const pos = view.state.selection.main.head;
  const range = getSubtreeRange(view.state, pos);
  if (!range) return false;

  const text = view.state.sliceDoc(range.from, range.to);
  navigator.clipboard.writeText(text);

  // Delete the subtree (including trailing newline if present)
  let deleteTo = range.to;
  if (deleteTo < view.state.doc.length) {
    deleteTo += 1; // consume the newline after
  }
  view.dispatch({
    changes: { from: range.from, to: deleteTo },
  });
  return true;
}
