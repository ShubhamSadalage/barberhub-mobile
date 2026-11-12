import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/auth/AuthContext';
import type { ApiErrorBody, LoginResponseDto, TokenResponseDto } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

function isTokenResponse(x: LoginResponseDto | TokenResponseDto): x is TokenResponseDto {
  return (x as TokenResponseDto).accessToken !== undefined;
}

export default function OtpVerifyScreen({ route, navigation }: Props) {
  const { recipient, channel } = route.params;
  const { setSession } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!code) {
      setError('Enter the 6-digit code you received.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.otpVerify(recipient, channel, code.trim());

      if (isTokenResponse(result)) {
        await setSession(result.accessToken, result.refreshToken, result.user);
      } else if (result.requires2fa) {
        navigation.navigate('TwoFactorChallenge', { twoFactorToken: result.twoFactorToken! });
      }
    } catch (e) {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🔢</Text>
        </View>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit security code to <Text style={styles.recipientText}>{recipient}</Text>
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <FormInput
          label="Verification Code"
          placeholder="e.g. 123456"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <PrimaryButton title="Verify & Continue" onPress={onSubmit} loading={loading} style={styles.mt8} />
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
  recipientText: {
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
