import { getCurrentWindow } from '@tauri-apps/api/window';
import { Menu } from '@tauri-apps/api/menu';

// Each call needs its permission in src-tauri/capabilities/default.json.

const logError = (what: string) => (err: unknown) => console.error(`${what} failed`, err);

// core:window:allow-start-dragging
export function startDragging(): void {
  getCurrentWindow().startDragging().catch(logError('startDragging'));
}

// core:window:allow-close. Closing the only window exits the app (the tray goes with it).
export function quitApp(): void {
  getCurrentWindow().close().catch(logError('close'));
}

// core:window:allow-show / allow-hide / allow-set-focus
export async function setOverlayVisible(visible: boolean): Promise<void> {
  const win = getCurrentWindow();
  if (visible) {
    await win.show();
    await win.setFocus();
  } else {
    await win.hide();
  }
}

// core:window:allow-set-always-on-top
export function setAlwaysOnTop(on: boolean): void {
  getCurrentWindow().setAlwaysOnTop(on).catch(logError('setAlwaysOnTop'));
}

// Right-click menu on the overlay itself; the tray menu has the full set.
export async function showOverlayMenu(): Promise<void> {
  const menu = await Menu.new({
    items: [{ id: 'quit', text: 'Quit Pomodoro', action: quitApp }],
  });
  await menu.popup();
}
