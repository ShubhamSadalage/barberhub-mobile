import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { superAdminApi } from '@/api/endpoints/superAdmin';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function AuditLogScreen() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['sa-audit-log', page],
    queryFn: () => superAdminApi.auditLog(page),
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
      data={data?.entries ?? []}
      keyExtractor={(e) => e.id}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (data?.hasMore && !isFetching) setPage((p) => p + 1);
      }}
      ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>No audit activity logs recorded</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.actionBadge}>
              <Text style={styles.action}>{item.action}</Text>
            </View>
            <Text style={styles.time}>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</Text>
          </View>
          <Text style={styles.actor}>👤 {item.actorEmail} <Text style={styles.roleTag}>({item.actorRole})</Text></Text>
          {item.targetType && <Text style={styles.target}>🎯 Target: {item.targetType} · {item.targetId}</Text>}
          {item.details && (
            <View style={styles.detailsBox}>
              <Text style={styles.details}>{item.details}</Text>
            </View>
          )}
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
    borderRadius: borderRadius.md,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  actionBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  action: { fontWeight: '800', color: colors.primaryDark, fontSize: 12 },
  time: { color: colors.textSubtle, fontSize: 11 },
  actor: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 4 },
  roleTag: { color: colors.primary, fontWeight: '700' },
  target: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  detailsBox: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.xs,
    marginTop: 8,
  },
  details: { color: colors.textSecondary, fontSize: 12, lineHeight: 16 },
});
