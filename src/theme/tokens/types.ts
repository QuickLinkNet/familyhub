export type ColorSchemeName = 'light' | 'dark' | 'night';

export interface SemanticColorTokens {
  background: { canvas: string; surface: string; subtle: string; elevated: string };
  text: { primary: string; secondary: string };
  action: { primary: string; primaryDark: string; primarySoft: string; onPrimary: string };
  accent: { clay: string; clayDark: string; claySoft: string };
  border: { strong: string; divider: string };
  focus: { ring: string };
  status: { success: string; warning: string; error: string; info: string };
}

export interface ThemePreset {
  id: string;
  label: string;
  typography: {
    fontFamily: string;
    headingWeight: number;
    headingWeights?: { h3: number; h4: number; h5: number; h6: number };
  };
  schemes: Record<ColorSchemeName, SemanticColorTokens>;
  radius: { xs: number; sm: number; md: number; lg: number; xl: number; pill: number };
  touchTarget: number;
  motion: { fast: number; normal: number; slow: number; easing: string };
  shadow: { card: string; floating: string };
}
