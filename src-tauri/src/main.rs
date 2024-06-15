// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod config;
mod panic_hook;
mod setup;
mod utils;

fn main() {
    env_logger::init();
    tauri::Builder::default()
        .setup(|app| setup::setup(app))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![cmd::yt_dlp_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
