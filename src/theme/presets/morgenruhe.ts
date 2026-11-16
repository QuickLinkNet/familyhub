import type { ThemePreset } from '../tokens/types';

export const morgenruhePreset: ThemePreset = {
  id: 'morgenruhe',
  label: 'Morgenruhe',
  typography: {
    fontFamily: '"DM Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headingWeight: 600
  },
  schemes: {
    light: {
      background: { canvas: '#F7F5EF', surface: '#FFFFFF', subtle: '#EFF3EE', elevated: '#FFFFFF' },
      text: { primary: '#253632', secondary: '#52635C' },
      action: { primary: '#2F6C60', primaryDark: '#245449', primarySoft: '#D9EAE3', onPrimary: '#FFFFFF' },
      accent: { clay: '#A6503B', clayDark: '#7F3D2D', claySoft: '#F1D8D0' },
      border: { strong: '#7B9084', divider: '#D7DED6' },
      focus: { ring: '#205D95' },
      status: { success: '#3F745B', warning: '#9A651D', error: '#B33F35', info: '#356A8A' }
    },
    dark: {
      background: { canvas: '#182522', surface: '#21322E', subtle: '#294039', elevated: '#30463F' },
      text: { primary: '#F5F5EE', secondary: '#C4D0C7' },
      action: { primary: '#9BCFB8', primaryDark: '#72AA92', primarySoft: '#2B4A3F', onPrimary: '#142D26' },
      accent: { clay: '#F2C18A', clayDark: '#C8945E', claySoft: '#4B3B2D' },
      border: { strong: '#82968C', divider: '#455B51' },
      focus: { ring: '#B5DBFF' },
      status: { success: '#92C7A8', warning: '#EDC27A', error: '#F0A098', info: '#9CCAE5' }
    },
    night: {
      background: { canvas: '#101915', surface: '#18231E', subtle: '#202F28', elevated: '#253830' },
      text: { primary: '#E9EFE5', secondary: '#BAC7B9' },
      action: { primary: '#B5DABE', primaryDark: '#88B593', primarySoft: '#294438', onPrimary: '#102117' },
      accent: { clay: '#E8CF9D', clayDark: '#B49A68', claySoft: '#433B2B' },
      border: { strong: '#899B8A', divider: '#3D5146' },
      focus: { ring: '#C7D9F9' },
      status: { success: '#A2CEAE', warning: '#E7C98A', error: '#E9AAA2', info: '#A9CCE2' }
    }
  },
  radius: { xs: 6, sm: 10, md: 16, lg: 20, xl: 28, pill: 999 },
  touchTarget: 48,
  motion: { fast: 120, normal: 180, slow: 240, easing: 'cubic-bezier(.2, 0, 0, 1)' },
  shadow: {
    card: '0 8px 24px rgba(38, 68, 52, 0.08)',
    floating: '0 18px 46px rgba(38, 68, 52, 0.16)'
  }
};
