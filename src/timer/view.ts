import { durationMs } from './reducer';
import type { PetStateKey, SessionKind, TimerState } from './types';

export interface TimerView {
  modeLabel: string;
  time: string; // MM:SS
  progress: number; // 0..1, share of the session still to go
  sessionsDone: number;
  sessionsPerCycle: number;
  running: boolean;
  playLabel: string; // accessible label for the play/pause button
  skipLabel: string; // "Skip to break" / "Skip to focus"
  sessionName: string; // the running or queued session: "Focus", "Break", "Long break"
  petState: PetStateKey;
  // Set when petState is a one-shot reaction: the pose to loop once it has played.
  petThen?: PetStateKey;
  petDirection: 'left' | 'front';
  // Changes on every state transition (e.g. two skips in a row), so the pet can restart its animation.
  phaseKey: string;
}

export function remainingMs(state: TimerState, now: number): number {
  if (state.status === 'running' && state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return state.remainingMs;
}

// Rounds up, so a fresh 25 minute session shows 25:00 rather than 24:59.
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const sessionNames: Record<SessionKind, string> = { focus: 'Focus', shortBreak: 'Break', longBreak: 'Long break' };

// One-line status for the tray tooltip, e.g. "Focus, 18:24 left" (docs/DESIGN.md §5).
export function trayStatus(view: TimerView): string {
  switch (view.modeLabel) {
    case 'PAUSED':
      return `Paused, ${view.time} left`;
    case 'DONE':
      return `Session done. ${view.sessionName} next`;
    case 'SKIPPED':
      return `Skipped. ${view.sessionName} next`;
    default:
      return view.running ? `${view.sessionName}, ${view.time} left` : `Ready: ${view.sessionName}, ${view.time}`;
  }
}

// What the overlay shows for a timer state (docs/DESIGN.md §2).
export function timerView(state: TimerState, now: number): TimerView {
  const isFocus = state.kind === 'focus';
  const left = remainingMs(state, now);
  const base = {
    sessionsDone: state.completedFocus,
    sessionsPerCycle: state.config.sessionsPerCycle,
    running: state.status === 'running',
    petDirection: 'left' as const,
    phaseKey: `${state.status}-${state.kind}-${state.completedFocus}`,
    skipLabel: isFocus ? 'Skip to break' : 'Skip to focus',
    sessionName: sessionNames[state.kind],
  };
  const startLabel = isFocus ? 'Start focus' : 'Start break';

  switch (state.status) {
    case 'running':
      return {
        ...base,
        modeLabel: isFocus ? 'FOCUS' : 'BREAK',
        time: formatTime(left),
        progress: left / durationMs(state.config, state.kind),
        playLabel: 'Pause',
        petState: isFocus ? 'focus' : 'break',
      };
    case 'paused':
      return {
        ...base,
        modeLabel: 'PAUSED',
        time: formatTime(left),
        progress: left / durationMs(state.config, state.kind),
        playLabel: 'Resume',
        petState: 'paused',
        petDirection: 'front',
      };
    case 'complete':
      // Shows the queued session's full time; the pet celebrates once, then takes that session's pose.
      return {
        ...base,
        modeLabel: 'DONE',
        time: formatTime(left),
        progress: 1,
        playLabel: startLabel,
        petState: 'complete',
        petThen: isFocus ? 'focus' : 'break',
      };
    case 'skipped':
      // Only skipping focus gets the hurt reaction. A skipped break queues focus, so the pet just idles.
      return {
        ...base,
        modeLabel: 'SKIPPED',
        time: formatTime(left),
        progress: 1,
        playLabel: startLabel,
        ...(isFocus ? { petState: 'focus' as const } : { petState: 'skipped' as const, petThen: 'focus' as const }),
      };
    case 'idle':
      return {
        ...base,
        modeLabel: isFocus ? 'FOCUS' : 'BREAK',
        time: formatTime(left),
        progress: 1,
        playLabel: startLabel,
        petState: 'focus',
      };
  }
}
