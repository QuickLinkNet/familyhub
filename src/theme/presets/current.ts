import type { ThemePreset } from '../tokens/types';
import { morgenruhePreset } from './morgenruhe';

export const currentPreset: ThemePreset = {
  ...morgenruhePreset,
  id: 'current',
  label: 'FamilyHub Classic',
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headingWeight: 750,
    headingWeights: { h3: 750, h4: 750, h5: 720, h6: 700 }
  },
  schemes: {
    ...morgenruhePreset.schemes,
    light: {
      background: { canvas: '#F7F4EE', surface: '#FFFFFF', subtle: '#F1F5F1', elevated: '#FFFFFF' },
      text: { primary: '#203129', secondary: '#64736B' },
      action: { primary: '#345B48', primaryDark: '#254434', primarySoft: '#DCE9DF', onPrimary: '#FFFFFF' },
      accent: { clay: '#D6855F', clayDark: '#A84E2B', claySoft: '#F8DFD3' },
      border: { strong: '#7B9084', divider: 'rgba(32, 49, 41, 0.12)' },
      focus: { ring: '#205D95' },
      status: { success: '#4F8A62', warning: '#CB8B33', error: '#D32F2F', info: '#0288D1' }
    }
  },
  radius: { xs: 6, sm: 14, md: 14, lg: 22, xl: 26, pill: 999 }
};
