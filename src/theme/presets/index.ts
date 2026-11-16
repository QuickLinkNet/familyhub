import { currentPreset } from './current';
import { morgenruhePreset } from './morgenruhe';

export const themePresets = {
  current: currentPreset,
  morgenruhe: morgenruhePreset
} as const;

export type ThemePresetId = keyof typeof themePresets;
export const defaultThemePresetId: ThemePresetId = 'current';
