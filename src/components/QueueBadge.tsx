import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/endpoints/bookings';
import { colors, borderRadius } from '@/theme/colors';

export function QueueBadge({ bookingId }: { bookingId: string }) {
  const { data } = useQuery({
    queryKey: ['queue-position', bookingId],
    queryFn: () => bookingsApi.queuePosition(bookingId),
    refetchInterval: 20000,
  });

  if (!data || data.position === null) return null;

  const isTurn = data.position === 0;

  return (
    <View style={[styles.badge, isTurn ? styles.badgeYourTurn : styles.badgeWaiting]}>
      <Text style={[styles.badgeText, isTurn ? styles.textYourTurn : styles.textWaiting]}>
        {isTurn ? "🎉 It's your turn!" : `⏳ ${data.peopleAhead} ahead of you`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeWaiting: {
    backgroundColor: colors.warningSoft,
    borderColor: '#fde68a',
  },
  badgeYourTurn: {
    backgroundColor: colors.successSoft,
    borderColor: '#bbf7d0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textWaiting: {
    color: colors.warningText,
  },
  textYourTurn: {
    color: colors.successText,
  },
});
