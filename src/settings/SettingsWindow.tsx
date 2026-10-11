import { useEffect, useLayoutEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import trayIconUrl from '../../assets/icons/tray-32.png';
import { closeCurrentWindow, startDragging } from '../lib/window';
import { pets } from '../pets/registry';
import { spriteStyle } from '../pets/sprite';
import { applyTheme } from '../theme/applyTheme';
import { themes, type ThemeName } from '../theme/themes';
import type { TimerConfig } from '../timer/types';
import type { Settings } from './settings';
import { useSettings, type UpdateSetting } from './useSettings';

// The settings window (docs/DESIGN.md §6). Every control saves as soon as it changes, and the
// overlay applies it live; Done and the X just close the window.
export function SettingsWindow() {
  const { settings, update, resetAll } = useSettings();
  if (!settings) return null;
  return <SettingsPanel settings={settings} update={update} resetAll={resetAll} />;
}

interface PanelProps {
  settings: Settings;
  update: UpdateSetting;
  resetAll: () => void;
}

function SettingsPanel({ settings, update, resetAll }: PanelProps) {
  useLayoutEffect(() => applyTheme(themes[settings.theme] ?? themes.Lilac), [settings.theme]);

  const onTitleMouseDown = (e: MouseEvent) => {
    if (e.button === 0 && !(e.target as Element).closest('button')) startDragging();
  };

  return (
    <div className="panel">
      <header className="titlebar" onMouseDown={onTitleMouseDown}>
        <img src={trayIconUrl} alt="" width={32} height={32} className="pixel" />
        <h1>Settings</h1>
        <button type="button" className="close" aria-label="Close settings" onClick={closeCurrentWindow}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </header>

      <div className="body">
        <PetSection settings={settings} update={update} />
        <ThemeSection settings={settings} update={update} />
        <TimerSection timer={settings.timer} onChange={(timer) => update('timer', timer)} />
        <OverlaySection settings={settings} update={update} />
      </div>

      <footer className="footer">
        <button type="button" className="btn-outline" onClick={resetAll}>
          Reset to defaults
        </button>
        <button type="button" className="btn-primary" onClick={closeCurrentWindow}>
          Done
        </button>
      </footer>
    </div>
  );
}

interface SectionProps {
  settings: Settings;
  update: UpdateSetting;
}

function PetSection({ settings, update }: SectionProps) {
  return (
    <fieldset className="section">
      <legend>Pet</legend>
      <div className="tiles">
        {pets.map((pet) => (
          <label key={pet.id} className={pet.id === settings.petId ? 'tile selected' : 'tile'}>
            <span className="portrait">
              {/* Idle frame 0, front row, at the largest whole-number scale for a 64px box (docs/DESIGN.md §6) */}
              <span
                className="sprite"
                style={spriteStyle(pet, pet.states.focus, 'front', 64, { animate: false, loop: true }) as CSSProperties}
              />
            </span>
            <span className="choice">
              <input type="radio" name="pet" checked={pet.id === settings.petId} onChange={() => update('petId', pet.id)} />
              {pet.name}
            </span>
          </label>
        ))}
      </div>
      <label className="row">
        Animate the pet
        <input type="checkbox" checked={settings.animatePet} onChange={(e) => update('animatePet', e.target.checked)} />
      </label>
    </fieldset>
  );
}

function ThemeSection({ settings, update }: SectionProps) {
  return (
    <fieldset className="section">
      <legend>Theme</legend>
      <div className="tiles">
        {(Object.keys(themes) as ThemeName[]).map((name) => {
          const t = themes[name];
          return (
            <label key={name} className={name === settings.theme ? 'tile selected' : 'tile'}>
              {/* A tiny egg in that theme's own colours */}
              <span className="swatch" aria-hidden="true" style={{ background: t.shell, borderColor: t.edge }}>
                <span style={{ background: t.btn }} />
              </span>
              <span className="choice">
                <input type="radio" name="theme" checked={name === settings.theme} onChange={() => update('theme', name)} />
                {name}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const timerFields: { key: keyof TimerConfig; label: string; max: number }[] = [
  { key: 'focusMin', label: 'Focus (min)', max: 180 },
  { key: 'shortBreakMin', label: 'Short break (min)', max: 60 },
  { key: 'longBreakMin', label: 'Long break (min)', max: 120 },
  { key: 'sessionsPerCycle', label: 'Sessions per cycle', max: 12 },
];

function TimerSection({ timer, onChange }: { timer: TimerConfig; onChange: (t: TimerConfig) => void }) {
  return (
    <section className="section">
      <h2>Timer</h2>
      <div className="timer-grid">
        {timerFields.map(({ key, label, max }) => (
          <NumberField key={key} label={label} min={1} max={max} value={timer[key]} onCommit={(n) => onChange({ ...timer, [key]: n })} />
        ))}
      </div>
      <p className="hint">A running session keeps its length; the next one uses the new value.</p>
    </section>
  );
}

// Lets the field hold half-typed text; only whole numbers within range are saved.
function NumberField(props: { label: string; value: number; min: number; max: number; onCommit: (n: number) => void }) {
  const { label, value, min, max, onCommit } = props;
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  return (
    <label className="row">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (Number.isInteger(n) && n >= min && n <= max && n !== value) onCommit(n);
        }}
        onBlur={() => setText(String(value))}
      />
    </label>
  );
}

function OverlaySection({ settings, update }: SectionProps) {
  return (
    <section className="section">
      <h2>Overlay</h2>
      <label className="row">
        Always on top
        <input type="checkbox" checked={settings.alwaysOnTop} onChange={(e) => update('alwaysOnTop', e.target.checked)} />
      </label>
      <label className="row">
        Lock position
        <input type="checkbox" checked={settings.lockPosition} onChange={(e) => update('lockPosition', e.target.checked)} />
      </label>
    </section>
  );
}
