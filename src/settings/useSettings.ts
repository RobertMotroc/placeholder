import { emit, listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useState } from 'react';
import { loadSettings, saveSetting } from '../lib/store';
import { defaultSettings, type SettingKey, type Settings } from './settings';

// Both windows hold their own copy of the settings. A change is saved to the store and broadcast,
// so the other window applies it live (the overlay while the settings window edits, and the reverse
// when the tray changes something).
const SETTINGS_EVENT = 'settings-changed';

interface SettingChange {
  key: SettingKey;
  value: Settings[SettingKey];
}

export type UpdateSetting = <K extends SettingKey>(key: K, value: Settings[K]) => void;

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .catch((err) => {
        // e.g. the page opened in a plain browser during development, without the Tauri runtime
        console.error('loading settings failed, using defaults', err);
        return defaultSettings;
      })
      .then((s) => !cancelled && setSettings(s));

    const unlisten = listen<SettingChange>(SETTINGS_EVENT, ({ payload }) => {
      setSettings((prev) => (prev ? { ...prev, [payload.key]: payload.value } : prev));
    }).catch(() => () => undefined);

    return () => {
      cancelled = true;
      unlisten.then((f) => f());
    };
  }, []);

  const update: UpdateSetting = useCallback((key, value) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    saveSetting(key, value).catch((err) => console.error(`saving ${key} failed`, err));
    emit<SettingChange>(SETTINGS_EVENT, { key, value }).catch(() => undefined);
  }, []);

  const resetAll = useCallback(() => {
    for (const key of Object.keys(defaultSettings) as SettingKey[]) update(key, defaultSettings[key]);
  }, [update]);

  return { settings, update, resetAll };
}
