import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { barberBookingsApi } from '@/api/endpoints/barberOps';
import { PrimaryButton } from '@/components/PrimaryButton';
import { normalizeBookingStatus } from '@/types/api';
import type { BookingListItemDto, BookingStatus } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

const FILTERS: Array<'All' | BookingStatus> = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected', 'Cancelled'];

const STATUS_THEMES: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  Pending: { bg: colors.warningSoft, text: colors.warningText, border: '#fde68a' },
  Accepted: { bg: colors.successSoft, text: colors.successText, border: '#bbf7d0' },
  Rejected: { bg: colors.dangerSoft, text: colors.dangerText, border: '#fecaca' },
  Completed: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Cancelled: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
};

export default function BookingsManageScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'All' | BookingStatus>('All');
  const [rejecting, setRejecting] = useState<BookingListItemDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [completing, setCompleting] = useState<BookingListItemDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['manage-bookings'],
    queryFn: () => barberBookingsApi.manage(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: BookingStatus; reason?: string }) =>
      barberBookingsApi.updateStatus(id, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manage-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      setCompleting(null);
      setRejecting(null);
      setRejectionReason('');
      setErrorMessage(null);
      setSuccessMessage(
        variables.status === 'Completed'
          ? '✓ Appointment marked as completed!'
          : variables.status === 'Accepted'
          ? '✓ Booking accepted successfully!'
          : '✓ Booking updated.'
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.message || 'Could not update booking status.';
      setErrorMessage(msg);
    },
  });

  function onAccept(b: BookingListItemDto) {
    setErrorMessage(null);
    updateStatus.mutate({ id: b.id, status: 'Accepted' });
  }

  function onCompletePress(b: BookingListItemDto) {
    setErrorMessage(null);
    setCompleting(b);
  }

  function confirmComplete() {
    if (!completing) return;
    updateStatus.mutate({ id: completing.id, status: 'Completed' });
  }

  function onReject(b: BookingListItemDto) {
    setErrorMessage(null);
    setRejecting(b);
  }

  function confirmReject() {
    if (!rejecting) return;
    updateStatus.mutate({ id: rejecting.id, status: 'Rejected', reason: rejectionReason || undefined });
  }

  const normalizedList = (data ?? []).map((b: BookingListItemDto) => ({
    ...b,
    status: normalizeBookingStatus(b.status),
  }));

  const counts: Record<string, number> = {
    All: normalizedList.length,
    Pending: normalizedList.filter((b) => b.status === 'Pending').length,
    Accepted: normalizedList.filter((b) => b.status === 'Accepted').length,
    Completed: normalizedList.filter((b) => b.status === 'Completed').length,
    Rejected: normalizedList.filter((b) => b.status === 'Rejected').length,
    Cancelled: normalizedList.filter((b) => b.status === 'Cancelled').length,
  };

  const filtered = normalizedList.filter((b: BookingListItemDto) => filter === 'All' || b.status === filter);

  return (
    <View style={styles.container}>
      {/* Real-time Status Filter Tabs with Counts */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f}
        style={styles.filterRow}
        renderItem={({ item }) => {
          const isSelected = filter === item;
          const count = counts[item] ?? 0;
          return (
            <Pressable
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                {item} ({count})
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Success Notification Banner */}
      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
          <Pressable onPress={() => setErrorMessage(null)}>
            <Text style={styles.errorDismissText}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          onRefresh={refetch}
          refreshing={isFetching}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No bookings under "{filter}"</Text>
              <Text style={styles.emptySub}>
                {filter === 'All' ? 'When clients book appointments, they will appear here.' : `Try switching to another tab.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusKey = normalizeBookingStatus(item.status);
            const theme = STATUS_THEMES[statusKey] ?? STATUS_THEMES.Pending;
            const isPending = statusKey === 'Pending';
            const isAccepted = statusKey === 'Accepted';
            const isCompleted = statusKey === 'Completed';
            const queuePos = item.slotQueuePosition ?? 1;

            return (
              <View style={[styles.card, isCompleted && styles.cardCompleted]}>
                <View style={styles.row}>
                  <Text style={styles.customer}>{item.userName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                    <Text style={[styles.statusText, { color: theme.text }]}>
                      {isCompleted ? '✓ Completed' : statusKey}
                    </Text>
                  </View>
                </View>

                <Text style={styles.service}>{item.serviceName}</Text>
                <Text style={styles.dateTime}>
                  🗓️ {format(new Date(item.appointmentDate), 'EEE, MMM d, yyyy')} · ⏰ {item.startTime.slice(0, 5)}
                </Text>
                <Text style={styles.phone}>📞 {item.userPhone || 'No phone provided'}</Text>
                
                {item.notes ? (
                  <Text style={styles.notes}>📝 Note: {item.notes}</Text>
                ) : null}

                <View style={styles.amountRow}>
                  <Text style={styles.amount}>₹{item.totalAmount}</Text>
                </View>

                {isPending && (
                  <View style={[styles.queueBarberBadge, queuePos > 1 && styles.queueBarberBadgeWaitlist]}>
                    <Text style={[styles.queueBarberText, queuePos > 1 && styles.queueBarberTextWaitlist]}>
                      {queuePos > 1
                        ? `⏳ Queue #${queuePos} (Accepting will offer next open slot to others)`
                        : `⚡ Primary Request for this slot`}
                    </Text>
                  </View>
                )}

                {/* Pending Actions */}
                {isPending && (
                  <View style={styles.actionColumn}>
                    <View style={styles.actionRow}>
                      <PrimaryButton
                        title="Accept"
                        onPress={() => onAccept(item)}
                        style={styles.actionButton}
                        loading={updateStatus.isPending && updateStatus.variables?.id === item.id && updateStatus.variables?.status === 'Accepted'}
                      />
                      <PrimaryButton
                        title="Decline"
                        variant="danger"
                        onPress={() => onReject(item)}
                        style={styles.actionButton}
                      />
                    </View>
                    <Pressable
                      style={styles.completeSecondaryBtn}
                      onPress={() => onCompletePress(item)}
                    >
                      <Text style={styles.completeSecondaryText}>✓ Mark as Completed (Walk-in)</Text>
                    </Pressable>
                  </View>
                )}

                {/* Accepted Actions */}
                {isAccepted && (
                  <View style={styles.actionColumn}>
                    <PrimaryButton
                      title="✓ Mark as Completed"
                      onPress={() => onCompletePress(item)}
                      style={styles.completeBtn}
                    />
                    <Pressable
                      style={styles.cancelSecondaryBtn}
                      onPress={() => onReject(item)}
                    >
                      <Text style={styles.cancelSecondaryText}>Decline / Cancel Booking</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Dedicated Complete Appointment Confirmation Modal (Works on Web & Mobile) */}
      <Modal visible={!!completing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderIconBox}>
              <Text style={styles.modalHeaderIcon}>✂️</Text>
            </View>
            <Text style={styles.modalTitle}>Complete Appointment</Text>
            <Text style={styles.modalSub}>Confirm that this service was successfully completed:</Text>

            {completing ? (
              <View style={styles.modalSummaryBox}>
                <View style={styles.modalSummaryRow}>
                  <Text style={styles.modalSummaryLabel}>Customer:</Text>
                  <Text style={styles.modalSummaryVal}>{completing.userName}</Text>
                </View>
                <View style={styles.modalSummaryRow}>
                  <Text style={styles.modalSummaryLabel}>Service:</Text>
                  <Text style={styles.modalSummaryVal}>{completing.serviceName}</Text>
                </View>
                <View style={styles.modalSummaryRow}>
                  <Text style={styles.modalSummaryLabel}>Appointment:</Text>
                  <Text style={styles.modalSummaryVal}>
                    {format(new Date(completing.appointmentDate), 'EEE, MMM d')} at {completing.startTime.slice(0, 5)}
                  </Text>
                </View>
                <View style={styles.modalSummaryRow}>
                  <Text style={styles.modalSummaryLabel}>Total Amount:</Text>
                  <Text style={[styles.modalSummaryVal, { color: '#16a34a', fontWeight: '800' }]}>₹{completing.totalAmount}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <PrimaryButton
                title="Cancel"
                variant="secondary"
                onPress={() => setCompleting(null)}
                style={styles.actionButton}
                disabled={updateStatus.isPending}
              />
              <PrimaryButton
                title="✓ Confirm Completed"
                onPress={confirmComplete}
                loading={updateStatus.isPending}
                style={[styles.actionButton, { backgroundColor: '#16a34a' }]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Dedicated Decline Booking Modal */}
      <Modal visible={!!rejecting} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Decline Booking Request</Text>
            <Text style={styles.modalSub}>Provide an optional reason for the customer.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Fully booked / emergency leave"
              placeholderTextColor={colors.textSubtle}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
            />
            <View style={styles.actionRow}>
              <PrimaryButton
                title="Cancel"
                variant="secondary"
                onPress={() => setRejecting(null)}
                style={styles.actionButton}
                disabled={updateStatus.isPending}
              />
              <PrimaryButton
                title="Decline"
                variant="danger"
                onPress={confirmReject}
                loading={updateStatus.isPending}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexGrow: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primaryGlow,
  },
  filterText: { fontWeight: '700', color: colors.textMuted, fontSize: 13 },
  filterTextSelected: { color: '#ffffff' },

  successBanner: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: borderRadius.sm,
  },
  successBannerText: { color: '#15803d', fontWeight: '700', fontSize: 13, textAlign: 'center' },

  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: { color: colors.dangerText, fontWeight: '600', fontSize: 13, flex: 1 },
  errorDismissText: { color: colors.dangerText, fontWeight: '800', fontSize: 14, marginLeft: 8 },

  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  emptySub: { color: colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardCompleted: {
    backgroundColor: '#fcfdfd',
    borderColor: '#e2e8f0',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontWeight: '800', color: colors.text, fontSize: 16 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  service: { color: colors.primary, fontWeight: '700', fontSize: 15, marginTop: 4 },
  dateTime: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  phone: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  notes: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  amountRow: { marginTop: 6 },
  amount: { fontWeight: '800', color: colors.text, fontSize: 16 },

  queueBarberBadge: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  queueBarberBadgeWaitlist: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  queueBarberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  queueBarberTextWaitlist: {
    color: '#92400e',
  },

  actionColumn: { marginTop: 12, gap: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1 },
  completeBtn: { backgroundColor: '#16a34a' },
  completeSecondaryBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  completeSecondaryText: { color: '#16a34a', fontWeight: '700', fontSize: 12 },
  cancelSecondaryBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  cancelSecondaryText: { color: colors.dangerText, fontWeight: '600', fontSize: 12 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,29,41,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  modalHeaderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeaderIcon: { fontSize: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  modalSub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 14, textAlign: 'center' },
  modalSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalSummaryLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  modalSummaryVal: { fontSize: 13, fontWeight: '700', color: colors.text },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
});
