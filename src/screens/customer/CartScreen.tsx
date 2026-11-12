import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/customerTypes';
import { cartApi } from '@/api/endpoints/commerce';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { CartItemDto } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<ShopStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cart'], queryFn: () => cartApi.get() });

  const setCache = (cart: typeof data) => queryClient.setQueryData(['cart'], cart);

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => cartApi.updateQuantity(id, quantity),
    onSuccess: setCache,
  });

  const remove = useMutation({
    mutationFn: (id: string) => cartApi.remove(id),
    onSuccess: setCache,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: CartItemDto }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderEmoji}>🧴</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name} numberOfLines={1}>{item.productName}</Text>
        <Text style={styles.unitPrice}>₹{item.unitPrice} each</Text>
        <View style={styles.qtyRow}>
          <Pressable
            style={styles.qtyButton}
            onPress={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable
            style={styles.qtyButton}
            onPress={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}
            disabled={item.quantity >= item.stockQuantity}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
          <Pressable onPress={() => remove.mutate(item.id)} style={{ marginLeft: 16 }}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.lineTotal}>₹{item.lineTotal}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Explore hair styling, beard care & shaving products in the shop.</Text>
          </View>
        }
      />

      {data && data.items.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{data.subTotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (18% GST)</Text>
            <Text style={styles.summaryValue}>₹{data.tax}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{data.total}</Text>
          </View>
          <PrimaryButton title="Proceed to Checkout" onPress={() => navigation.navigate('Checkout')} style={{ marginTop: 12 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  image: { width: 64, height: 64, borderRadius: borderRadius.sm, backgroundColor: colors.primaryTint },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
  unitPrice: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  qty: { marginHorizontal: 12, fontWeight: '700', color: colors.text },
  remove: { color: colors.dangerText, fontSize: 12, fontWeight: '700' },
  lineTotal: { fontWeight: '800', color: colors.primary, fontSize: 15 },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: borderRadius.lg,
    margin: 16,
    marginTop: 0,
    ...shadows.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: colors.textMuted, fontSize: 13 },
  summaryValue: { color: colors.text, fontWeight: '600', fontSize: 13 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: { fontWeight: '800', fontSize: 16, color: colors.text },
  totalValue: { fontWeight: '800', fontSize: 18, color: colors.primary },
});
