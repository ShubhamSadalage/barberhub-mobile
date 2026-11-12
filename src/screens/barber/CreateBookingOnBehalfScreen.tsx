import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/barberTypes';
import { adminApi, type UserOptionDto, type ServiceOptionDto } from '@/api/endpoints/barberOps';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { ApiErrorBody } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<DashboardStackParamList, 'CreateBookingOnBehalf'>;

const NEXT_DAYS = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

export default function CreateBookingOnBehalfScreen({ navigation }: Props) {
  const { data: options, isLoading } = useQuery({
    queryKey: ['booking-options'],
    queryFn: () => adminApi.createBookingOptions(),
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(NEXT_DAYS[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createBooking({
        userId: userId!,
        serviceId: serviceId!,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: `${startTime}:00`,
        notes: notes || undefined,
      }),
    onSuccess: () => navigation.goBack(),
    onError: (e) => {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Could not create booking.');
    },
  });

  function onSubmit() {
    setError(null);
    if (!userId || !serviceId) {
      setError('Please select a customer and a service.');
      return;
    }
    createMutation.mutate();
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Book on Behalf of Client</Text>
        <Text style={styles.subtitle}>Directly reserve a slot for walk-in or telephone bookings.</Text>

        <Text style={styles.sectionTitle}>1. Select Customer</Text>
        <View style={styles.optionsGrid}>
          {options?.users.map((u: UserOptionDto) => {
            const isSelected = userId === u.id;
            return (
              <Pressable
                key={u.id}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setUserId(u.id)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{u.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>2. Select Service</Text>
        <View style={styles.optionsGrid}>
          {options?.services.map((s: ServiceOptionDto) => {
            const isSelected = serviceId === s.id;
            return (
              <Pressable
                key={s.id}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setServiceId(s.id)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>3. Appointment Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
          {NEXT_DAYS.map((d) => {
            const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <Pressable
                key={d.toISOString()}
                style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>{format(d, 'EEE')}</Text>
                <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>{format(d, 'd MMM')}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FormInput label="Start Time (HH:mm, 24-hr)" value={startTime} onChangeText={setStartTime} placeholder="10:00" />
        <FormInput label="Booking Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Walk-in, VIP client notes, etc." multiline />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <PrimaryButton title="Confirm & Reserve Slot" onPress={onSubmit} loading={createMutation.isPending} style={{ marginTop: 8 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: colors.background, maxWidth: 540, width: '100%', alignSelf: 'center', paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 14, marginBottom: 8 },
  optionsGrid: { gap: 8, marginBottom: 12 },
  optionRow: {
    padding: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  optionText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  optionTextSelected: { color: colors.primaryDark, fontWeight: '700' },
  dateRow: { marginBottom: 16 },
  dateChip: {
    width: 68,
    height: 64,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primaryGlow,
  },
  dateChipDay: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  dateChipNum: { fontSize: 14, color: colors.text, fontWeight: '800', marginTop: 2 },
  dateChipTextSelected: { color: '#ffffff' },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 14,
  },
  error: { color: colors.dangerText, fontWeight: '600', fontSize: 13 },
});
