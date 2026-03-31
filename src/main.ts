import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentMore, indentLess, undo, redo } from "@codemirror/commands";
import {
  foldGutter, unfoldAll, foldKeymap,
  foldable, foldEffect, toggleFold,
  indentUnit,
} from "@codemirror/language";
import { search, searchKeymap } from "@codemirror/search";
import { indentFoldService, foldAllDeep } from "./indent-fold";
import { copySubtree, cutSubtree } from "./subtree";
import { themeCompartment, initAppearance, setTheme, reapplyTheme } from "./appearance";
import { walkForward, walkBackward, resetWalk } from "./tree-walk";
import { symbolPickerKeymap } from "./symbol-picker";

import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { load } from "@tauri-apps/plugin-store";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";

const STORE_KEY = "last_file_path";
let currentFilePath: string | null = null;
let isModified = false;
let editorView: EditorView;

// ── Title management ────────────────────────────────────────────────
function updateTitle() {
  const name = currentFilePath
    ? currentFilePath.split(/[\\/]/).pop()!
    : "Untitled";
  const prefix = isModified ? "* " : "";
  getCurrentWebviewWindow().setTitle(`${prefix}${name} — TreeNote`);
}

function setModified(value: boolean) {
  if (isModified !== value) {
    isModified = value;
    updateTitle();
  }
}

// ── File operations ─────────────────────────────────────────────────
async function getStore() {
  return await load("treenote-config.json", { autoSave: true, defaults: {} });
}

async function saveLastPath() {
  if (currentFilePath) {
    const store = await getStore();
    await store.set(STORE_KEY, currentFilePath);
  }
}

async function openFile() {
  const selected = await open({
    multiple: false,
    filters: [
      { name: "Text files", extensions: ["txt"] },
      { name: "All files", extensions: ["*"] },
    ],
  });
  if (!selected) return;
  await loadFile(selected as string);
}

async function loadFile(path: string) {
  try {
    const content = await readTextFile(path);
    currentFilePath = path;

    const newState = EditorState.create({
      doc: content,
      extensions: editorExtensions(),
    });
    editorView.setState(newState);
    reapplyTheme(editorView);

    setModified(false);
    await saveLastPath();

    requestAnimationFrame(() => foldAllDeep(editorView));
  } catch (e) {
    console.error("Failed to load file:", e);
  }
}

async function saveFile() {
  if (!currentFilePath) {
    return saveFileAs();
  }
  const content = editorView.state.doc.toString();
  await writeTextFile(currentFilePath, content);
  setModified(false);
  await saveLastPath();
}

async function saveFileAs() {
  const path = await save({
    defaultPath: currentFilePath || undefined,
    filters: [
      { name: "Text files", extensions: ["txt"] },
      { name: "All files", extensions: ["*"] },
    ],
  });
  if (!path) return;
  currentFilePath = path;
  await saveFile();
}

async function reopenLastFile() {
  try {
    const store = await getStore();
    const path = await store.get<string>(STORE_KEY);
    if (path) {
      await loadFile(path);
    }
  } catch (e) {
    console.error("Failed to reopen last file:", e);
  }
}

// ── Custom keymap ───────────────────────────────────────────────────
const treeNoteKeymap = keymap.of([
  { key: "Mod-s", run: () => { saveFile(); return true; } },
  { key: "Mod-o", run: () => { openFile(); return true; } },
  { key: "Mod--", run: toggleFold },
  { key: "Mod-Shift--", run: (view) => { foldAllDeep(view); return true; } },
  { key: "Mod-Shift-=", run: (view) => { unfoldAll(view); return true; } },
  { key: "Alt-c", run: (view) => copySubtree(view) },
  { key: "Alt-x", run: (view) => cutSubtree(view) },
  { key: "Tab", run: indentMore },
  { key: "Shift-Tab", run: indentLess },
  { key: "Ctrl-ArrowRight", run: (view) => walkForward(view) },
  { key: "Ctrl-ArrowLeft",  run: (view) => walkBackward(view) },
  ...symbolPickerKeymap,
]);

// ── Extensions ──────────────────────────────────────────────────────
function editorExtensions() {
  return [
    lineNumbers(),
    history(),
    foldGutter({
      openText: "▼",
      closedText: "▶",
    }),
    indentFoldService,
    search(),
    themeCompartment.of([]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setModified(true);
        resetWalk();
      }
    }),
    treeNoteKeymap,
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...searchKeymap,
    ]),
    EditorState.tabSize.of(4),
    indentUnit.of("    "),
  ];
}

// ── Menu event handler ──────────────────────────────────────────────
function setupMenuListener() {
  listen<string>("menu-action", (event) => {
    switch (event.payload) {
      case "open":         openFile(); break;
      case "save":         saveFile(); break;
      case "save-as":      saveFileAs(); break;
      case "undo":         undo(editorView); break;
      case "redo":         redo(editorView); break;
      case "copy-subtree": copySubtree(editorView); break;
      case "cut-subtree":  cutSubtree(editorView); break;
      case "toggle-fold":  toggleFold(editorView); break;
      case "fold-all":     foldAllDeep(editorView); resetWalk(); break;
      case "unfold-all":   unfoldAll(editorView); resetWalk(); break;
      case "walk-forward": walkForward(editorView); break;
      case "walk-backward":walkBackward(editorView); break;
      // Theme
      case "theme-light":           setTheme(editorView, "light"); break;
      case "theme-dark":            setTheme(editorView, "dark"); break;
      case "theme-solarized-light": setTheme(editorView, "solarized-light"); break;
      case "theme-solarized-dark":  setTheme(editorView, "solarized-dark"); break;
      case "theme-nord":            setTheme(editorView, "nord"); break;
    }
  });
}

// ── Init ────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  editorView = new EditorView({
    state: EditorState.create({
      doc: "",
      extensions: editorExtensions(),
    }),
    parent: document.getElementById("editor")!,
  });
  setupMenuListener();
  await initAppearance(editorView);
  reopenLastFile();
});
