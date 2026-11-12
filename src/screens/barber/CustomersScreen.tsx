import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/endpoints/barberOps';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getApiErrorMessage } from '@/api/errors';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function CustomersScreen() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('Welcome@123');
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.users() });

  const addMutation = useMutation({
    mutationFn: () => adminApi.addUser({ fullName, email, phoneNumber, city, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowAdd(false);
      setFullName(''); setEmail(''); setPhoneNumber(''); setCity('');
    },
    onError: (e) => {
      setError(getApiErrorMessage(e, 'Could not add customer.'));
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
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No registered customers</Text>
            <Text style={styles.emptySubtitle}>You can add walk-in clients manually or they appear here once they book appointments.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.meta}>✉️ {item.email}</Text>
              {item.phoneNumber ? <Text style={styles.meta}>📞 {item.phoneNumber}</Text> : null}
            </View>
          </View>
        )}
      />
      <PrimaryButton title="+ Add New Client" onPress={() => setShowAdd(true)} style={styles.addButton} />

      <Modal visible={showAdd} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Walk-in Client Profile</Text>
            <Text style={styles.modalSub}>Create an account on behalf of a regular walk-in customer.</Text>

            <FormInput label="Full Name" placeholder="e.g. Rahul Sharma" value={fullName} onChangeText={setFullName} />
            <FormInput label="Email Address" placeholder="rahul@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <FormInput label="Phone Number" placeholder="9876543210" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
            <FormInput label="City" placeholder="Pune" value={city} onChangeText={setCity} />
            <FormInput label="Default Password" value={password} onChangeText={setPassword} />
            
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton title="Create Client Account" onPress={() => addMutation.mutate()} loading={addMutation.isPending} style={{ marginTop: 10 }} />
            <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowAdd(false)} style={{ marginTop: 8 }} />
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
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  addButton: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  modalSub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 14,
  },
  error: { color: colors.dangerText, fontWeight: '600', fontSize: 13 },
});
