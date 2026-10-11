import { initialTimerState, timerReducer } from './reducer';
import type { TimerAction, TimerConfig, TimerState } from './types';

const MIN = 60_000;

// Builds each display state through real actions, for checking the overlay by eye in dev.
export function demoTimerState(name: string, config: TimerConfig, now: number): TimerState | null {
  const start = initialTimerState(config);
  const apply = (actions: TimerAction[], s: TimerState = start) => actions.reduce(timerReducer, s);
  const finished = (s: TimerState) => {
    const running = timerReducer(s, { type: 'play', now: now - 60 * MIN });
    return timerReducer(running, { type: 'tick', now: running.endsAt! });
  };

  switch (name) {
    case 'focus':
      return apply([{ type: 'play', now: now - 6 * MIN - 36_000 }], finished(finished(finished(finished(start)))));
    case 'break':
      return apply([{ type: 'play', now: now - 2 * MIN }], finished(start));
    case 'paused':
      return apply([
        { type: 'play', now: now - 7 * MIN },
        { type: 'pause', now },
      ]);
    case 'complete':
      return finished(finished(finished(start)));
    case 'skipped':
      return apply([{ type: 'play', now }, { type: 'skip' }]);
    default:
      return null;
  }
}
