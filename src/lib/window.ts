import { getCurrentWindow } from '@tauri-apps/api/window';
import { Menu } from '@tauri-apps/api/menu';

// Needs `core:window:allow-start-dragging` in src-tauri/capabilities/default.json.
export function startDragging(): void {
  getCurrentWindow()
    .startDragging()
    .catch((err) => console.error('startDragging failed', err));
}

// Closing the only window exits the app. Needs `core:window:allow-close`.
export function quitApp(): void {
  getCurrentWindow()
    .close()
    .catch((err) => console.error('close failed', err));
}

// Native right-click menu on the overlay. Stopgap until the tray menu (milestone 4).
export async function showOverlayMenu(): Promise<void> {
  const menu = await Menu.new({
    items: [{ id: 'quit', text: 'Quit Pomodoro', action: quitApp }],
  });
  await menu.popup();
}
