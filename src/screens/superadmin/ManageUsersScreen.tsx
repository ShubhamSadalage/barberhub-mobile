import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SuperAdminUsersStackParamList } from '@/navigation/superAdminTypes';
import { superAdminApi, type ManagedUserDto } from '@/api/endpoints/superAdmin';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<SuperAdminUsersStackParamList, 'ManageUsers'>;

export default function ManageUsersScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ['sa-users'], queryFn: () => superAdminApi.users() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sa-users'] }),
  });
  const restoreMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.restoreUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sa-users'] }),
  });

  function confirmDelete(u: ManagedUserDto) {
    Alert.alert('Deactivate Customer', `Are you sure you want to deactivate ${u.fullName}'s account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: () => deleteMutation.mutate(u.id) },
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
        <Text style={styles.topNavTitle}>Customer Accounts</Text>
        <Pressable onPress={() => navigation.navigate('ManageBarbers')} style={styles.switchButton}>
          <Text style={styles.switchLinkText}>View Barbers →</Text>
        </Pressable>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(u) => u.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>No registered customers found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, item.isDeleted && styles.strikethrough]}>{item.fullName}</Text>
              <Text style={styles.meta}>✉️ {item.email}</Text>
              {item.phoneNumber ? <Text style={styles.meta}>📞 {item.phoneNumber}</Text> : null}
              {item.isDeleted && (
                <View style={styles.deletedBadge}>
                  <Text style={styles.deletedTag}>DEACTIVATED</Text>
                </View>
              )}
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
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.primary },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
  strikethrough: { textDecorationLine: 'line-through', color: colors.textSubtle },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  deletedBadge: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: 4,
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
