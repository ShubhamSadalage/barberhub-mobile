import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { adminApi } from '@/api/endpoints/barberOps';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadows, borderRadius } from '@/theme/colors';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const NEXT_DAYS = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

export default function LeaveDaysScreen() {
  const queryClient = useQueryClient();
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['leave-days'], queryFn: () => adminApi.leaveDays() });

  const addMutation = useMutation({
    mutationFn: () => adminApi.addLeaveDay(format(pickedDate!, 'yyyy-MM-dd'), reason || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-days'] });
      setPickedDate(null);
      setReason('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeLeaveDay(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-days'] }),
  });

  const holidayMutation = useMutation({
    mutationFn: (day: number) => adminApi.setWeeklyHoliday(day),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-days'] }),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Weekly Holiday Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏖️ Recurring Weekly Holiday</Text>
        <Text style={styles.subtitle}>Select the day of the week your shop remains closed.</Text>
        <View style={styles.dayGrid}>
          {DAY_NAMES.map((name, idx) => {
            const isSelected = data?.weeklyHoliday === idx;
            return (
              <Pressable
                key={name}
                style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                onPress={() => holidayMutation.mutate(idx)}
              >
                <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                  {name.slice(0, 3)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Scheduled Leave Days Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📅 Scheduled Upcoming Leaves</Text>
        <Text style={styles.subtitle}>Customers will not be able to book slots on these dates.</Text>
        
        {(!data?.leaves || data.leaves.length === 0) ? (
          <Text style={styles.empty}>No custom leave days scheduled.</Text>
        ) : (
          data.leaves.map((item: { id: string; leaveDate: string; reason?: string }) => (
            <View key={item.id} style={styles.leaveRow}>
              <View>
                <Text style={styles.leaveDate}>🗓️ {format(new Date(item.leaveDate), 'EEE, MMM d, yyyy')}</Text>
                {item.reason && <Text style={styles.leaveReason}>{item.reason}</Text>}
              </View>
              <Pressable onPress={() => removeMutation.mutate(item.id)} style={styles.removeButton}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Add New Leave Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>➕ Schedule a Leave Day</Text>
        <Text style={styles.subtitle}>Select a date below to mark your shop as closed.</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
          {NEXT_DAYS.slice(0, 14).map((d) => {
            const selected = pickedDate && format(pickedDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
            return (
              <Pressable key={d.toISOString()} style={[styles.dateChip, selected && styles.dateChipSelected]} onPress={() => setPickedDate(d)}>
                <Text style={[styles.dateChipDay, selected && styles.dateChipTextSelected]}>{format(d, 'EEE')}</Text>
                <Text style={[styles.dateChipNum, selected && styles.dateChipTextSelected]}>{format(d, 'd MMM')}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FormInput label="Reason / Holiday Name (optional)" placeholder="e.g. Festival / Personal Leave" value={reason} onChangeText={setReason} />
        <PrimaryButton
          title={pickedDate ? `Schedule Leave for ${format(pickedDate, 'MMM d')}` : "Select a Date Above"}
          onPress={() => addMutation.mutate()}
          loading={addMutation.isPending}
          disabled={!pickedDate}
          style={{ marginTop: 10 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 14 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.primaryGlow },
  dayChipText: { fontWeight: '700', color: colors.text, fontSize: 13 },
  dayChipTextSelected: { color: '#ffffff' },
  empty: { color: colors.textMuted, fontSize: 13, paddingVertical: 8 },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leaveDate: { fontWeight: '700', color: colors.text, fontSize: 14 },
  leaveReason: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  removeButton: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  remove: { color: colors.dangerText, fontWeight: '700', fontSize: 11 },
  dateRow: { marginBottom: 14 },
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
});
