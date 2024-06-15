use crate::panic_hook;
use tauri::{App, Manager};

pub fn setup(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    panic_hook::set_panic_hook(app.app_handle());
    Ok(())
}
