import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/auth/AuthContext';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function PendingApprovalScreen() {
  const { user, logout } = useAuth();
  const isRejected = user?.approvalStatus === 'Rejected';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconCircle, isRejected ? styles.iconCircleRejected : styles.iconCirclePending]}>
          <Text style={styles.icon}>{isRejected ? '🚫' : '⏳'}</Text>
        </View>
        <Text style={styles.title}>{isRejected ? 'Registration Not Approved' : 'Review Underway'}</Text>
        <Text style={styles.subtitle}>
          {isRejected
            ? user?.approvalRejectionReason ?? 'Your barber registration was not approved by the platform administrator.'
            : "Your barber account is awaiting SuperAdmin verification. You'll receive full access once approved."}
        </Text>
        <PrimaryButton title="Log Out" onPress={logout} variant="secondary" style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    maxWidth: 440,
    width: '100%',
    ...shadows.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCirclePending: {
    backgroundColor: colors.primarySoft,
  },
  iconCircleRejected: {
    backgroundColor: colors.dangerSoft,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    minWidth: 180,
  },
});
