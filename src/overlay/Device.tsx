import type { MouseEvent } from 'react';
import { showOverlayMenu, startDragging } from '../lib/window';
import type { TimerView } from '../timer/view';
import { DeviceButtons } from './DeviceButtons';
import { Screen } from './Screen';

interface DeviceProps {
  view: TimerView;
  petId: string;
  animatePet: boolean;
  locked: boolean; // "Lock position": the shell no longer drags the window
  onPlayPause: () => void;
  onSkip: () => void;
  onSettings: () => void;
}

// The egg-shaped shell. Any primary-button press outside the buttons drags the window.
export function Device({ view, petId, animatePet, locked, onPlayPause, onSkip, onSettings }: DeviceProps) {
  const onMouseDown = (e: MouseEvent) => {
    if (locked || e.button !== 0 || (e.target as Element).closest('button')) return;
    startDragging();
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    showOverlayMenu().catch((err) => console.error('menu failed', err));
  };

  return (
    <div className={locked ? 'shell locked' : 'shell'} onMouseDown={onMouseDown} onContextMenu={onContextMenu}>
      <div className="gloss" aria-hidden="true" />
      <Screen petId={petId} view={view} animatePet={animatePet} />
      <DeviceButtons
        running={view.running}
        playLabel={view.playLabel}
        skipLabel={view.skipLabel}
        onPlayPause={onPlayPause}
        onSkip={onSkip}
        onSettings={onSettings}
      />
    </div>
  );
}
