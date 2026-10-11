import { describe, expect, it } from 'vitest';
import { defaultConfig, initialTimerState, timerReducer } from './reducer';
import type { TimerAction, TimerState } from './types';
import { formatTime, remainingMs, timerView } from './view';

const MIN = 60_000;
const T0 = 1_000_000;

function run(actions: TimerAction[], state: TimerState = initialTimerState()): TimerState {
  return actions.reduce(timerReducer, state);
}

// Plays the current session from `at` and lets it run out.
function finishSession(state: TimerState, at: number): TimerState {
  const playing = timerReducer(state, { type: 'play', now: at });
  return timerReducer(playing, { type: 'tick', now: playing.endsAt! });
}

describe('timerReducer', () => {
  it('starts idle on a full focus session', () => {
    const s = initialTimerState();
    expect(s).toMatchObject({ kind: 'focus', status: 'idle', endsAt: null, remainingMs: 25 * MIN, completedFocus: 0 });
  });

  it('play stores the end timestamp', () => {
    const s = run([{ type: 'play', now: T0 }]);
    expect(s.status).toBe('running');
    expect(s.endsAt).toBe(T0 + 25 * MIN);
  });

  it('play while running changes nothing', () => {
    const s = run([{ type: 'play', now: T0 }]);
    expect(timerReducer(s, { type: 'play', now: T0 + MIN })).toBe(s);
  });

  it('pause freezes the time left and resume continues from it', () => {
    const paused = run([
      { type: 'play', now: T0 },
      { type: 'pause', now: T0 + 7 * MIN },
    ]);
    expect(paused).toMatchObject({ status: 'paused', endsAt: null, remainingMs: 18 * MIN });

    const resumed = timerReducer(paused, { type: 'play', now: T0 + 60 * MIN });
    expect(resumed.endsAt).toBe(T0 + 60 * MIN + 18 * MIN);
  });

  it('toggle pauses when running and plays otherwise', () => {
    const running = run([{ type: 'toggle', now: T0 }]);
    expect(running.status).toBe('running');
    expect(timerReducer(running, { type: 'toggle', now: T0 + MIN }).status).toBe('paused');
  });

  it('tick before the end changes nothing', () => {
    const s = run([{ type: 'play', now: T0 }]);
    expect(timerReducer(s, { type: 'tick', now: T0 + 25 * MIN - 1 })).toBe(s);
  });

  it('a tick long after the end still completes the session once', () => {
    // Webview timers are throttled in the background; a single late tick must be enough.
    const s = run([
      { type: 'play', now: T0 },
      { type: 'tick', now: T0 + 3 * 60 * MIN },
    ]);
    expect(s).toMatchObject({ status: 'complete', kind: 'shortBreak', completedFocus: 1 });
  });

  it('a completed focus session fills a pip and queues a short break without starting it', () => {
    const s = finishSession(initialTimerState(), T0);
    expect(s).toMatchObject({ status: 'complete', kind: 'shortBreak', endsAt: null, remainingMs: 5 * MIN, completedFocus: 1 });
  });

  it('a completed break queues the next focus session', () => {
    const s = finishSession(finishSession(initialTimerState(), T0), T0 + 30 * MIN);
    expect(s).toMatchObject({ status: 'complete', kind: 'focus', remainingMs: 25 * MIN, completedFocus: 1 });
  });

  it('the fourth focus session queues a long break, and the pips reset after it', () => {
    let s = initialTimerState();
    let t = T0;
    for (let i = 0; i < 4; i++) {
      s = finishSession(s, t); // focus
      t += 30 * MIN;
      if (i < 3) {
        s = finishSession(s, t); // short break
        t += 30 * MIN;
      }
    }
    expect(s).toMatchObject({ kind: 'longBreak', remainingMs: 15 * MIN, completedFocus: 4 });

    s = finishSession(s, t);
    expect(s).toMatchObject({ kind: 'focus', completedFocus: 0 });
  });

  it('skipping focus queues a break without filling a pip', () => {
    const s = run([{ type: 'play', now: T0 }, { type: 'skip' }]);
    expect(s).toMatchObject({ status: 'skipped', kind: 'shortBreak', endsAt: null, remainingMs: 5 * MIN, completedFocus: 0 });
  });

  it('skipping a break queues focus', () => {
    const s = run([{ type: 'skip' }], finishSession(initialTimerState(), T0));
    expect(s).toMatchObject({ status: 'skipped', kind: 'focus', completedFocus: 1 });
  });

  it('skipping the long break also resets the pips', () => {
    const atLongBreak: TimerState = { ...initialTimerState(), kind: 'longBreak', status: 'complete', completedFocus: 4 };
    expect(run([{ type: 'skip' }], atLongBreak)).toMatchObject({ kind: 'focus', completedFocus: 0 });
  });

  it('reset restarts the current session from full and stops it', () => {
    const s = run([{ type: 'play', now: T0 }, { type: 'reset' }]);
    expect(s).toMatchObject({ status: 'idle', kind: 'focus', endsAt: null, remainingMs: 25 * MIN });
  });

  it('uses the configured lengths', () => {
    const config = { ...defaultConfig, focusMin: 50, shortBreakMin: 10 };
    const s = finishSession(initialTimerState(config), T0);
    expect(initialTimerState(config).remainingMs).toBe(50 * MIN);
    expect(s.remainingMs).toBe(10 * MIN);
  });
});

describe('formatTime', () => {
  it('pads minutes and seconds', () => expect(formatTime(5 * MIN + 7_000)).toBe('05:07'));
  it('rounds partial seconds up', () => expect(formatTime(25 * MIN - 1)).toBe('25:00'));
  it('never goes negative', () => expect(formatTime(-500)).toBe('00:00'));
});

describe('remainingMs', () => {
  it('is derived from the end timestamp while running', () => {
    const s = run([{ type: 'play', now: T0 }]);
    expect(remainingMs(s, T0 + 6 * MIN + 36_000)).toBe(18 * MIN + 24_000);
  });
});

describe('timerView: the five states from docs/DESIGN.md §2', () => {
  it('Focus', () => {
    const s = run([{ type: 'play', now: T0 }]);
    expect(timerView(s, T0 + 6 * MIN + 36_000)).toMatchObject({
      modeLabel: 'FOCUS', time: '18:24', running: true, playLabel: 'Pause', petState: 'focus', petDirection: 'left',
    });
    expect(timerView(s, T0 + 6 * MIN + 36_000).progress).toBeCloseTo(0.736);
  });

  it('Break', () => {
    const s = timerReducer(finishSession(initialTimerState(), T0), { type: 'play', now: T0 + 30 * MIN });
    expect(timerView(s, T0 + 30 * MIN)).toMatchObject({
      modeLabel: 'BREAK', time: '05:00', progress: 1, running: true, playLabel: 'Pause', petState: 'break', sessionsDone: 1,
    });
  });

  it('Paused', () => {
    const s = run([
      { type: 'play', now: T0 },
      { type: 'pause', now: T0 + 7 * MIN },
    ]);
    expect(timerView(s, T0 + 99 * MIN)).toMatchObject({
      modeLabel: 'PAUSED', time: '18:00', running: false, playLabel: 'Resume', petState: 'paused', petDirection: 'front',
    });
  });

  it('Session complete shows the next session in full; the pet celebrates, then takes the break pose', () => {
    const s = finishSession(initialTimerState(), T0);
    expect(timerView(s, T0 + 25 * MIN)).toMatchObject({
      modeLabel: 'DONE', time: '05:00', progress: 1, running: false, playLabel: 'Start break',
      petState: 'complete', petThen: 'break', sessionsDone: 1,
    });
  });

  it('a completed break shows the next focus in full; the pet celebrates, then idles', () => {
    const s = finishSession(finishSession(initialTimerState(), T0), T0 + 30 * MIN);
    expect(timerView(s, T0 + 60 * MIN)).toMatchObject({
      modeLabel: 'DONE', time: '25:00', playLabel: 'Start focus', petState: 'complete', petThen: 'focus',
    });
  });

  it('the fourth focus session shows the long break in full', () => {
    const atLast: TimerState = { ...initialTimerState(), completedFocus: 3 };
    expect(timerView(finishSession(atLast, T0), T0 + 25 * MIN)).toMatchObject({ modeLabel: 'DONE', time: '15:00', petThen: 'break' });
  });

  it('Session skipped (focus) shows the next full session and the hurt reaction', () => {
    const s = run([{ type: 'play', now: T0 }, { type: 'skip' }]);
    expect(timerView(s, T0)).toMatchObject({
      modeLabel: 'SKIPPED', time: '05:00', progress: 1, running: false, playLabel: 'Start break', petState: 'skipped', petThen: 'focus',
    });
  });

  it('skipping a break shows SKIPPED without the hurt reaction', () => {
    const s = run([{ type: 'skip' }], finishSession(initialTimerState(), T0));
    expect(timerView(s, T0)).toMatchObject({
      modeLabel: 'SKIPPED', time: '25:00', progress: 1, running: false, playLabel: 'Start focus', petState: 'focus',
    });
    expect(timerView(s, T0).petThen).toBeUndefined();
  });

  it('skipping the long break shows no hurt reaction either', () => {
    const atLongBreak: TimerState = { ...initialTimerState(), kind: 'longBreak', status: 'complete', completedFocus: 4 };
    expect(timerView(run([{ type: 'skip' }], atLongBreak), T0).petState).toBe('focus');
  });

  it('phaseKey changes on every transition, including two skips in a row', () => {
    const once = run([{ type: 'skip' }]);
    const twice = timerReducer(once, { type: 'skip' });
    expect(timerView(once, T0).phaseKey).not.toBe(timerView(twice, T0).phaseKey);
    expect(timerView(initialTimerState(), T0).phaseKey).not.toBe(timerView(run([{ type: 'play', now: T0 }]), T0).phaseKey);
  });

  it('idle before the first session', () => {
    expect(timerView(initialTimerState(), T0)).toMatchObject({
      modeLabel: 'FOCUS', time: '25:00', progress: 1, running: false, playLabel: 'Start focus', petState: 'focus', sessionsDone: 0,
    });
  });
});
