import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/auth/AuthContext';
import { unregisterPushToken } from '@/push/registerPush';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function SuperAdminProfileScreen() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await unregisterPushToken();
    queryClient.clear();
    await logout();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'S'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>SUPERADMIN PRIVILEGES</Text>
        </View>

        {user?.twoFactorEnabled && (
          <View style={styles.twoFaBox}>
            <Text style={styles.twoFa}>🔒 Two-factor authentication (2FA) is active on this master account.</Text>
          </View>
        )}

        <PrimaryButton title="Log Out from Session" onPress={handleLogout} variant="danger" style={styles.button} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.primaryGlow,
  },
  avatarText: { color: '#ffffff', fontSize: 38, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  roleBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  roleText: { color: colors.primaryDark, fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  twoFaBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: borderRadius.sm,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  twoFa: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  button: { marginTop: 24, width: '100%' },
});
