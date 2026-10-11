// Pixel icons on a 12-unit grid (docs/DESIGN.md §1, Buttons).
const icons = {
  pause: (
    <>
      <rect x="2" y="2" width="3" height="8" />
      <rect x="7" y="2" width="3" height="8" />
    </>
  ),
  play: (
    <>
      <rect x="3" y="2" width="2" height="8" />
      <rect x="5" y="3" width="2" height="6" />
      <rect x="7" y="4" width="1" height="4" />
      <rect x="8" y="5" width="1" height="2" />
    </>
  ),
  skip: (
    <>
      <rect x="1" y="2" width="2" height="8" />
      <rect x="3" y="3" width="2" height="6" />
      <rect x="5" y="4" width="1" height="4" />
      <rect x="6" y="5" width="1" height="2" />
      <rect x="8" y="2" width="2" height="8" />
    </>
  ),
  settings: (
    <>
      <rect x="1" y="2" width="10" height="2" />
      <rect x="7" y="1" width="2" height="4" />
      <rect x="1" y="8" width="10" height="2" />
      <rect x="3" y="7" width="2" height="4" />
    </>
  ),
};

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      {icons[name]}
    </svg>
  );
}

interface DeviceButtonsProps {
  running: boolean;
  playLabel: string;
  onPlayPause?: () => void;
  onSkip?: () => void;
  onSettings?: () => void;
}

export function DeviceButtons({ running, playLabel, onPlayPause, onSkip, onSettings }: DeviceButtonsProps) {
  return (
    <div className="buttons">
      <button type="button" className="device-btn" aria-label={running ? 'Pause' : playLabel} onClick={onPlayPause}>
        <Icon name={running ? 'pause' : 'play'} />
      </button>
      <button type="button" className="device-btn middle" aria-label="Skip session" onClick={onSkip}>
        <Icon name="skip" />
      </button>
      <button type="button" className="device-btn" aria-label="Open settings" onClick={onSettings}>
        <Icon name="settings" />
      </button>
    </div>
  );
}
