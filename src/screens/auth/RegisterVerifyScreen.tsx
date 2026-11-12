import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/auth/AuthContext';
import { getApiErrorMessage } from '@/api/errors';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterVerify'>;

export default function RegisterVerifyScreen({ route }: Props) {
  const { registrationTicket, email } = route.params;
  const { setSession } = useAuth();
  const [emailCode, setEmailCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!emailCode || emailCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.registerVerify(registrationTicket, emailCode.trim());
      await setSession(result.accessToken, result.refreshToken, result.user);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Verification failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✉️</Text>
        </View>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit verification code to <Text style={styles.highlight}>{email}</Text>. Please enter it below to complete your registration.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <FormInput
          label="Email Verification Code"
          placeholder="e.g. 123456"
          value={emailCode}
          onChangeText={setEmailCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <PrimaryButton title="Verify & Complete Registration" onPress={onSubmit} loading={loading} style={styles.mt8} />
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
    fontFamily: typography.fraunces,
    fontSize: 22,
    fontWeight: '700',
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
  highlight: {
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
