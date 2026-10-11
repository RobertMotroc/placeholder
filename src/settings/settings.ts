import { defaultConfig } from '../timer/reducer';
import type { TimerConfig } from '../timer/types';
import { defaultTheme, type ThemeName } from '../theme/themes';
import { defaultPetId } from '../pets/registry';

// Everything the user can change that survives a restart. The settings window (milestone 5) edits these.
export interface Settings {
  petId: string;
  theme: ThemeName;
  timer: TimerConfig;
  alwaysOnTop: boolean;
  lockPosition: boolean;
  animatePet: boolean;
}

export const defaultSettings: Settings = {
  petId: defaultPetId,
  theme: defaultTheme,
  timer: defaultConfig,
  alwaysOnTop: true,
  lockPosition: false,
  animatePet: true,
};

export type SettingKey = keyof Settings;
