import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ordersApi } from '@/api/endpoints/commerce';
import type { OrderListItemDto, OrderStatus } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

const STATUS_THEMES: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  Pending: { bg: colors.warningSoft, text: colors.warningText, border: '#fde68a' },
  Paid: { bg: colors.successSoft, text: colors.successText, border: '#bbf7d0' },
  Shipped: { bg: colors.infoSoft, text: colors.infoText, border: '#bfdbfe' },
  Delivered: { bg: colors.successSoft, text: colors.successText, border: '#bbf7d0' },
  Cancelled: { bg: colors.dangerSoft, text: colors.dangerText, border: '#fecaca' },
};

export default function OrdersScreen() {
  const { data, isLoading, refetch, isFetching } = useQuery<OrderListItemDto[]>({
    queryKey: ['orders'],
    queryFn: () => ordersApi.mine(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={data ?? []}
      keyExtractor={(o) => o.id}
      onRefresh={refetch}
      refreshing={isFetching}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders placed yet</Text>
          <Text style={styles.emptySubtitle}>Explore barber grooming products in the marketplace.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const theme = STATUS_THEMES[item.status as OrderStatus] ?? STATUS_THEMES.Pending;
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <Text style={[styles.status, { color: theme.text }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>📅 {format(new Date(item.createdAt), 'MMM d, yyyy')} · {item.itemCount} item(s)</Text>
            <Text style={styles.meta}>💳 {item.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Paid Online'}</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.total}>₹{item.totalAmount}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
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
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontWeight: '800', color: colors.text, fontSize: 15 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  status: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  total: { fontWeight: '800', color: colors.primary, fontSize: 16 },
});
