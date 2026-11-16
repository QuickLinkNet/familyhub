import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { appThemeBundles } from '../../theme/appTheme';
import { defaultThemePresetId, themePresets, type ThemePresetId } from '../../theme/presets';
import type { ColorSchemeName } from '../../theme/tokens/types';

export type AppearancePreference = 'system' | ColorSchemeName;
export type PresentationMode = 'standard' | 'wall';

interface AppearanceScopeOptions {
  scheme?: ColorSchemeName;
  presentation?: PresentationMode;
}

interface AppearanceContextValue {
  preference: AppearancePreference;
  presetId: ThemePresetId;
  presentation: PresentationMode;
  effectiveScheme: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
  setPresetId: (presetId: ThemePresetId) => void;
  registerScope: (options: AppearanceScopeOptions) => () => void;
}

interface RegisteredScope extends AppearanceScopeOptions {
  id: symbol;
}

const preferenceStorageKey = 'familyhub:appearance';
const presetStorageKey = 'familyhub:theme-preset';
const muiModeStorageKey = 'familyhub:mui-color-scheme';
const validPreferences: AppearancePreference[] = ['system', 'light', 'dark', 'night'];
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function readPreference(): AppearancePreference {
  try {
    const stored = localStorage.getItem(preferenceStorageKey) as AppearancePreference | null;
    return stored && validPreferences.includes(stored) ? stored : 'light';
  } catch {
    return 'light';
  }
}

function readPresetId(): ThemePresetId {
  try {
    const stored = localStorage.getItem(presetStorageKey) as ThemePresetId | null;
    return stored && stored in themePresets ? stored : defaultThemePresetId;
  } catch {
    return defaultThemePresetId;
  }
}

function ColorSchemeSync({ mode }: { mode: Exclude<AppearancePreference, 'night'> }) {
  const { setMode } = useColorScheme();
  useEffect(() => setMode(mode), [mode, setMode]);
  return null;
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<AppearancePreference>(readPreference);
  const [presetId, setPresetIdState] = useState<ThemePresetId>(readPresetId);
  const [scopes, setScopes] = useState<RegisteredScope[]>([]);
  const activeScope = scopes.at(-1);
  const effectiveScheme = activeScope?.scheme ?? preference;
  const presentation = activeScope?.presentation ?? 'standard';
  const bundle = appThemeBundles[presetId];
  const theme = effectiveScheme === 'night' ? bundle.night : bundle.standard;

  const setPreference = useCallback((next: AppearancePreference) => {
    setPreferenceState(next);
    try { localStorage.setItem(preferenceStorageKey, next); } catch { /* Storage darf blockiert sein. */ }
  }, []);

  const setPresetId = useCallback((next: ThemePresetId) => {
    setPresetIdState(next);
    try { localStorage.setItem(presetStorageKey, next); } catch { /* Storage darf blockiert sein. */ }
  }, []);

  const registerScope = useCallback((options: AppearanceScopeOptions) => {
    const id = Symbol('appearance-scope');
    setScopes(current => [...current, { id, ...options }]);
    return () => setScopes(current => current.filter(scope => scope.id !== id));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.familyhubPreset = presetId;
    root.dataset.familyhubScheme = effectiveScheme;
    root.dataset.familyhubPresentation = presentation;
  }, [effectiveScheme, presentation, presetId]);

  const value = useMemo<AppearanceContextValue>(() => ({
    preference,
    presetId,
    presentation,
    effectiveScheme,
    setPreference,
    setPresetId,
    registerScope
  }), [effectiveScheme, preference, presentation, presetId, registerScope, setPreference, setPresetId]);

  const standardMode = effectiveScheme === 'night' ? 'dark' : effectiveScheme;

  return (
    <AppearanceContext.Provider value={value}>
      <ThemeProvider theme={theme} defaultMode={standardMode} modeStorageKey={muiModeStorageKey}>
        {effectiveScheme !== 'night' && <ColorSchemeSync mode={effectiveScheme} />}
        {children}
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
}

export function AppearanceScope({ children, ...options }: AppearanceScopeOptions & { children: ReactNode }) {
  const { registerScope } = useAppearance();
  useEffect(() => registerScope(options), [options.presentation, options.scheme, registerScope]);
  return children;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance muss innerhalb des AppearanceProvider verwendet werden.');
  return context;
}
