import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { barberOrdersApi } from '@/api/endpoints/barberOps';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function OrdersManageScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ['manage-orders'], queryFn: () => barberOrdersApi.manage() });

  const markPaid = useMutation({
    mutationFn: (id: string) => barberOrdersApi.markPaid(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manage-orders'] }),
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
          <Text style={styles.emptyTitle}>No retail orders yet</Text>
          <Text style={styles.emptySubtitle}>Customer purchases from your shop products will appear here.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isCod = item.paymentMethod === 'CashOnDelivery' || (item as any).paymentMethod === 1 || String(item.paymentMethod).toLowerCase() === 'cashondelivery';
        const isPending = item.status === 'Pending' || (item as any).status === 0 || String(item.status).toLowerCase() === 'pending';

        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.status}>{String(item.status)}</Text>
              </View>
            </View>
            <Text style={styles.meta}>👤 {item.userName} · 📅 {format(new Date(item.createdAt), 'MMM d, yyyy')}</Text>
            <Text style={styles.meta}>💳 {isCod ? 'Cash on Delivery' : 'Paid Online'}</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Bill:</Text>
              <Text style={styles.total}>₹{item.totalAmount}</Text>
            </View>

            {isCod && isPending && (
              <PrimaryButton title="✓ Mark Cash Collected / Paid" onPress={() => markPaid.mutate(item.id)} loading={markPaid.isPending} style={{ marginTop: 12 }} />
            )}
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
    marginTop: 30,
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
