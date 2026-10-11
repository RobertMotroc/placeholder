import { durationMs } from './reducer';
import type { PetStateKey, TimerState } from './types';

export interface TimerView {
  modeLabel: string;
  time: string; // MM:SS
  progress: number; // 0..1, share of the session still to go
  sessionsDone: number;
  sessionsPerCycle: number;
  running: boolean;
  playLabel: string; // accessible label for the play/pause button
  petState: PetStateKey;
  petDirection: 'left' | 'back';
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

// What the overlay shows for a timer state (docs/DESIGN.md §2).
export function timerView(state: TimerState, now: number): TimerView {
  const isFocus = state.kind === 'focus';
  const left = remainingMs(state, now);
  const base = {
    sessionsDone: state.completedFocus,
    sessionsPerCycle: state.config.sessionsPerCycle,
    running: state.status === 'running',
    petDirection: 'left' as const,
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
        petDirection: 'back',
      };
    case 'complete':
      return { ...base, modeLabel: 'DONE', time: '00:00', progress: 0, playLabel: startLabel, petState: 'complete' };
    case 'skipped':
      return { ...base, modeLabel: 'SKIPPED', time: formatTime(left), progress: 1, playLabel: startLabel, petState: 'skipped' };
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
