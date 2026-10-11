import type { Theme } from './themes';

// Exposes every theme token as a CSS custom property on :root, e.g. `shell` -> `--shell`.
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  for (const [key, value] of Object.entries(theme)) {
    if (key === 'name') continue;
    root.style.setProperty(`--${key}`, value);
  }
  root.dataset.theme = theme.name;
}
