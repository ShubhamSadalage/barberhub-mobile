import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/barberTypes';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { servicesApi } from '@/api/endpoints/barberOps';
import type { ApiErrorBody } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<DashboardStackParamList, 'ServiceForm'>;

export default function ServiceFormScreen({ route, navigation }: Props) {
  const serviceId = route.params?.serviceId;
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hair');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const dto = {
        name,
        description: description || undefined,
        category,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        isActive,
      };
      if (serviceId) {
        await servicesApi.edit(serviceId, dto);
      } else {
        await servicesApi.create(dto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      navigation.goBack();
    },
    onError: (e) => {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Could not save service.');
    },
  });

  function onSubmit() {
    setError(null);
    if (!name || !price || !durationMinutes) {
      setError('Please fill in name, price, and duration.');
      return;
    }
    saveMutation.mutate();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{serviceId ? 'Edit Service' : 'Add Custom Service'}</Text>
        <Text style={styles.subtitle}>Define service pricing, duration, and details.</Text>

        <FormInput label="Service Name" placeholder="e.g. Skin Fade + Beard Grooming" value={name} onChangeText={setName} />
        <FormInput label="Description (optional)" placeholder="Details on styling, tools used, etc." value={description} onChangeText={setDescription} multiline />
        <FormInput label="Category" value={category} onChangeText={setCategory} placeholder="Hair, Beard, Shaving, Package…" />
        <FormInput label="Price (₹)" placeholder="e.g. 450" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <FormInput label="Duration (minutes)" placeholder="e.g. 30" value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="numeric" />

        <View style={styles.switchBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Available for Online Booking</Text>
            <Text style={styles.switchSub}>Show this service on your public shop menu</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={isActive ? colors.primary : '#ffffff'}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <PrimaryButton title={serviceId ? "Save Service Changes" : "Publish Service"} onPress={onSubmit} loading={saveMutation.isPending} style={styles.mt8} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: colors.background, maxWidth: 520, width: '100%', alignSelf: 'center' },
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
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: borderRadius.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: 16,
    marginTop: 4,
  },
  switchLabel: { fontWeight: '700', color: colors.text, fontSize: 14 },
  switchSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 16,
  },
  error: { color: colors.dangerText, fontWeight: '600', fontSize: 13 },
  mt8: { marginTop: 8 },
});
