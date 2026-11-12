import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';
import { PrimaryButton } from '@/components/PrimaryButton';
import { bookingsApi } from '@/api/endpoints/bookings';
import type { SlotTakenOfferDto } from '@/types/api';

interface Props {
  offer: SlotTakenOfferDto | null;
  onDismiss: () => void;
  onShiftSuccess?: () => void;
}

export function SlotTakenOfferModal({ offer, onDismiss, onShiftSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!offer) return null;

  const hasNextSlot = !!offer.nextAvailableSlot;
  const oldSlotFormatted = offer.oldSlot ? offer.oldSlot.slice(0, 5) : '';
  const nextSlotFormatted = offer.nextAvailableSlot ? offer.nextAvailableSlot.slice(0, 5) : '';

  async function onAcceptNextSlot() {
    if (!offer?.nextAvailableSlot) return;
    setLoading(true);
    setError(null);
    try {
      await bookingsApi.shiftSlot({
        bookingId: offer.bookingId,
        newStartTime: offer.nextAvailableSlot,
        newAppointmentDate: offer.date ? format(new Date(offer.date), 'yyyy-MM-dd') : undefined,
      });
      onShiftSuccess?.();
      onDismiss();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Could not shift to this slot. Please try another.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={!!offer} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Badge */}
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⚡</Text>
          </View>

          <Text style={styles.title}>Slot Confirmed for Another Client</Text>
          <Text style={styles.subtitle}>
            The <Text style={styles.boldText}>{oldSlotFormatted}</Text> slot at{' '}
            <Text style={styles.boldText}>{offer.shopName || offer.barberName}</Text> was just confirmed for another client.
          </Text>

          {/* Slot Comparison Box */}
          <View style={styles.offerBox}>
            <View style={styles.slotRow}>
              <View style={styles.slotBadgeContested}>
                <Text style={styles.slotBadgeLabel}>Original Slot</Text>
                <Text style={styles.slotBadgeValueCrossed}>⏰ {oldSlotFormatted}</Text>
                <Text style={styles.statusCrossed}>Taken</Text>
              </View>

              <Text style={styles.arrowIcon}>➔</Text>

              <View style={styles.slotBadgeNext}>
                <Text style={styles.slotBadgeLabelGreen}>Next Available</Text>
                <Text style={styles.slotBadgeValueGreen}>
                  {hasNextSlot ? `⏰ ${nextSlotFormatted}` : 'No Slots Today'}
                </Text>
                <Text style={styles.statusOpen}>{hasNextSlot ? 'Ready to Book' : 'Closed'}</Text>
              </View>
            </View>

            <View style={styles.detailsDivider} />

            <View style={styles.serviceMeta}>
              <Text style={styles.serviceName}>✂️ {offer.serviceName}</Text>
              <Text style={styles.servicePrice}>₹{offer.totalAmount}</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            {hasNextSlot ? (
              <PrimaryButton
                title={`⚡ Book Next Slot (${nextSlotFormatted})`}
                onPress={onAcceptNextSlot}
                loading={loading}
                style={styles.ctaButton}
              />
            ) : null}

            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.dismissText}>{hasNextSlot ? 'Explore Other Times' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 29, 41, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    ...shadows.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    ...shadows.sm,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontFamily: typography.fraunces,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  offerBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotBadgeContested: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: borderRadius.sm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  slotBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991b1b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  slotBadgeValueCrossed: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7f1d1d',
    textDecorationLine: 'line-through',
  },
  statusCrossed: {
    fontSize: 10,
    color: '#b91c1c',
    fontWeight: '600',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  slotBadgeNext: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderRadius: borderRadius.sm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  slotBadgeLabelGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  slotBadgeValueGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14532d',
  },
  statusOpen: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '700',
    marginTop: 2,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 10,
    width: '100%',
    marginBottom: 12,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  ctaButton: {
    width: '100%',
  },
  dismissButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
