import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { load } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { THEMES, buildTheme, DEFAULT_THEME } from "./themes";

const STORE_THEME_KEY = "appearance_theme";

export const themeCompartment = new Compartment();

let currentThemeId = DEFAULT_THEME;

async function getStore() {
  return await load("treenote-config.json", { autoSave: true, defaults: {} });
}

export function getCurrentThemeId(): string {
  return currentThemeId;
}

/**
 * Initialize appearance from persisted preferences.
 * Call once after the EditorView is created.
 */
export async function initAppearance(view: EditorView): Promise<void> {
  try {
    const store = await getStore();
    const savedTheme = await store.get<string>(STORE_THEME_KEY);
    if (savedTheme && THEMES[savedTheme]) {
      currentThemeId = savedTheme;
    }
  } catch (e) {
    console.warn("Failed to load appearance prefs:", e);
  }

  const palette = THEMES[currentThemeId];
  const theme = buildTheme(palette);
  view.dispatch({
    effects: themeCompartment.reconfigure(theme),
  });

  syncMenuChecks();
}

/**
 * Switch theme, apply to editor, persist, and sync menu.
 */
export async function setTheme(view: EditorView, themeId: string): Promise<void> {
  if (!THEMES[themeId]) return;
  currentThemeId = themeId;

  const palette = THEMES[currentThemeId];
  const theme = buildTheme(palette);
  view.dispatch({
    effects: themeCompartment.reconfigure(theme),
  });

  try {
    const store = await getStore();
    await store.set(STORE_THEME_KEY, currentThemeId);
  } catch (_) {}

  syncMenuChecks();
}

/**
 * Re-apply the current theme after editor state is replaced (e.g. loadFile).
 */
export function reapplyTheme(view: EditorView): void {
  const palette = THEMES[currentThemeId];
  const theme = buildTheme(palette);
  view.dispatch({
    effects: themeCompartment.reconfigure(theme),
  });
}

function syncMenuChecks(): void {
  invoke("sync_menu_checks", {
    theme: currentThemeId,
  }).catch(() => {});
}
