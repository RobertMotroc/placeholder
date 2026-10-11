import { load, type Store } from '@tauri-apps/plugin-store';
import { defaultSettings, type SettingKey, type Settings } from '../settings/settings';

// Settings live in settings.json in the app's data folder (store plugin), one key per setting.
let storePromise: Promise<Store> | null = null;

function store(): Promise<Store> {
  storePromise ??= load('settings.json', { defaults: { ...defaultSettings }, autoSave: 100 });
  return storePromise;
}

export async function loadSettings(): Promise<Settings> {
  const s = await store();
  const entries = await Promise.all(
    (Object.keys(defaultSettings) as SettingKey[]).map(async (key) => [key, (await s.get(key)) ?? defaultSettings[key]] as const),
  );
  // Merge timer lengths too, so settings saved by an older version still get any new fields.
  const loaded = Object.fromEntries(entries) as unknown as Settings;
  return { ...loaded, timer: { ...defaultSettings.timer, ...loaded.timer } };
}

export async function saveSetting<K extends SettingKey>(key: K, value: Settings[K]): Promise<void> {
  await (await store()).set(key, value);
}
