import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BrandLogo } from '@/components/BrandLogo';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/auth/AuthContext';
import { signInWithGoogle } from '@/auth/googleSignIn';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { ApiErrorBody } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { setSession } = useAuth();
  // Login has no header; withSafeTop pads it by the status-bar inset.
  const insets = useSafeAreaInsets();
  const features = useFeatureFlags();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const tokens = await authApi.googleLogin(idToken);
      await setSession(tokens.accessToken, tokens.refreshToken, tokens.user);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Google sign-in failed.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit() {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.login(trimmed.toLowerCase(), password);

      if (result.requires2fa) {
        navigation.navigate('TwoFactorChallenge', {
          twoFactorToken: result.twoFactorToken!,
          requiresEnrollment: result.requiresTwoFactorEnrollment,
        });
        return;
      }

      const tokens = result.tokens!;
      await setSession(tokens.accessToken, tokens.refreshToken, tokens.user);
    } catch (e) {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <BrandLogo size="lg" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to manage appointments, services & retail orders.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <FormInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="e.g. user@barberhub.com"
          />
          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <PrimaryButton title="Log In with Email" onPress={onSubmit} loading={loading} style={styles.mt8} />

          {features.googleLoginEnabled && (
            <PrimaryButton
              title="Continue with Google"
              variant="outline"
              onPress={onGoogleSignIn}
              loading={googleLoading}
              style={styles.googleBtn}
            />
          )}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <PrimaryButton
            title="Log In with Email One-Time Code"
            variant="secondary"
            onPress={() => navigation.navigate('OtpLogin')}
          />

          <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkRow}>
            <Text style={styles.link}>Forgot your password?</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account yet? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create an Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
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
  googleBtn: {
    marginTop: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  linkRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});
