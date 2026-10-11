import { CheckMenuItem, Menu, MenuItem, Submenu } from '@tauri-apps/api/menu';
import { TrayIcon, type TrayIconEvent } from '@tauri-apps/api/tray';
import trayIconUrl from '../../assets/icons/tray-32.png';

// Native tray menu (docs/DESIGN.md §5). A native menu can't be styled; the pastel menu from the
// mockup would need its own popup window later.

const TRAY_ID = 'pomodoro';

export interface TrayActions {
  playPause(): void;
  skip(): void;
  reset(): void;
  toggleOverlay(): void;
  setAlwaysOnTop(on: boolean): void;
  setLockPosition(on: boolean): void;
  setPet(id: string): void;
  quit(): void;
}

export interface TrayModel {
  status: string; // tooltip status line, e.g. "Focus, 18:24 left"
  playLabel: string;
  skipLabel: string;
  overlayVisible: boolean;
  alwaysOnTop: boolean;
  lockPosition: boolean;
  petId: string;
}

export interface TrayController {
  update(model: TrayModel): void;
  close(): Promise<void>;
}

// Creation and removal are async; run them one at a time so StrictMode's mount/unmount/mount
// and hot reloads never leave two icons in the tray.
let queue: Promise<unknown> = Promise.resolve();
// Bumped by every creation. A close only removes the icon if no newer tray has replaced it,
// because every tray shares one id and a late close would otherwise remove its successor.
let generation = 0;
function serial<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

async function trayIconBytes(): Promise<Uint8Array> {
  return new Uint8Array(await (await fetch(trayIconUrl)).arrayBuffer());
}

export function createTray(actions: TrayActions, pets: { id: string; name: string }[]): Promise<TrayController> {
  return serial(async () => {
    const mine = ++generation;
    await TrayIcon.removeById(TRAY_ID).catch(() => undefined); // a predecessor, or left over from a page reload

    const playPause = await MenuItem.new({ id: 'play-pause', text: 'Start focus', action: () => actions.playPause() });
    const skip = await MenuItem.new({ id: 'skip', text: 'Skip to break', action: () => actions.skip() });
    const reset = await MenuItem.new({ id: 'reset', text: 'Reset session', action: () => actions.reset() });

    const showOverlay = await CheckMenuItem.new({ id: 'show', text: 'Show overlay', checked: true, action: () => actions.toggleOverlay() });
    const onTop = await CheckMenuItem.new({ id: 'on-top', text: 'Always on top', checked: true, action: () => actions.setAlwaysOnTop(!last?.alwaysOnTop) });
    const lock = await CheckMenuItem.new({ id: 'lock', text: 'Lock position', checked: false, action: () => actions.setLockPosition(!last?.lockPosition) });

    const petItems = new Map<string, CheckMenuItem>();
    for (const pet of pets) {
      const action = () => {
        actions.setPet(pet.id);
        // Re-picking the current pet doesn't change the model, but Windows has just unticked it.
        petItems.get(pet.id)?.setChecked(true).catch(() => undefined);
      };
      petItems.set(pet.id, await CheckMenuItem.new({ id: `pet-${pet.id}`, text: pet.name, checked: false, action }));
    }
    const petMenu = await Submenu.new({ id: 'pets', text: 'Change pet', items: [...petItems.values()] });
    const settings = await MenuItem.new({ id: 'settings', text: 'Settings', enabled: false }); // milestone 5
    const quit = await MenuItem.new({ id: 'quit', text: 'Quit', action: () => actions.quit() });

    const menu = await Menu.new({
      items: [
        playPause, skip, reset,
        { item: 'Separator' },
        showOverlay, onTop, lock,
        { item: 'Separator' },
        petMenu, settings, quit,
      ],
    });

    const tray = await TrayIcon.new({
      id: TRAY_ID,
      icon: await trayIconBytes(),
      tooltip: 'Pomodoro',
      menu,
      showMenuOnLeftClick: false, // left click shows/hides the overlay; right click opens the menu
      action: (e: TrayIconEvent) => {
        if (e.type === 'Click' && e.button === 'Left' && e.buttonState === 'Up') actions.toggleOverlay();
      },
    });

    // Push only what changed: the tooltip changes every second while the timer runs.
    let last: TrayModel | null = null;
    const update = (m: TrayModel) => {
      const prev = last;
      last = m;
      const changed = <K extends keyof TrayModel>(k: K) => !prev || prev[k] !== m[k];
      const calls: Promise<unknown>[] = [];
      if (changed('status')) calls.push(tray.setTooltip(`Pomodoro\n${m.status}`));
      if (changed('playLabel')) calls.push(playPause.setText(m.playLabel));
      if (changed('skipLabel')) calls.push(skip.setText(m.skipLabel));
      // Windows also toggles a check item itself when clicked; every click flips the value, so these agree.
      if (changed('overlayVisible')) calls.push(showOverlay.setChecked(m.overlayVisible));
      if (changed('alwaysOnTop')) calls.push(onTop.setChecked(m.alwaysOnTop));
      if (changed('lockPosition')) calls.push(lock.setChecked(m.lockPosition));
      if (changed('petId')) for (const [id, item] of petItems) calls.push(item.setChecked(id === m.petId));
      Promise.all(calls).catch((err) => console.error('tray update failed', err));
    };

    return {
      update,
      close: () => serial(async () => {
        if (mine === generation) await TrayIcon.removeById(TRAY_ID);
      }),
    };
  });
}
