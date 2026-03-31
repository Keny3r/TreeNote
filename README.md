# TreeNote

**A keyboard-first hierarchical note editor.**

TreeNote is a plain-text outline editor built on [CodeMirror 6](https://codemirror.net/) and [Tauri](https://tauri.app/). It represents structure through indentation — each indented block is a child node. Nodes fold and unfold on demand, so you can keep large notes tidy and navigate them with the keyboard alone.

---

## Features

- **Fold / unfold** individual nodes or the entire tree
- **Tree walk** — depth-first traversal with Ctrl+Arrow: steps through nodes one at a time, auto-folding what you've already read
- **Copy / cut subtree** — grab a node and all its children in one keystroke
- **Symbol picker** — insert emoji, Greek letters, or math symbols from a searchable floating picker
- **5 color themes** — Light, Dark, Solarized Light, Solarized Dark, Nord
- **Persistent last file** — reopens your previous file automatically on launch
- **Native menu bar** — File / Edit / View menus with full keyboard access

## Download

Get the installer for your platform from the [Releases page](https://github.com/Keny3r/TreeNote/releases).

| Platform | File |
|---|---|
| Windows | `.msi` or `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.AppImage` or `.deb` |

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save |
| `Ctrl+O` | Open file |
| `Ctrl+-` | Toggle fold on current node |
| `Ctrl+Shift+-` | Fold all |
| `Ctrl+Shift+=` | Unfold all |
| `Ctrl+Right` | Walk forward (unfold next node) |
| `Ctrl+Left` | Walk backward |
| `Alt+C` | Copy subtree |
| `Alt+X` | Cut subtree |
| `Tab` | Indent (4 spaces) |
| `Shift+Tab` | Unindent |
| `Ctrl+E` | Open emoji picker |
| `Ctrl+G` | Open Greek letter picker |
| `Ctrl+M` | Open math symbol picker |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Find |

Inside the symbol picker:

| Key | Action |
|---|---|
| Type | Filter by name |
| `Tab` / `Shift+Tab` | Switch category |
| `Arrow keys` | Navigate grid |
| `Enter` | Insert focused symbol |
| `Escape` | Close without inserting |

---

## Building from source

**Prerequisites:** [Node.js 18+](https://nodejs.org/), [Rust stable](https://rustup.rs/), and a system WebView:
- Windows: WebView2 (pre-installed on Windows 10/11)
- Linux: `libwebkit2gtk-4.1-dev`
- macOS: WebKit (built-in)

```bash
git clone https://github.com/Keny3r/TreeNote.git
cd TreeNote
npm install
npm run tauri dev        # run in development
npm run tauri build      # build a production installer
```

---

## License

MIT
