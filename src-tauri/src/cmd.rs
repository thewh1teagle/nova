use std::path::PathBuf;

use tauri::{async_runtime::spawn, AppHandle, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

use eyre::Result;
use crate::utils;

/// Returns command ID
#[tauri::command]
pub fn yt_dlp_command(app_handle: AppHandle, args: Vec<String>) -> String {
    let command = app_handle.shell().sidecar("yt-dlp").unwrap();
    let (mut rx, mut _child) = command.args(args).spawn().expect("Failed to spawn yt-dlp");
    let window = app_handle.get_webview_window("main").unwrap();
    let download_id = format!("download_{}", utils::random_string(8));
    let download_id_clone = download_id.clone();
    spawn(async move {
        let download_id = download_id_clone.clone();
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                let line = String::from_utf8(line).unwrap();
                log::debug!("line: {}", line);
                window.emit(&download_id, Some(line)).expect("failed to emit event");
            }
        }
    });
    download_id
}

#[tauri::command]
/// Opens folder or open folder of a file
pub async fn open_path(app_handle: AppHandle, path: PathBuf) -> Result<()> {
    if path.is_file() {
        showfile::show_path_in_file_manager(path);
    } else {
        app_handle.shell().open(path.to_str().unwrap(), None)?;
    }
    Ok(())
}