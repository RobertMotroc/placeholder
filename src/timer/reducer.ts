import type { SessionKind, TimerAction, TimerConfig, TimerState } from './types';

export const defaultConfig: TimerConfig = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  sessionsPerCycle: 4,
};

export function durationMs(config: TimerConfig, kind: SessionKind): number {
  const minutes = kind === 'focus' ? config.focusMin : kind === 'shortBreak' ? config.shortBreakMin : config.longBreakMin;
  return minutes * 60_000;
}

export function initialTimerState(config: TimerConfig = defaultConfig): TimerState {
  return {
    config,
    kind: 'focus',
    status: 'idle',
    endsAt: null,
    remainingMs: durationMs(config, 'focus'),
    completedFocus: 0,
  };
}

// Ends the current session and queues the next one. It does not start: the user presses play.
// Only a completed focus session fills a pip; the pips reset once a long break is over.
function advance(state: TimerState, status: 'complete' | 'skipped'): TimerState {
  let completedFocus = state.completedFocus;
  if (state.kind === 'focus' && status === 'complete') completedFocus += 1;
  if (state.kind === 'longBreak') completedFocus = 0;

  const kind: SessionKind =
    state.kind !== 'focus' ? 'focus' : completedFocus >= state.config.sessionsPerCycle ? 'longBreak' : 'shortBreak';

  return {
    ...state,
    kind,
    status,
    endsAt: null,
    remainingMs: durationMs(state.config, kind),
    completedFocus,
  };
}

function play(state: TimerState, now: number): TimerState {
  if (state.status === 'running') return state;
  return { ...state, status: 'running', endsAt: now + state.remainingMs };
}

function pause(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.endsAt === null) return state;
  return { ...state, status: 'paused', endsAt: null, remainingMs: Math.max(0, state.endsAt - now) };
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'play':
      return play(state, action.now);
    case 'pause':
      return pause(state, action.now);
    case 'toggle':
      return state.status === 'running' ? pause(state, action.now) : play(state, action.now);
    case 'tick':
      // Remaining time is derived from endsAt, so a late or throttled tick still lands correctly.
      if (state.status === 'running' && state.endsAt !== null && action.now >= state.endsAt) {
        return advance(state, 'complete');
      }
      return state;
    case 'skip':
      return advance(state, 'skipped');
    case 'reset':
      return { ...state, status: 'idle', endsAt: null, remainingMs: durationMs(state.config, state.kind) };
  }
}
