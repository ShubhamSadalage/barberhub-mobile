import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import RegisterVerifyScreen from '@/screens/auth/RegisterVerifyScreen';
import OtpLoginScreen from '@/screens/auth/OtpLoginScreen';
import OtpVerifyScreen from '@/screens/auth/OtpVerifyScreen';
import TwoFactorChallengeScreen from '@/screens/auth/TwoFactorChallengeScreen';
import TwoFactorEnrollScreen from '@/screens/auth/TwoFactorEnrollScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreenSafe = withSafeTop(LoginScreen);

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  const insets = useSafeAreaInsets();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
        // Keep the bottom of auth forms clear of the gesture / navigation bar.
        contentStyle: { paddingBottom: insets.bottom, backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="RegisterVerify" component={RegisterVerifyScreen} options={{ title: 'Verify Email' }} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} options={{ title: 'OTP Sign In' }} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="TwoFactorChallenge" component={TwoFactorChallengeScreen} options={{ title: 'Security Check', headerBackVisible: false }} />
      <Stack.Screen name="TwoFactorEnroll" component={TwoFactorEnrollScreen} options={{ title: 'Setup 2FA', headerBackVisible: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'New Password' }} />
    </Stack.Navigator>
  );
}
