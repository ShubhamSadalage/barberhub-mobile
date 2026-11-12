import React from 'react';

export interface StripeProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
  merchantIdentifier?: string;
  urlScheme?: string;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return <>{children}</>;
}

export function useStripe() {
  return {
    initPaymentSheet: async (_params?: { paymentIntentClientSecret?: string; merchantDisplayName?: string }) => ({
      error: { code: 'Unsupported', message: 'Stripe PaymentSheet is not supported in the web browser. Please select Cash on Delivery or use the mobile app.' },
    }),
    presentPaymentSheet: async () => ({
      error: { code: 'Unsupported', message: 'Stripe PaymentSheet is not supported in the web browser.' },
    }),
  };
}
