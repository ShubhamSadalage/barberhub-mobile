import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { authApi } from '@/api/endpoints/auth';
import { getApiErrorMessage } from '@/api/errors';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!token || !newPassword) {
      setError('Enter the reset code and your new password.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, token, newPassword);
      navigation.navigate('Login');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Password reset failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🔒</Text>
        </View>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Check your inbox for the reset code sent to <Text style={styles.emailText}>{email}</Text>.</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <FormInput label="Reset Code" placeholder="Enter code received in email" value={token} onChangeText={setToken} />
        <FormInput label="New Password" placeholder="Minimum 6 characters" value={newPassword} onChangeText={setNewPassword} secureTextEntry />

        <PrimaryButton title="Set New Password" onPress={onSubmit} loading={loading} style={styles.mt8} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  emailText: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '600',
  },
  mt8: {
    marginTop: 8,
  },
});
