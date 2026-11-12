import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

/**
 * Wraps a screen that hides the navigation header so its content starts below the
 * status bar / camera cutout (Android draws edge-to-edge).
 */
export function withSafeTop<P extends object>(Screen: React.ComponentType<P>) {
  function SafeTopScreen(props: P) {
    const insets = useSafeAreaInsets();
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
        <Screen {...props} />
      </View>
    );
  }
  SafeTopScreen.displayName = `withSafeTop(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return SafeTopScreen;
}
