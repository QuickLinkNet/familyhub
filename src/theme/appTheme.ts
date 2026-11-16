import { createFamilyHubTheme } from './createFamilyHubTheme';
import { defaultThemePresetId, themePresets } from './presets';

export const appThemeBundles = {
  current: createFamilyHubTheme(themePresets.current),
  morgenruhe: createFamilyHubTheme(themePresets.morgenruhe)
};

export const appThemes = appThemeBundles[defaultThemePresetId];

// Compatibility export for code that still imports the original single theme.
export const appTheme = appThemes.standard;
