import React from 'react';
import { Platform } from 'react-native';
import { StripeProvider } from '@/payments/stripe';
import { STRIPE_PUBLISHABLE_KEY } from '@/config/env';

export function AppStripeProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.barberhub.mobile">
      {children as React.ReactElement}
    </StripeProvider>
  );
}
