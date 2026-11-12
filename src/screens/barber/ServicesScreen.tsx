import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Switch, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/barberTypes';
import { servicesApi, type ServiceTemplateDto, type ServiceItemDto } from '@/api/endpoints/barberOps';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Services'>;

export default function ServicesScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  const { data: services, isLoading } = useQuery<ServiceItemDto[]>({ queryKey: ['my-services'], queryFn: () => servicesApi.mine() });
  const { data: templates } = useQuery<ServiceTemplateDto[]>({
    queryKey: ['service-templates'],
    queryFn: () => servicesApi.templates(),
    enabled: showTemplates,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => servicesApi.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-services'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-services'] }),
  });

  const activateMutation = useMutation({
    mutationFn: () => {
      const items = (templates ?? [])
        .filter((t: ServiceTemplateDto) => selectedTemplates.has(t.name))
        .map((t: ServiceTemplateDto) => ({ name: t.name, category: t.category, description: t.description, price: t.defaultPrice, durationMinutes: t.defaultDuration }));
      return servicesApi.activateTemplates(items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      setShowTemplates(false);
      setSelectedTemplates(new Set());
    },
  });

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete Service', `Remove "${name}" from your shop menu?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  function toggleTemplate(name: string) {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (showTemplates) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.sectionTitle}>⚡ Quick-Add Service Templates</Text>
          <Text style={styles.subtitle}>Select popular haircut & grooming packages to instantly add to your menu.</Text>
        </View>

        <FlatList
          data={templates ?? []}
          keyExtractor={(t) => t.name}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => {
            const isChecked = selectedTemplates.has(item.name);
            return (
              <Pressable
                style={[styles.templateCard, isChecked && styles.templateCardSelected]}
                onPress={() => toggleTemplate(item.name)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.templateName}>{item.name}</Text>
                  <Text style={styles.templateMeta}>₹{item.defaultPrice} · ⏱️ {item.defaultDuration} mins · {item.category}</Text>
                  {item.description ? <Text style={styles.templateDesc}>{item.description}</Text> : null}
                </View>
                <Switch
                  value={isChecked}
                  onValueChange={() => toggleTemplate(item.name)}
                  trackColor={{ false: colors.border, true: colors.primarySoft }}
                  thumbColor={isChecked ? colors.primary : '#ffffff'}
                />
              </Pressable>
            );
          }}
        />
        <PrimaryButton
          title={`Add ${selectedTemplates.size || ''} Selected Service${selectedTemplates.size === 1 ? '' : 's'}`.trim()}
          onPress={() => activateMutation.mutate()}
          loading={activateMutation.isPending}
          disabled={selectedTemplates.size === 0}
          style={styles.footerButton}
        />
        <PrimaryButton title="Back to My Services" variant="secondary" onPress={() => setShowTemplates(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services ?? []}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('ServiceForm', { serviceId: item.id })}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>₹{item.price} · ⏱️ {item.durationMinutes} mins · {item.category || 'Grooming'}</Text>
            </Pressable>
            <View style={styles.actionsRight}>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleMutation.mutate(item.id)}
                trackColor={{ false: colors.border, true: colors.primarySoft }}
                thumbColor={item.isActive ? colors.primary : '#ffffff'}
              />
              <Pressable onPress={() => confirmDelete(item.id, item.name)} style={styles.deleteButton}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>✂️</Text>
            <Text style={styles.emptyTitle}>No services listed yet</Text>
            <Text style={styles.empty}>Add from our curated templates or create a custom service.</Text>
          </View>
        }
      />

      <PrimaryButton title="⚡ Add from Popular Templates" variant="secondary" onPress={() => setShowTemplates(true)} style={styles.footerButton} />
      <PrimaryButton title="+ Create Custom Service" onPress={() => navigation.navigate('ServiceForm', undefined)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  headerBox: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 3 },
  actionsRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  delete: { color: colors.dangerText, fontSize: 11, fontWeight: '700' },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: 13 },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  templateCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  templateName: { fontSize: 15, fontWeight: '700', color: colors.text },
  templateMeta: { fontSize: 13, color: colors.primaryDark, fontWeight: '600', marginTop: 2 },
  templateDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  footerButton: { marginBottom: 10 },
});
