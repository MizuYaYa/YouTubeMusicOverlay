use std::io::{self, Read, Write};
use tauri::{tray::TrayIconBuilder, Emitter, Manager};
use tauri_plugin_positioner::{Position, WindowExt};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn send_to_extension(message: String) {
    let message_length = (message.len() as u32).to_le_bytes();

    let mut stdout = io::stdout();
    stdout.write_all(&message_length).unwrap();
    stdout.write_all(message.as_bytes()).unwrap();
    stdout.flush().unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let window = app.get_webview_window("main").unwrap();

            std::thread::spawn(move || {
                let stdin = io::stdin();
                let mut handle = stdin.lock();
                let mut buffer = Vec::new();

                loop {
                    let mut length_buffer = [0; 4];
                    match handle.read_exact(&mut length_buffer) {
                        Ok(_) => {
                            let message_length = u32::from_le_bytes(length_buffer) as usize;

                            buffer.resize(message_length, 0);
                            if handle.read_exact(&mut buffer).is_err() {
                                eprintln!("Failed to read message body");
                                break;
                            }

                            if let Ok(message) = String::from_utf8(buffer.clone()) {
                                let message_length = (message.len() as u32).to_le_bytes();
                                io::stdout().write_all(&message_length).unwrap();

                                io::stdout().write_all(message.as_bytes()).unwrap();
                                io::stdout().flush().unwrap();

                                app_handle.emit("native-message", message).unwrap();
                            } else {
                                eprintln!("Failed to parse message as UTF-8");
                            }
                        }
                        Err(_) => {
                            app_handle.exit(0);
                            break;
                        }
                    }
                }
            });

            #[cfg(target_os = "windows")]
            {
              let hwnd = window.hwnd().unwrap().0;
              let hwnd = windows::Win32::Foundation::HWND(hwnd as isize);
              unsafe {
                  use windows::Win32::UI::WindowsAndMessaging::*;
                  let nindex = GWL_EXSTYLE;
                  let style = WS_EX_APPWINDOW| WS_EX_COMPOSITED | WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST;
                  let _pre_val = SetWindowLongA(hwnd, nindex, style.0 as i32);
              };
            }

            TrayIconBuilder::new()
                .on_tray_icon_event(|tray_handle, event| {
                    tauri_plugin_positioner::on_tray_event(tray_handle.app_handle(), &event);
                })
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip(app.package_info().name.to_string())
                .build(app)?;


            let _ = window.as_ref().window().move_window(Position::TopRight);

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_to_extension])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
