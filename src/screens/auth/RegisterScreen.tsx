import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Pressable } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BrandLogo } from '@/components/BrandLogo';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/auth/AuthContext';
import { signInWithGoogle } from '@/auth/googleSignIn';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { RegisterRequestDto } from '@/types/api';
import { getApiErrorMessage } from '@/api/errors';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { setSession } = useAuth();
  const headerHeight = useHeaderHeight();
  const features = useFeatureFlags();
  const [form, setForm] = useState<RegisterRequestDto>({
    fullName: '', email: '', phoneNumber: '', password: '', city: '', isBarber: false,
    shopName: '', shopDescription: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RegisterRequestDto>(key: K, value: RegisterRequestDto[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const tokens = await authApi.googleLogin(idToken);
      await setSession(tokens.accessToken, tokens.refreshToken, tokens.user);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Google sign-up failed.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit() {
    setError(null);
    const trimmedEmail = form.email.trim();
    if (!form.fullName.trim() || !trimmedEmail || !form.password) {
      setError('Full name, email address, and password are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.isBarber && !form.shopName) {
      setError('Please enter your shop name.');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.register({
        ...form,
        email: trimmedEmail.toLowerCase(),
        phoneNumber: form.phoneNumber?.trim() || undefined,
      });
      navigation.navigate('RegisterVerify', {
        registrationTicket: result.registrationTicket,
        email: trimmedEmail.toLowerCase(),
        phoneNumber: form.phoneNumber?.trim() || '',
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={headerHeight} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <BrandLogo size="lg" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join Barber Hub for seamless booking, grooming & marketplace products.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <FormInput label="Full Name" placeholder="e.g. Rahul Sharma" value={form.fullName} onChangeText={(v) => set('fullName', v)} />
          <FormInput
            label="Email Address (Mandatory)"
            placeholder="e.g. rahul@example.com"
            value={form.email}
            onChangeText={(v) => set('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormInput label="Phone Number (optional)" placeholder="e.g. 9876543210" value={form.phoneNumber ?? ''} onChangeText={(v) => set('phoneNumber', v)} keyboardType="phone-pad" />
          <FormInput label="Password" placeholder="Minimum 6 characters" value={form.password} onChangeText={(v) => set('password', v)} secureTextEntry />
          <FormInput label="City (optional)" placeholder="e.g. Pune" value={form.city} onChangeText={(v) => set('city', v)} />

          <View style={styles.switchBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Barber / Shop Owner Account</Text>
              <Text style={styles.switchSub}>Enable if you are listing your salon/shop</Text>
            </View>
            <Switch
              value={form.isBarber}
              onValueChange={(v) => set('isBarber', v)}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={form.isBarber ? colors.primary : '#ffffff'}
            />
          </View>

          {form.isBarber && (
            <View style={styles.barberSection}>
              <Text style={styles.barberSectionTitle}>✂️ Barber Shop Details</Text>
              <FormInput label="Shop Name" placeholder="e.g. Royal Men's Salon" value={form.shopName} onChangeText={(v) => set('shopName', v)} />
              <FormInput label="Shop Description" placeholder="Describe your specialties & experience" value={form.shopDescription} onChangeText={(v) => set('shopDescription', v)} multiline />
              <FormInput label="Shop Address" placeholder="Street, area, landmark" value={form.address} onChangeText={(v) => set('address', v)} multiline />
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  ℹ️ Barber accounts require SuperAdmin approval before going live.
                </Text>
              </View>
            </View>
          )}

          <PrimaryButton title="Create Account & Verify OTP" onPress={onSubmit} loading={loading} style={styles.mt8} />

          {features.googleLoginEnabled && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <PrimaryButton
                title="Sign Up with Google"
                variant="outline"
                onPress={onGoogleSignUp}
                loading={googleLoading}
              />
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </Pressable>
          </View>
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
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    marginBottom: 24,
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
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: borderRadius.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: 16,
    marginTop: 4,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  switchSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  barberSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  barberSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 14,
  },
  infoBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.sm,
    padding: 10,
    marginBottom: 16,
  },
  infoBadgeText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
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
    marginTop: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
