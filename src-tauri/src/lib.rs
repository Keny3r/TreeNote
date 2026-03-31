use std::sync::Mutex;
use tauri::{Emitter, Manager};
use tauri::menu::{
    CheckMenuItem, CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder,
};

struct MenuState {
    theme_items: Vec<CheckMenuItem<tauri::Wry>>,
}

#[tauri::command]
fn sync_menu_checks(state: tauri::State<'_, Mutex<MenuState>>, theme: String) {
    let state = state.lock().unwrap();
    let theme_id = format!("theme-{}", theme);
    for item in &state.theme_items {
        let _ = item.set_checked(item.id().0.as_str() == theme_id);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![sync_menu_checks])
        .setup(|app| {
            // ── File menu ────────────────────────────────────────
            let open_item = MenuItemBuilder::with_id("open", "Open")
                .accelerator("CmdOrCtrl+O").build(app)?;
            let save_item = MenuItemBuilder::with_id("save", "Save")
                .accelerator("CmdOrCtrl+S").build(app)?;
            let save_as_item = MenuItemBuilder::with_id("save-as", "Save As")
                .accelerator("CmdOrCtrl+Shift+S").build(app)?;
            let exit_item = MenuItemBuilder::with_id("exit", "Exit").build(app)?;

            let file_menu = SubmenuBuilder::new(app, "File")
                .item(&open_item)
                .item(&save_item)
                .item(&save_as_item)
                .separator()
                .item(&exit_item)
                .build()?;

            // ── Edit menu ────────────────────────────────────────
            let undo_item = MenuItemBuilder::with_id("undo", "Undo")
                .accelerator("CmdOrCtrl+Z").build(app)?;
            let redo_item = MenuItemBuilder::with_id("redo", "Redo")
                .accelerator("CmdOrCtrl+Y").build(app)?;
            let copy_subtree_item = MenuItemBuilder::with_id("copy-subtree", "Copy Subtree")
                .accelerator("Alt+C").build(app)?;
            let cut_subtree_item = MenuItemBuilder::with_id("cut-subtree", "Cut Subtree")
                .accelerator("Alt+X").build(app)?;

            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .item(&undo_item)
                .item(&redo_item)
                .separator()
                .cut()
                .copy()
                .paste()
                .separator()
                .item(&copy_subtree_item)
                .item(&cut_subtree_item)
                .build()?;

            // ── View menu ────────────────────────────────────────
            let toggle_fold_item = MenuItemBuilder::with_id("toggle-fold", "Toggle Fold")
                .accelerator("CmdOrCtrl+-").build(app)?;
            let fold_all_item = MenuItemBuilder::with_id("fold-all", "Fold All")
                .accelerator("CmdOrCtrl+Shift+-").build(app)?;
            let unfold_all_item = MenuItemBuilder::with_id("unfold-all", "Unfold All")
                .accelerator("CmdOrCtrl+Shift+=").build(app)?;

            // ── Walk items ───────────────────────────────────────
            let walk_fwd_item = MenuItemBuilder::with_id("walk-forward", "Walk Forward")
                .accelerator("Ctrl+Right").build(app)?;
            let walk_bwd_item = MenuItemBuilder::with_id("walk-backward", "Walk Backward")
                .accelerator("Ctrl+Left").build(app)?;

            // ── Theme submenu ────────────────────────────────────
            let theme_light = CheckMenuItemBuilder::with_id("theme-light", "Light")
                .checked(true).build(app)?;
            let theme_dark = CheckMenuItemBuilder::with_id("theme-dark", "Dark")
                .checked(false).build(app)?;
            let theme_sol_light = CheckMenuItemBuilder::with_id("theme-solarized-light", "Solarized Light")
                .checked(false).build(app)?;
            let theme_sol_dark = CheckMenuItemBuilder::with_id("theme-solarized-dark", "Solarized Dark")
                .checked(false).build(app)?;
            let theme_nord = CheckMenuItemBuilder::with_id("theme-nord", "Nord")
                .checked(false).build(app)?;

            let theme_submenu = SubmenuBuilder::new(app, "Theme")
                .item(&theme_light)
                .item(&theme_dark)
                .separator()
                .item(&theme_sol_light)
                .item(&theme_sol_dark)
                .item(&theme_nord)
                .build()?;

            let view_menu = SubmenuBuilder::new(app, "View")
                .item(&toggle_fold_item)
                .item(&fold_all_item)
                .item(&unfold_all_item)
                .separator()
                .item(&walk_fwd_item)
                .item(&walk_bwd_item)
                .separator()
                .item(&theme_submenu)
                .build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&file_menu, &edit_menu, &view_menu])
                .build()?;

            app.set_menu(menu)?;

            // Store theme items for sync_menu_checks command
            let theme_items = vec![
                theme_light.clone(), theme_dark.clone(),
                theme_sol_light.clone(), theme_sol_dark.clone(), theme_nord.clone(),
            ];

            app.manage(Mutex::new(MenuState { theme_items: theme_items.clone() }));

            // ── Menu event handler ───────────────────────────────
            let window = app.get_webview_window("main").unwrap();
            window.set_title("TreeNote").unwrap();

            app.on_menu_event(move |app_handle, event| {
                let id = event.id().0.as_str();
                match id {
                    "open" | "save" | "save-as" | "undo" | "redo"
                    | "copy-subtree" | "cut-subtree"
                    | "toggle-fold" | "fold-all" | "unfold-all"
                    | "walk-forward" | "walk-backward" => {
                        let _ = app_handle.emit("menu-action", id);
                    }
                    _ if id.starts_with("theme-") => {
                        for item in &theme_items {
                            let _ = item.set_checked(item.id().0.as_str() == id);
                        }
                        let _ = app_handle.emit("menu-action", id);
                    }
                    "exit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running TreeNote");
}
