import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

export interface ThemePalette {
  id: string;
  label: string;
  isDark: boolean;
  bg: string;
  fg: string;
  gutterBg: string;
  gutterFg: string;
  gutterBorder: string;
  activeLine: string;
  activeLineGutter: string;
  selection: string;
  cursor: string;
  foldPlaceholderBg: string;
  foldPlaceholderBorder: string;
  foldPlaceholderFg: string;
  foldMarker: string;
  foldMarkerHover: string;
}

export const THEMES: Record<string, ThemePalette> = {
  light: {
    id: "light",
    label: "Light",
    isDark: false,
    bg: "#ffffff",
    fg: "#222222",
    gutterBg: "#f5f5f5",
    gutterFg: "#aaaaaa",
    gutterBorder: "#dddddd",
    activeLine: "#f8f8f4",
    activeLineGutter: "#eaeae4",
    selection: "#d0e4f5",
    cursor: "#000000",
    foldPlaceholderBg: "#eef0e8",
    foldPlaceholderBorder: "#dde0d8",
    foldPlaceholderFg: "#888888",
    foldMarker: "#555555",
    foldMarkerHover: "#000000",
  },
  dark: {
    id: "dark",
    label: "Dark",
    isDark: true,
    bg: "#1e1e1e",
    fg: "#d4d4d4",
    gutterBg: "#252526",
    gutterFg: "#858585",
    gutterBorder: "#333333",
    activeLine: "#2a2d2e",
    activeLineGutter: "#2a2d2e",
    selection: "#264f78",
    cursor: "#aeafad",
    foldPlaceholderBg: "#37373d",
    foldPlaceholderBorder: "#4b4b52",
    foldPlaceholderFg: "#969696",
    foldMarker: "#858585",
    foldMarkerHover: "#cccccc",
  },
  "solarized-light": {
    id: "solarized-light",
    label: "Solarized Light",
    isDark: false,
    bg: "#fdf6e3",
    fg: "#657b83",
    gutterBg: "#eee8d5",
    gutterFg: "#93a1a1",
    gutterBorder: "#ddd6c1",
    activeLine: "#eee8d5",
    activeLineGutter: "#e6dfca",
    selection: "#d1cbaf",
    cursor: "#586e75",
    foldPlaceholderBg: "#eee8d5",
    foldPlaceholderBorder: "#ddd6c1",
    foldPlaceholderFg: "#93a1a1",
    foldMarker: "#93a1a1",
    foldMarkerHover: "#586e75",
  },
  "solarized-dark": {
    id: "solarized-dark",
    label: "Solarized Dark",
    isDark: true,
    bg: "#002b36",
    fg: "#839496",
    gutterBg: "#073642",
    gutterFg: "#586e75",
    gutterBorder: "#0a4050",
    activeLine: "#073642",
    activeLineGutter: "#073642",
    selection: "#174f5e",
    cursor: "#839496",
    foldPlaceholderBg: "#073642",
    foldPlaceholderBorder: "#0a4050",
    foldPlaceholderFg: "#586e75",
    foldMarker: "#586e75",
    foldMarkerHover: "#93a1a1",
  },
  nord: {
    id: "nord",
    label: "Nord",
    isDark: true,
    bg: "#2e3440",
    fg: "#d8dee9",
    gutterBg: "#3b4252",
    gutterFg: "#616e88",
    gutterBorder: "#434c5e",
    activeLine: "#3b4252",
    activeLineGutter: "#3b4252",
    selection: "#434c5e",
    cursor: "#d8dee9",
    foldPlaceholderBg: "#3b4252",
    foldPlaceholderBorder: "#434c5e",
    foldPlaceholderFg: "#616e88",
    foldMarker: "#616e88",
    foldMarkerHover: "#d8dee9",
  },
};

/**
 * Build a CodeMirror theme extension from a palette.
 */
export function buildTheme(palette: ThemePalette): Extension {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: palette.bg,
        color: palette.fg,
      },
      ".cm-gutters": {
        backgroundColor: palette.gutterBg,
        color: palette.gutterFg,
        borderRight: `1px solid ${palette.gutterBorder}`,
      },
      ".cm-activeLine": {
        backgroundColor: palette.activeLine,
      },
      ".cm-activeLineGutter": {
        backgroundColor: palette.activeLineGutter,
      },
      ".cm-selectionBackground": {
        backgroundColor: `${palette.selection} !important`,
      },
      ".cm-cursor, .cm-cursor-primary, .cm-dropCursor": {
        borderLeftColor: `${palette.cursor} !important`,
        borderLeftWidth: "2px !important",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: palette.foldPlaceholderBg,
        border: `1px solid ${palette.foldPlaceholderBorder}`,
        color: palette.foldPlaceholderFg,
      },
      ".cm-foldGutter .cm-gutterElement": {
        color: palette.foldMarker,
      },
      ".cm-foldGutter .cm-gutterElement:hover": {
        color: palette.foldMarkerHover,
      },
    },
    { dark: palette.isDark }
  );
}

export const DEFAULT_THEME = "light";
export const THEME_IDS = Object.keys(THEMES);
