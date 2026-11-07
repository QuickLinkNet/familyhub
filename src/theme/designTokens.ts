export const designTokens = {
  color: {
    forest: '#345b48',
    forestDark: '#254434',
    forestSoft: '#dce9df',
    terracotta: '#d6855f',
    terracottaDark: '#a84e2b',
    terracottaSoft: '#f8dfd3',
    canvas: '#f7f4ee',
    paper: '#ffffff',
    ink: '#203129',
    inkMuted: '#64736b',
    success: '#4f8a62',
    warning: '#cb8b33'
  },
  radius: {
    control: 14,
    card: 22,
    dialog: 26
  },
  touchTarget: 48,
  shadow: {
    card: '0 8px 24px rgba(38, 68, 52, 0.08)',
    floating: '0 18px 46px rgba(38, 68, 52, 0.16)'
  },
  surface: {
    selected: 'rgba(52, 91, 72, 0.10)',
    warm: 'rgba(214, 133, 95, 0.10)',
    border: 'rgba(32, 49, 41, 0.12)'
  }
} as const;
