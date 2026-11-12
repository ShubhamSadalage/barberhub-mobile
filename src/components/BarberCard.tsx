import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import type { BarberCardDto } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

export function BarberCard({ barber, onPress }: { barber: BarberCardDto; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {barber.profileImageUrl ? (
        <Image source={{ uri: barber.profileImageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>{barber.fullName.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {barber.shopName || barber.fullName}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {barber.address || barber.city || 'Barber Hub Studio'}
        </Text>
        <View style={styles.metaRow}>
          {typeof barber.distanceKm === 'number' && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>📍 {barber.distanceKm.toFixed(1)} km</Text>
            </View>
          )}
          {typeof barber.rating === 'number' ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>⭐ {barber.rating.toFixed(1)}</Text>
            </View>
          ) : (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...shadows.sm,
  },
  cardPressed: {
    transform: [{ translateY: -1 }],
    borderColor: colors.primaryBorder,
    ...shadows.md,
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySoft,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  imagePlaceholderText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  distanceBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  verifiedBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.successText,
    fontWeight: '700',
  },
});
