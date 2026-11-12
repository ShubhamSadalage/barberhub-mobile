import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { superAdminApi } from '@/api/endpoints/superAdmin';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function MarketplaceOrdersScreen() {
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ['sa-orders'], queryFn: () => superAdminApi.orders() });

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
          <Text style={styles.emptyTitle}>No orders recorded</Text>
          <Text style={styles.emptySubtitle}>All customer marketplace purchases will appear here for tracking.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.meta}>👤 Customer: {item.userName}</Text>
          <Text style={styles.meta}>📅 {format(new Date(item.createdAt), 'MMM d, yyyy · h:mm a')}</Text>
          <Text style={styles.meta}>💳 {item.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Paid Online (Stripe)'}</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Revenue:</Text>
            <Text style={styles.total}>₹{item.totalAmount}</Text>
          </View>
        </View>
      )}
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
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  status: { fontWeight: '700', color: colors.successText, fontSize: 11, textTransform: 'uppercase' },
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
