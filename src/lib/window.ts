import { getCurrentWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Menu } from '@tauri-apps/api/menu';

// Each call needs its permission in src-tauri/capabilities/default.json.

const logError = (what: string) => (err: unknown) => console.error(`${what} failed`, err);

export const SETTINGS_LABEL = 'settings';

// core:window:allow-start-dragging. Drags whichever window the call comes from.
export function startDragging(): void {
  getCurrentWindow().startDragging().catch(logError('startDragging'));
}

// core:window:allow-close. Closes only the calling window (e.g. the settings window).
export function closeCurrentWindow(): void {
  getCurrentWindow().close().catch(logError('close'));
}

// The app exits when its last window closes, so close settings first, then the overlay.
export async function quitApp(): Promise<void> {
  try {
    await (await WebviewWindow.getByLabel(SETTINGS_LABEL))?.close();
    await getCurrentWindow().close();
  } catch (err) {
    logError('quit')(err);
  }
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

// Opens the settings window, or brings it forward if it is already open.
// core:webview:allow-create-webview-window, plus show / set-focus for an existing one.
export async function openSettings(): Promise<void> {
  const existing = await WebviewWindow.getByLabel(SETTINGS_LABEL);
  if (existing) {
    await existing.show();
    await existing.setFocus();
    return;
  }
  // 520px panel (docs/DESIGN.md §6) plus room for its lip shadow; the frame is drawn in CSS.
  const win = new WebviewWindow(SETTINGS_LABEL, {
    url: 'settings.html',
    title: 'Pomodoro settings',
    width: 552,
    height: 760,
    center: true,
    resizable: false,
    maximizable: false,
    decorations: false,
    transparent: true,
    shadow: false,
    focus: true,
  });
  win.once('tauri://error', (e) => console.error('opening settings failed', e));
}

// Right-click menu on the overlay itself; the tray menu has the full set.
export async function showOverlayMenu(): Promise<void> {
  const menu = await Menu.new({
    items: [
      { id: 'settings', text: 'Settings', action: () => openSettings().catch(logError('openSettings')) },
      { id: 'quit', text: 'Quit Pomodoro', action: () => quitApp() },
    ],
  });
  await menu.popup();
}
