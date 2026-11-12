import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/auth/AuthContext';
import type { ApiErrorBody } from '@/types/api';
import { AxiosError } from 'axios';

type Props = NativeStackScreenProps<AuthStackParamList, 'TwoFactorChallenge'>;

export default function TwoFactorChallengeScreen({ route, navigation }: Props) {
  const { twoFactorToken, requiresEnrollment } = route.params;
  const { setSession } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requiresEnrollment) {
      navigation.replace('TwoFactorEnroll', { twoFactorToken });
    }
  }, [requiresEnrollment]);

  async function onSubmit() {
    setError(null);
    if (!code) {
      setError('Enter your 6-digit authenticator code.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.twoFactorChallenge(twoFactorToken, code);
      await setSession(result.accessToken, result.refreshToken, result.user);
    } catch (e) {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Invalid code.');
    } finally {
      setLoading(false);
    }
  }

  if (requiresEnrollment) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Two-factor verification</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code from your authenticator app.</Text>

      <FormInput label="Authenticator code" value={code} onChangeText={setCode} keyboardType="number-pad" />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton title="Verify" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  errorText: { color: '#d33', marginBottom: 12 },
});
