import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { bookingsApi } from '@/api/endpoints/bookings';
import { QueueBadge } from '@/components/QueueBadge';
import { SlotTakenOfferModal } from '@/components/SlotTakenOfferModal';
import { onIncomingNotification, onSlotTakenOffer } from '@/realtime/NotificationsHubProvider';
import { normalizeBookingStatus } from '@/types/api';
import type { BookingListItemDto, BookingStatus, SlotTakenOfferDto } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

const STATUS_THEMES: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  Pending: { bg: colors.warningSoft, text: colors.warningText, border: '#fde68a' },
  Accepted: { bg: colors.successSoft, text: colors.successText, border: '#bbf7d0' },
  Rejected: { bg: colors.dangerSoft, text: colors.dangerText, border: '#fecaca' },
  Completed: { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
  Cancelled: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
};

const today = format(new Date(), 'yyyy-MM-dd');

export default function MyBookingsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [activeSlotOffer, setActiveSlotOffer] = useState<SlotTakenOfferDto | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery<BookingListItemDto[]>({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.mine(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  useEffect(() => {
    const unsubNotif = onIncomingNotification((n) => {
      if (n.type.startsWith('Booking') || n.type.startsWith('Queue') || n.type.startsWith('Slot')) {
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['queue-position'] });
      }
    });

    const unsubOffer = onSlotTakenOffer((offer) => {
      setActiveSlotOffer(offer);
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    });

    return () => {
      unsubNotif();
      unsubOffer();
    };
  }, [queryClient]);

  function confirmCancel(item: BookingListItemDto) {
    Alert.alert('Cancel Booking', `Are you sure you want to cancel ${item.serviceName}?`, [
      { text: 'Keep Booking', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(item.id) },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        style={styles.container}
        data={data ?? []}
        keyExtractor={(b) => b.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>Explore barbers on the Home tab to schedule your first appointment.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusKey = normalizeBookingStatus(item.status);
          const theme = STATUS_THEMES[statusKey] ?? STATUS_THEMES.Pending;
          const isPending = statusKey === 'Pending';
          const queuePos = item.slotQueuePosition ?? 1;

          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.shopName}>{item.shopName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                  <Text style={[styles.statusText, { color: theme.text }]}>{statusKey}</Text>
                </View>
              </View>

              <Text style={styles.service}>{item.serviceName}</Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.dateTime}>
                  🗓️ {format(new Date(item.appointmentDate), 'EEE, MMM d, yyyy')} · ⏰ {item.startTime.slice(0, 5)}
                </Text>
              </View>

              {isPending && (
                <View style={[styles.queueStackBadge, queuePos > 1 && styles.queueStackBadgeWaitlist]}>
                  <Text style={[styles.queueStackText, queuePos > 1 && styles.queueStackTextWaitlist]}>
                    {queuePos > 1
                      ? `⏳ Slot Waitlist: #${queuePos} in line for this slot`
                      : `⚡ Primary Request (#1 in line)`}
                  </Text>
                </View>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.amount}>₹{item.totalAmount}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable
                    onPress={() => navigation?.navigate('ChatConversation', { otherUserId: item.barberId, otherUserName: item.barberName || item.shopName })}
                    style={styles.chatMiniButton}
                  >
                    <Text style={styles.chatMiniText}>💬 Chat</Text>
                  </Pressable>

                  {(statusKey === 'Pending' || statusKey === 'Accepted') && (
                    <Pressable onPress={() => confirmCancel(item)} style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {item.status === 'Accepted' && item.appointmentDate.startsWith(today) && (
                <QueueBadge bookingId={item.id} />
              )}

              {item.status === 'Rejected' && item.rejectionReason && (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionReason}>Reason: {item.rejectionReason}</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      <SlotTakenOfferModal
        offer={activeSlotOffer}
        onDismiss={() => setActiveSlotOffer(null)}
        onShiftSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  service: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 6,
  },
  metaRow: {
    marginTop: 4,
  },
  dateTime: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  queueStackBadge: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  queueStackBadgeWaitlist: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  queueStackText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  queueStackTextWaitlist: {
    color: '#92400e',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  rejectionBox: {
    backgroundColor: colors.dangerSoft,
    padding: 8,
    borderRadius: borderRadius.xs,
    marginTop: 10,
  },
  rejectionReason: {
    fontSize: 12,
    color: colors.dangerText,
    fontWeight: '600',
  },
  chatMiniButton: {
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  chatMiniText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelText: {
    color: colors.dangerText,
    fontWeight: '700',
    fontSize: 12,
  },
});
