export const colors = {
  // MVC BarberHub Pink/Coral Theme Palette
  primary: '#ef5b5b',
  primaryDark: '#d94545',
  primarySoft: '#fce8e8',
  primaryTint: '#fff5f5',
  primaryBorder: '#f8d5d5',
  
  // Warm Accent
  accent: '#f9a826',
  accentSoft: '#fef3c7',
  
  // Surfaces & Backgrounds
  background: '#faf7f5',
  surface: '#ffffff',
  surfaceSoft: '#fdfbf9',
  
  // Typography
  text: '#1a1d29',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  textLight: '#ffffff',
  
  // Borders & Dividers
  border: '#f0ebe7',
  borderLight: '#f7f4f2',
  borderFocus: '#ef5b5b',
  
  // Feedback states
  success: '#16a34a',
  successSoft: '#dcfce7',
  successText: '#15803d',
  
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  warningText: '#b45309',
  
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
  dangerText: '#b91c1c',
  
  info: '#3b82f6',
  infoSoft: '#eff6ff',
  infoText: '#1d4ed8',
  
  // Gradients
  heroGradient: ['#1a1d29', '#2d1b3d'] as const,
  brandGradient: ['#ef5b5b', '#f9a826'] as const,
  primaryGradient: ['#ef5b5b', '#d94545'] as const,
  softGradient: ['#fff5f5', '#fce8e8'] as const,
};

export const shadows = {
  sm: {
    shadowColor: '#1a1d29',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#1a1d29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1a1d29',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryGlow: {
    shadowColor: '#ef5b5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
};

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const theme = {
  colors,
  shadows,
  borderRadius,
};

export default theme;
