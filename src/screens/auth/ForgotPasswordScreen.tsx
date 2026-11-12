import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { authApi } from '@/api/endpoints/auth';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit() {
    if (!email) return;
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim());
      setMessage(result.message);
      setTimeout(() => navigation.navigate('ResetPassword', { email: email.trim() }), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🔑</Text>
        </View>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>Enter the email address associated with your Barber Hub account.</Text>

        {message ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>✓ {message}</Text>
          </View>
        ) : null}

        <FormInput
          label="Email Address"
          placeholder="e.g. you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PrimaryButton title="Send Password Reset Code" onPress={onSubmit} loading={loading} style={styles.mt8} />
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
  infoBox: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    color: colors.successText,
    fontSize: 13,
    fontWeight: '600',
  },
  mt8: {
    marginTop: 8,
  },
});
