import type { MouseEvent } from 'react';
import { showOverlayMenu, startDragging } from '../lib/window';
import { DeviceButtons } from './DeviceButtons';
import { Screen } from './Screen';
import { useTimer } from './useTimer';

// The egg-shaped shell. Any primary-button press outside the buttons drags the window.
export function Device() {
  const { view, playPause, skip } = useTimer();

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || (e.target as Element).closest('button')) return;
    startDragging();
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    showOverlayMenu().catch((err) => console.error('menu failed', err));
  };

  return (
    <div className="shell" onMouseDown={onMouseDown} onContextMenu={onContextMenu}>
      <div className="gloss" aria-hidden="true" />
      <Screen petId="hare" view={view} />
      {/* Settings opens the settings window, which arrives in milestone 5. */}
      <DeviceButtons running={view.running} playLabel={view.playLabel} onPlayPause={playPause} onSkip={skip} />
    </div>
  );
}
