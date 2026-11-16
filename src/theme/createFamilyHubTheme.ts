import { alpha, createTheme, type PaletteMode, type PaletteOptions, type ThemeOptions } from '@mui/material/styles';
import type { SemanticColorTokens, ThemePreset } from './tokens/types';

function paletteFrom(tokens: SemanticColorTokens, mode: PaletteMode): PaletteOptions {
  return {
    mode,
    primary: {
      main: tokens.action.primary,
      dark: tokens.action.primaryDark,
      light: tokens.action.primarySoft,
      contrastText: tokens.action.onPrimary
    },
    secondary: { main: tokens.accent.clay, dark: tokens.accent.clayDark, light: tokens.accent.claySoft },
    background: {
      default: tokens.background.canvas,
      paper: tokens.background.surface,
      subtle: tokens.background.subtle,
      elevated: tokens.background.elevated
    },
    text: { primary: tokens.text.primary, secondary: tokens.text.secondary },
    divider: tokens.border.divider,
    success: { main: tokens.status.success },
    warning: { main: tokens.status.warning },
    error: { main: tokens.status.error },
    info: { main: tokens.status.info },
    action: {
      selected: alpha(tokens.action.primary, mode === 'light' ? 0.1 : 0.16),
      hover: alpha(tokens.action.primary, mode === 'light' ? 0.06 : 0.1)
    },
    accent: { clay: tokens.accent.clay },
    border: { strong: tokens.border.strong },
    focus: { ring: tokens.focus.ring }
  };
}

function sharedOptions(preset: ThemePreset): ThemeOptions {
  const weights = preset.typography.headingWeights;
  return {
    typography: {
      fontFamily: preset.typography.fontFamily,
      h3: { fontWeight: weights?.h3 ?? preset.typography.headingWeight, letterSpacing: '-0.04em' },
      h4: { fontWeight: weights?.h4 ?? preset.typography.headingWeight, letterSpacing: '-0.035em' },
      h5: { fontWeight: weights?.h5 ?? preset.typography.headingWeight, letterSpacing: '-0.025em' },
      h6: { fontWeight: weights?.h6 ?? preset.typography.headingWeight }
    },
    shape: { borderRadius: preset.radius.md },
    familyHub: {
      presetId: preset.id,
      availableSchemes: ['light', 'dark', 'night'],
      radius: preset.radius,
      touchTarget: preset.touchTarget,
      motion: preset.motion,
      shadow: preset.shadow
    },
    transitions: {
      duration: {
        shortest: preset.motion.fast,
        shorter: preset.motion.fast,
        short: preset.motion.normal,
        standard: preset.motion.normal,
        complex: preset.motion.slow,
        enteringScreen: preset.motion.normal,
        leavingScreen: preset.motion.fast
      },
      easing: {
        easeInOut: preset.motion.easing,
        easeOut: preset.motion.easing,
        easeIn: preset.motion.easing,
        sharp: preset.motion.easing
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: preset.touchTarget,
            borderRadius: preset.radius.sm,
            textTransform: 'none',
            fontWeight: 700
          }
        }
      },
      MuiIconButton: {
        styleOverrides: { root: { minWidth: preset.touchTarget, minHeight: preset.touchTarget } }
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: preset.radius.lg, boxShadow: preset.shadow.card } }
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: preset.radius.xl, boxShadow: preset.shadow.floating } }
      },
      MuiTextField: { defaultProps: { fullWidth: true } },
      MuiBottomNavigationAction: {
        styleOverrides: { root: { minWidth: 64, minHeight: 64 } }
      },
      MuiCssBaseline: {
        styleOverrides: {
          '*:focus-visible': {
            outline: '3px solid var(--mui-palette-focus-ring)',
            outlineOffset: 2
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              scrollBehavior: 'auto !important',
              transitionDuration: '0.01ms !important'
            }
          }
        }
      }
    }
  };
}

export interface FamilyHubThemeBundle {
  standard: ReturnType<typeof createTheme>;
  night: ReturnType<typeof createTheme>;
}

export function createFamilyHubTheme(preset: ThemePreset): FamilyHubThemeBundle {
  const shared = sharedOptions(preset);
  const standard = createTheme({
    ...shared,
    cssVariables: { colorSchemeSelector: 'data' },
    defaultColorScheme: 'light',
    colorSchemes: {
      light: { palette: paletteFrom(preset.schemes.light, 'light') },
      dark: { palette: paletteFrom(preset.schemes.dark, 'dark') }
    }
  });
  const night = createTheme({
    ...shared,
    cssVariables: true,
    palette: paletteFrom(preset.schemes.night, 'dark')
  });

  return { standard, night };
}
