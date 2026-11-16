import type { ColorSchemeName } from './tokens/types';

declare module '@mui/material/styles' {
  interface TypeBackground {
    subtle: string;
    elevated: string;
  }

  interface Palette {
    accent: { clay: string };
    border: { strong: string };
    focus: { ring: string };
  }

  interface PaletteOptions {
    accent?: { clay: string };
    border?: { strong: string };
    focus?: { ring: string };
  }

  interface Theme {
    familyHub: {
      presetId: string;
      availableSchemes: readonly ColorSchemeName[];
      radius: { xs: number; sm: number; md: number; lg: number; xl: number; pill: number };
      touchTarget: number;
      motion: { fast: number; normal: number; slow: number; easing: string };
      shadow: { card: string; floating: string };
    };
  }

  interface ThemeOptions {
    familyHub?: Theme['familyHub'];
  }
}

export {};
