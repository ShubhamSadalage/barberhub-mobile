import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/auth/AuthContext';
import type { ApiErrorBody } from '@/types/api';
import { AxiosError } from 'axios';

type Props = NativeStackScreenProps<AuthStackParamList, 'TwoFactorEnroll'>;

export default function TwoFactorEnrollScreen({ route }: Props) {
  const { twoFactorToken } = route.params;
  const { setSession } = useAuth();
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const setup = await authApi.twoFactorEnroll(twoFactorToken);
        setQrCodeDataUri(setup.qrCodePngDataUri);
        setSecret(setup.secret);
      } catch {
        setError('Could not start 2FA setup. Please try logging in again.');
      } finally {
        setLoadingSetup(false);
      }
    })();
  }, [twoFactorToken]);

  async function onConfirm() {
    setError(null);
    if (!code) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await authApi.twoFactorEnrollConfirm(twoFactorToken, code);
      await setSession(result.accessToken, result.refreshToken, result.user);
    } catch (e) {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Invalid code.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingSetup) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Set up two-factor authentication</Text>
      <Text style={styles.subtitle}>
        Scan this QR code with Google Authenticator, Authy, or any TOTP app.
      </Text>

      {qrCodeDataUri && <Image source={{ uri: qrCodeDataUri }} style={styles.qr} resizeMode="contain" />}

      <Text style={styles.secretLabel}>Or enter this key manually:</Text>
      <Text selectable style={styles.secret}>{secret}</Text>

      <FormInput label="Enter the 6-digit code to confirm" value={code} onChangeText={setCode} keyboardType="number-pad" />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton title="Confirm & continue" onPress={onConfirm} loading={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  qr: { width: 220, height: 220, alignSelf: 'center', marginBottom: 16 },
  secretLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  secret: { fontSize: 14, fontWeight: '700', letterSpacing: 1, marginBottom: 20 },
  errorText: { color: '#d33', marginBottom: 12 },
});
