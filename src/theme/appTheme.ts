import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#345b48', dark: '#254434', light: '#dce9df', contrastText: '#ffffff' },
    secondary: { main: '#d6855f', light: '#f8dfd3', dark: '#a84e2b' },
    background: { default: '#f7f4ee', paper: '#ffffff' },
    text: { primary: '#203129', secondary: '#64736b' },
    success: { main: '#4f8a62' },
    warning: { main: '#cb8b33' }
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: { fontWeight: 750, letterSpacing: '-0.04em' },
    h4: { fontWeight: 750, letterSpacing: '-0.035em' },
    h5: { fontWeight: 720, letterSpacing: '-0.025em' },
    h6: { fontWeight: 700 }
  },
  shape: { borderRadius: 18 },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: 48, borderRadius: 14, textTransform: 'none', fontWeight: 700 } } },
    MuiIconButton: { styleOverrides: { root: { minWidth: 48, minHeight: 48 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 22, boxShadow: '0 8px 24px rgba(38, 68, 52, 0.08)' } } },
    MuiBottomNavigationAction: { styleOverrides: { root: { minWidth: 64, minHeight: 64 } } }
  }
});
