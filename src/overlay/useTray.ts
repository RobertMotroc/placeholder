import { useEffect, useRef } from 'react';
import { createTray, type TrayActions, type TrayController, type TrayModel } from '../lib/tray';
import { pets } from '../pets/registry';

// Creates the tray once for the lifetime of the overlay and keeps it in sync with `model`.
// The tray always calls the latest `actions`, so callers can pass fresh closures each render.
export function useTray(model: TrayModel, actions: TrayActions): void {
  const actionsRef = useRef(actions);
  const modelRef = useRef(model);
  const controller = useRef<TrayController | null>(null);

  useEffect(() => {
    actionsRef.current = actions;
    modelRef.current = model;
    controller.current?.update(model);
  });

  useEffect(() => {
    let disposed = false;
    const call = <K extends keyof TrayActions>(k: K) =>
      ((...args: Parameters<TrayActions[K]>) => (actionsRef.current[k] as (...a: typeof args) => void)(...args)) as TrayActions[K];
    const proxy: TrayActions = {
      playPause: call('playPause'),
      skip: call('skip'),
      reset: call('reset'),
      toggleOverlay: call('toggleOverlay'),
      setAlwaysOnTop: call('setAlwaysOnTop'),
      setLockPosition: call('setLockPosition'),
      setPet: call('setPet'),
      quit: call('quit'),
    };

    const created = createTray(proxy, pets.map(({ id, name }) => ({ id, name })));
    created
      .then((c) => {
        if (disposed) return;
        controller.current = c;
        c.update(modelRef.current);
      })
      .catch((err) => console.error('creating tray failed', err));

    return () => {
      disposed = true;
      controller.current = null;
      created.then((c) => c.close()).catch(() => undefined);
    };
  }, []);
}
