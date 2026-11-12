import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors, shadows } from '@/theme/colors';
import { typography } from '@/theme/fonts';

const logo = require('../../assets/logo.png');

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
  onPress?: () => void;
}

export function BrandLogo({ size = 'md', showText = true, lightText = false, onPress }: BrandLogoProps) {
  const markDimensions = size === 'sm' ? 30 : size === 'lg' ? 48 : 36;
  const fontSize = size === 'sm' ? 17 : size === 'lg' ? 26 : 20;

  const content = (
    <View style={styles.container}>
      {/* Brand mark from assets/logo.png */}
      <View style={[styles.mark, { width: markDimensions, height: markDimensions, borderRadius: markDimensions / 4 }]}>
        <Image source={logo} style={{ width: markDimensions, height: markDimensions }} />
      </View>

      {showText && (
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.brandText,
              { fontSize, color: lightText ? '#ffffff' : colors.text },
            ]}
          >
            Barber Hub
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pressable: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
  textWrap: {
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: typography.fraunces,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
});
