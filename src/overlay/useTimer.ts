import { useCallback, useEffect, useReducer, useState } from 'react';
import { demoTimerState } from '../timer/demo';
import { defaultConfig, initialTimerState, timerReducer } from '../timer/reducer';
import type { TimerConfig, TimerState } from '../timer/types';
import { timerView } from '../timer/view';

const TICK_MS = 250;

function init(config: TimerConfig): TimerState {
  // Dev only: `?demo=focus|break|paused|complete|skipped` opens straight into that state.
  if (import.meta.env.DEV) {
    const demo = new URLSearchParams(window.location.search).get('demo');
    if (demo) return demoTimerState(demo, config, Date.now()) ?? initialTimerState(config);
  }
  return initialTimerState(config);
}

export function useTimer(config: TimerConfig = defaultConfig) {
  const [state, dispatch] = useReducer(timerReducer, config, init);
  const [now, setNow] = useState(() => Date.now());

  // Timer lengths changed in the settings window.
  useEffect(() => dispatch({ type: 'configure', config }), [config]);

  // Ticks only re-read the clock; time left is always endsAt - Date.now(), so throttled ticks don't drift.
  useEffect(() => {
    if (state.status !== 'running') return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      dispatch({ type: 'tick', now: t });
    };
    const id = window.setInterval(tick, TICK_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [state.status]);

  const playPause = useCallback(() => {
    const t = Date.now();
    setNow(t);
    dispatch({ type: 'toggle', now: t });
  }, []);
  const skip = useCallback(() => dispatch({ type: 'skip' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { view: timerView(state, now), playPause, skip, reset };
}
