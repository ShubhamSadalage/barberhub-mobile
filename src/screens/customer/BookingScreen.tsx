import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/customerTypes';
import { barbersApi } from '@/api/endpoints/barbers';
import { bookingsApi } from '@/api/endpoints/bookings';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { ApiErrorBody, AvailableSlotsDto } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Booking'>;

const NEXT_DAYS = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

export default function BookingScreen({ route, navigation }: Props) {
  const { barberId, serviceId } = route.params;
  const [selectedDate, setSelectedDate] = useState(NEXT_DAYS[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: slotsData, isLoading: slotsLoading } = useQuery<AvailableSlotsDto>({
    queryKey: ['available-slots', barberId, serviceId, dateStr],
    queryFn: () => barbersApi.availableSlots(barberId, dateStr, serviceId),
  });

  const createBooking = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        barberId,
        serviceId,
        appointmentDate: dateStr,
        startTime: `${selectedSlot}:00`,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      navigation.getParent()?.navigate('Bookings' as never);
    },
    onError: (e) => {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Could not create booking.');
    },
  });

  function onSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📅 1. Choose Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {NEXT_DAYS.map((d) => {
          const isSelected = format(d, 'yyyy-MM-dd') === dateStr;
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => onSelectDate(d)}
              style={[styles.dateChip, isSelected && styles.dateChipSelected]}
            >
              <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>{format(d, 'EEE')}</Text>
              <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>{format(d, 'd')}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>⏰ 2. Choose Time Slot</Text>
      {slotsLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : slotsData?.isLeaveDay ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>🏖️ The barber is on leave this day.</Text>
        </View>
      ) : slotsData?.isHoliday ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>💈 The barber is closed on this day (Weekly Holiday).</Text>
        </View>
      ) : (() => {
        const rawList = slotsData?.slotStatuses ?? (slotsData?.availableSlots ?? slotsData?.slots ?? []).map((s: string) => ({ time: s, status: 'Available' as const, queueCount: 0 }));
        if (!rawList || rawList.length === 0) {
          return (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>⚠️ No available slots on this day. Please select another date.</Text>
            </View>
          );
        }
        return (
          <ScrollView contentContainerStyle={styles.slotsGrid}>
            {rawList.map((slotInfo: any) => {
              const timeStr = typeof slotInfo === 'string' ? slotInfo : slotInfo.time?.slice(0, 5) ?? slotInfo.time;
              const isBooked = slotInfo.status === 'Booked';
              const isQueued = slotInfo.status === 'Queued';
              const isSelected = selectedSlot === timeStr;

            return (
              <Pressable
                key={timeStr}
                onPress={() => {
                  if (!isBooked) setSelectedSlot(timeStr);
                }}
                disabled={isBooked}
                style={[
                  styles.slotChip,
                  isSelected && styles.slotChipSelected,
                  isQueued && !isSelected && styles.slotChipQueued,
                  isBooked && styles.slotChipBooked,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    isSelected && styles.slotTextSelected,
                    isQueued && !isSelected && styles.slotTextQueued,
                    isBooked && styles.slotTextBooked,
                  ]}
                >
                  {timeStr}
                </Text>
                {isQueued && (
                  <View style={[styles.queuePill, isSelected && styles.queuePillSelected]}>
                    <Text style={[styles.queuePillText, isSelected && styles.queuePillTextSelected]}>
                      Q#{slotInfo.queueCount + 1}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      );
      })()}

      {/* Selected Slot Queued Info Notice */}
      {selectedSlot && slotsData?.slotStatuses?.find((s) => s.time.startsWith(selectedSlot))?.status === 'Queued' ? (
        <View style={styles.queueNoticeCard}>
          <Text style={styles.queueNoticeTitle}>📌 Slot Waitlist Notice</Text>
          <Text style={styles.queueNoticeSub}>
            This slot currently has a pending request. You will be added to the queue stack and immediately notified with next-slot options if the slot gets taken!
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <View style={styles.bottomSection}>
        {selectedSlot ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Slot:</Text>
            <Text style={styles.summaryValue}>{format(selectedDate, 'MMM d, yyyy')} @ {selectedSlot}</Text>
          </View>
        ) : null}
        <PrimaryButton
          title={selectedSlot ? `Confirm Booking for ${selectedSlot}` : "Select a Time Slot"}
          onPress={() => createBooking.mutate()}
          loading={createBooking.isPending}
          disabled={!selectedSlot}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginTop: 10,
  },
  dateRow: {
    maxHeight: 80,
    marginBottom: 16,
  },
  dateChip: {
    width: 60,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...shadows.sm,
  },
  dateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primaryGlow,
  },
  dateChipDay: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dateChipNum: {
    fontSize: 19,
    color: colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  dateChipTextSelected: {
    color: '#ffffff',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  slotChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primaryGlow,
  },
  slotChipQueued: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  slotChipBooked: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    opacity: 0.5,
  },
  slotText: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
  },
  slotTextSelected: {
    color: '#ffffff',
  },
  slotTextQueued: {
    color: '#b45309',
  },
  slotTextBooked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  queuePill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  queuePillSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'transparent',
  },
  queuePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  queuePillTextSelected: {
    color: '#ffffff',
  },
  queueNoticeCard: {
    backgroundColor: '#fffbeb',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginVertical: 10,
  },
  queueNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 4,
  },
  queueNoticeSub: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 17,
  },
  noticeCard: {
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginTop: 8,
  },
  noticeText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginTop: 10,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSection: {
    marginTop: 'auto',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
