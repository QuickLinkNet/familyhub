import { createTheme } from '@mui/material/styles';
import { designTokens } from './designTokens';

const { color, radius, shadow, touchTarget } = designTokens;

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: color.forest, dark: color.forestDark, light: color.forestSoft, contrastText: '#ffffff' },
    secondary: { main: color.terracotta, light: color.terracottaSoft, dark: color.terracottaDark },
    background: { default: color.canvas, paper: color.paper },
    text: { primary: color.ink, secondary: color.inkMuted },
    success: { main: color.success },
    warning: { main: color.warning },
    divider: designTokens.surface.border
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: { fontWeight: 750, letterSpacing: '-0.04em' },
    h4: { fontWeight: 750, letterSpacing: '-0.035em' },
    h5: { fontWeight: 720, letterSpacing: '-0.025em' },
    h6: { fontWeight: 700 }
  },
  shape: { borderRadius: radius.control },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: touchTarget, borderRadius: radius.control, textTransform: 'none', fontWeight: 700 } } },
    MuiIconButton: { styleOverrides: { root: { minWidth: touchTarget, minHeight: touchTarget } } },
    MuiCard: { styleOverrides: { root: { borderRadius: radius.card, boxShadow: shadow.card } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: radius.dialog, boxShadow: shadow.floating } } },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiBottomNavigationAction: { styleOverrides: { root: { minWidth: 64, minHeight: 64 } } }
  }
});
