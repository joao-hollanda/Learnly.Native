export const Colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#eff6ff',
  primaryBorder: '#bfdbfe',

  danger: '#ef4444',
  dangerDark: '#dc2626',
  dangerLight: '#fff0f1',
  dangerBorder: '#fecaca',

  success: '#22c55e',
  successDark: '#16a34a',
  successLight: '#f0fdf4',
  successBorder: '#bbf7d0',

  warning: '#f59e0b',
  warningLight: '#fffbeb',
  warningBorder: '#fde68a',

  // Neutros
  background: '#f4f6f8',
  surface: '#ffffff',
  border: '#e9edf2',
  borderMedium: '#cbd5e1',

  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textPlaceholder: '#94a3b8',

  // Status de evento
  eventConcluido: '#22c55e',
  eventAtual: '#3b82f6',
  eventProximo: '#ef4444',
};

export const Typography = {
  fontPrimary: 'System', // Expo carrega Inter via expo-font; fallback System
  fontSecondary: 'System',

  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 28,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
};
