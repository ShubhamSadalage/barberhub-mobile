import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi, type PendingBarberDto } from '@/api/endpoints/superAdmin';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function ApprovalsScreen() {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<PendingBarberDto | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sa-approvals'],
    queryFn: () => superAdminApi.approvals(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['sa-dashboard'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => superAdminApi.reject(rejecting!.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['sa-dashboard'] });
      setRejecting(null);
      setReason('');
    },
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
      <FlatList
        data={data ?? []}
        keyExtractor={(b) => b.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySubtitle}>No pending barber applications waiting for review.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.shopName}>{item.shopName || item.fullName}</Text>
              <View style={[styles.statusBadge, item.status === 'Rejected' ? styles.statusBadgeRejected : styles.statusBadgePending]}>
                <Text style={[styles.status, item.status === 'Rejected' ? styles.statusRejected : styles.statusPending]}>
                  {item.status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.owner}>Lead: {item.fullName}</Text>
            <Text style={styles.meta}>✉️ {item.email}</Text>
            {item.phoneNumber && <Text style={styles.meta}>📞 {item.phoneNumber}</Text>}
            {item.address && <Text style={styles.meta}>📍 {item.address}</Text>}
            {item.shopDescription && <Text style={styles.description}>"{item.shopDescription}"</Text>}
            
            {item.status === 'Rejected' && item.rejectionReason && (
              <View style={styles.rejectionBox}>
                <Text style={styles.rejectionReason}>Previous rejection reason: {item.rejectionReason}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <PrimaryButton
                title="✓ Approve Shop"
                onPress={() => approveMutation.mutate(item.id)}
                loading={approveMutation.isPending}
                style={styles.actionButton}
              />
              <PrimaryButton
                title="Reject"
                variant="danger"
                onPress={() => setRejecting(item)}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      />

      <Modal visible={!!rejecting} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Application</Text>
            <Text style={styles.modalSub}>{rejecting?.shopName || rejecting?.fullName}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="State the reason (e.g. Incomplete license, invalid phone)..."
              placeholderTextColor={colors.textSubtle}
              value={reason}
              onChangeText={setReason}
              multiline
            />
            <View style={styles.actionRow}>
              <PrimaryButton title="Cancel" variant="secondary" onPress={() => setRejecting(null)} style={styles.actionButton} />
              <PrimaryButton
                title="Confirm Rejection"
                variant="danger"
                onPress={() => rejectMutation.mutate()}
                loading={rejectMutation.isPending}
                disabled={!reason}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  emptyIcon: { fontSize: 40, marginBottom: 12, color: colors.successText, fontWeight: '800' },
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
  shopName: { fontWeight: '800', color: colors.text, fontSize: 16, flex: 1 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusBadgePending: { backgroundColor: colors.warningSoft, borderColor: '#fde68a' },
  statusBadgeRejected: { backgroundColor: colors.dangerSoft, borderColor: '#fecaca' },
  status: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  statusPending: { color: colors.warningText },
  statusRejected: { color: colors.dangerText },
  owner: { fontWeight: '700', color: colors.primaryDark, fontSize: 13, marginTop: 4 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 18,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.xs,
  },
  rejectionBox: {
    backgroundColor: colors.dangerSoft,
    padding: 8,
    borderRadius: borderRadius.xs,
    marginTop: 8,
  },
  rejectionReason: { color: colors.dangerText, fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionButton: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,29,41,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  modalSub: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 14 },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.text,
  },
});
