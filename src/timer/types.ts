export type SessionKind = 'focus' | 'shortBreak' | 'longBreak';

// idle: not started yet (or reset). complete/skipped: the next session is queued and waits for play.
export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete' | 'skipped';

// Which of the five display states the pet should act out (keys of a pet manifest's `states`).
export type PetStateKey = 'focus' | 'break' | 'complete' | 'skipped' | 'paused';

export interface TimerConfig {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsPerCycle: number;
}

export interface TimerState {
  config: TimerConfig;
  kind: SessionKind; // the running session, or the one queued to start next
  status: TimerStatus;
  endsAt: number | null; // epoch ms; set only while running
  remainingMs: number; // frozen time left when not running
  completedFocus: number; // focus sessions finished in this cycle; fills the pips
}

// Every action that depends on time carries `now`, so the reducer stays pure and testable.
export type TimerAction =
  | { type: 'play'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'toggle'; now: number }
  | { type: 'tick'; now: number }
  | { type: 'skip' }
  | { type: 'reset' };
