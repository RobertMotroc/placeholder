import type { MouseEvent } from 'react';
import { showOverlayMenu, startDragging } from '../lib/window';
import { DeviceButtons } from './DeviceButtons';
import { Screen } from './Screen';

// The egg-shaped shell. Any primary-button press outside the buttons drags the window.
export function Device() {
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
      <Screen petId="hare" modeLabel="FOCUS" time="25:00" sessionsDone={0} sessionsPerCycle={4} progress={1} />
      <DeviceButtons running={false} playLabel="Start focus" />
    </div>
  );
}
