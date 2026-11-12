import React from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BarberProductsStackParamList } from '@/navigation/barberTypes';
import { barberProductsApi } from '@/api/endpoints/barberOps';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<BarberProductsStackParamList, 'ProductsManage'>;

export default function ProductsManageScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-products'], queryFn: () => barberProductsApi.mine() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => barberProductsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-products'] }),
  });

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete Product', `Remove "${name}" from your shop?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Shop Products</Text>
          <Text style={styles.subtitle}>Manage your retail inventory & sales</Text>
        </View>
        <Pressable style={styles.ordersButton} onPress={() => navigation.navigate('OrdersManage')}>
          <Text style={styles.ordersButtonText}>📦 View Orders</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No products listed</Text>
              <Text style={styles.emptySubtitle}>Add hair waxes, beard oils, and grooming accessories to sell directly to customers.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={styles.placeholderEmoji}>🧴</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>₹{item.effectivePrice} · {item.stockQuantity} in stock · {item.category || 'General'}</Text>
              </View>
              <Pressable onPress={() => confirmDelete(item.id, item.name)} style={styles.deleteButton}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}

      <PrimaryButton title="+ Add New Product" onPress={() => navigation.navigate('ProductForm', undefined)} style={styles.addButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 6 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ordersButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ordersButtonText: { fontWeight: '700', color: colors.text, fontSize: 12 },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  rowPressed: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryTint,
  },
  image: { width: 56, height: 56, borderRadius: borderRadius.sm, backgroundColor: colors.primaryTint },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 26 },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
  meta: { color: colors.primary, fontSize: 13, marginTop: 3, fontWeight: '600' },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
  },
  delete: { color: colors.dangerText, fontWeight: '700', fontSize: 12 },
  addButton: { position: 'absolute', bottom: 16, left: 16, right: 16 },
});
