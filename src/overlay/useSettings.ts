import { useCallback, useEffect, useState } from 'react';
import { loadSettings, saveSetting } from '../lib/store';
import { defaultSettings, type SettingKey, type Settings } from '../settings/settings';

// Loads saved settings once; null until they arrive. `update` applies a change and persists it.
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
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(<K extends SettingKey>(key: K, value: Settings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    saveSetting(key, value).catch((err) => console.error(`saving ${key} failed`, err));
  }, []);

  return { settings, update };
}
