import { Platform } from 'react-native';

export const typography = {
  // Heading / Brand font: Fraunces serif (matching MVC)
  fraunces: Platform.select({
    web: "'Fraunces', Georgia, serif",
    ios: 'Fraunces_700Bold',
    android: 'Fraunces_700Bold',
    default: 'serif',
  }),
  frauncesSemiBold: Platform.select({
    web: "'Fraunces', Georgia, serif",
    ios: 'Fraunces_600SemiBold',
    android: 'Fraunces_600SemiBold',
    default: 'serif',
  }),

  // Body / UI font: Plus Jakarta Sans (matching MVC)
  body: Platform.select({
    web: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    ios: 'PlusJakartaSans_400Regular',
    android: 'PlusJakartaSans_400Regular',
    default: 'sans-serif',
  }),
  bodyMedium: Platform.select({
    web: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    ios: 'PlusJakartaSans_500Medium',
    android: 'PlusJakartaSans_500Medium',
    default: 'sans-serif',
  }),
  bodySemiBold: Platform.select({
    web: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    ios: 'PlusJakartaSans_600SemiBold',
    android: 'PlusJakartaSans_600SemiBold',
    default: 'sans-serif',
  }),
  bodyBold: Platform.select({
    web: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    ios: 'PlusJakartaSans_700Bold',
    android: 'PlusJakartaSans_700Bold',
    default: 'sans-serif',
  }),
  bodyExtraBold: Platform.select({
    web: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    ios: 'PlusJakartaSans_800ExtraBold',
    android: 'PlusJakartaSans_800ExtraBold',
    default: 'sans-serif',
  }),
};
