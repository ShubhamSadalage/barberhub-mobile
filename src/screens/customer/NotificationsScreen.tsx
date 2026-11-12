import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { notificationsApi } from '@/api/endpoints/social';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.recent(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {(data?.items.length ?? 0) > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.countText}>{data?.items.length} Notifications</Text>
          <Pressable onPress={() => markAllRead.mutate()} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        </View>
      )}
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(n) => n.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySubtitle}>No new notifications right now.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => markRead.mutate(item.id)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.cardEmoji}>💈</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</Text>
              </View>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  countText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  markAllButton: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  markAllText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
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
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardPressed: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryTint,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 18 },
  title: { fontWeight: '800', color: colors.text, fontSize: 14 },
  message: { color: colors.textSecondary, marginTop: 8, fontSize: 13, lineHeight: 18 },
  time: { color: colors.textSubtle, marginTop: 2, fontSize: 11 },
});
