import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SuperAdminUsersStackParamList } from '@/navigation/superAdminTypes';
import { superAdminApi, type ManagedBarberDto } from '@/api/endpoints/superAdmin';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<SuperAdminUsersStackParamList, 'ManageBarbers'>;

export default function ManageBarbersScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ['sa-barbers'], queryFn: () => superAdminApi.barbers() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.deleteBarber(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sa-barbers'] }),
  });
  const restoreMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.restoreBarber(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sa-barbers'] }),
  });

  function confirmDelete(b: ManagedBarberDto) {
    Alert.alert('Deactivate Barber Shop', `Are you sure you want to deactivate ${b.shopName || b.fullName}'s account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: () => deleteMutation.mutate(b.id) },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <Text style={styles.topNavTitle}>Partner Barber Shops</Text>
        <Pressable onPress={() => navigation.navigate('ManageUsers')} style={styles.switchButton}>
          <Text style={styles.switchLinkText}>View Customers →</Text>
        </Pressable>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(b) => b.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>No partner barbers registered yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.shopName || item.fullName).charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, item.isDeleted && styles.strikethrough]}>{item.shopName || item.fullName}</Text>
              <Text style={styles.meta}>👤 {item.fullName} · ✉️ {item.email}</Text>
              {item.phoneNumber ? <Text style={styles.meta}>📞 {item.phoneNumber}</Text> : null}
              <View style={styles.badgesRow}>
                <View style={[styles.approvalBadge, item.approvalStatus === 'Approved' ? styles.badgeApproved : styles.badgePending]}>
                  <Text style={[styles.approvalText, item.approvalStatus === 'Approved' ? styles.approvalApproved : styles.approvalPending]}>
                    {item.approvalStatus}
                  </Text>
                </View>
                {item.isDeleted && (
                  <View style={styles.deletedBadge}>
                    <Text style={styles.deletedTag}>DEACTIVATED</Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable
              style={item.isDeleted ? styles.restoreBtn : styles.deleteBtn}
              onPress={() => (item.isDeleted ? restoreMutation.mutate(item.id) : confirmDelete(item))}
            >
              <Text style={item.isDeleted ? styles.restoreText : styles.deleteText}>
                {item.isDeleted ? 'Restore' : 'Deactivate'}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topNavTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  switchButton: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  switchLinkText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  empty: { textAlign: 'center', color: colors.textMuted },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
  strikethrough: { textDecorationLine: 'line-through', color: colors.textSubtle },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  approvalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  badgeApproved: { backgroundColor: colors.successSoft, borderColor: '#bbf7d0' },
  badgePending: { backgroundColor: colors.warningSoft, borderColor: '#fde68a' },
  approvalText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  approvalApproved: { color: colors.successText },
  approvalPending: { color: colors.warningText },
  deletedBadge: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  deletedTag: { color: colors.dangerText, fontSize: 10, fontWeight: '800' },
  deleteBtn: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
  },
  deleteText: { color: colors.dangerText, fontWeight: '700', fontSize: 12 },
  restoreBtn: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
  },
  restoreText: { color: colors.successText, fontWeight: '700', fontSize: 12 },
});
