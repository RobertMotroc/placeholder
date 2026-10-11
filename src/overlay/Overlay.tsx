import { useLayoutEffect, useRef, useState } from 'react';
import { quitApp, setAlwaysOnTop, setOverlayVisible } from '../lib/window';
import type { Settings, SettingKey } from '../settings/settings';
import { applyTheme } from '../theme/applyTheme';
import { themes } from '../theme/themes';
import { trayStatus } from '../timer/view';
import { Device } from './Device';
import { useReducedMotion } from './useReducedMotion';
import { useSettings } from './useSettings';
import { useTimer } from './useTimer';
import { useTray } from './useTray';

// Root of the overlay window: waits for saved settings, then runs the timer, device and tray.
export function Overlay() {
  const { settings, update } = useSettings();
  if (!settings) return null;
  return <OverlayApp settings={settings} update={update} />;
}

interface OverlayAppProps {
  settings: Settings;
  update: <K extends SettingKey>(key: K, value: Settings[K]) => void;
}

function OverlayApp({ settings, update }: OverlayAppProps) {
  const { view, playPause, skip, reset } = useTimer(settings.timer);
  const reducedMotion = useReducedMotion();
  const [overlayVisible, setVisible] = useState(true);
  const visibleRef = useRef(true);

  useLayoutEffect(() => applyTheme(themes[settings.theme] ?? themes.Lilac), [settings.theme]);
  // The window starts always-on-top (tauri.conf.json); undo that if the user turned it off.
  useLayoutEffect(() => setAlwaysOnTop(settings.alwaysOnTop), [settings.alwaysOnTop]);

  const toggleOverlay = () => {
    const next = !visibleRef.current;
    visibleRef.current = next;
    setVisible(next);
    setOverlayVisible(next).catch((err) => console.error('show/hide failed', err));
  };

  useTray(
    {
      status: trayStatus(view),
      playLabel: view.playLabel,
      skipLabel: view.skipLabel,
      overlayVisible,
      alwaysOnTop: settings.alwaysOnTop,
      lockPosition: settings.lockPosition,
      petId: settings.petId,
    },
    {
      playPause,
      skip,
      reset,
      toggleOverlay,
      setAlwaysOnTop: (on) => update('alwaysOnTop', on),
      setLockPosition: (on) => update('lockPosition', on),
      setPet: (id) => update('petId', id),
      quit: quitApp,
    },
  );

  return (
    <Device
      view={view}
      petId={settings.petId}
      animatePet={settings.animatePet && !reducedMotion}
      locked={settings.lockPosition}
      onPlayPause={playPause}
      onSkip={skip}
    />
  );
}
