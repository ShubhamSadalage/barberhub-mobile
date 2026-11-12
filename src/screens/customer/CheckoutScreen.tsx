import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStripe } from '@/payments/stripe';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/customerTypes';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ordersApi } from '@/api/endpoints/commerce';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { ApiErrorBody, PaymentMethod } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<ShopStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const features = useFeatureFlags();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    features.onlinePaymentEnabled ? 'Online' : 'CashOnDelivery'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!features.onlinePaymentEnabled && paymentMethod === 'Online') {
      setPaymentMethod('CashOnDelivery');
    }
  }, [features.onlinePaymentEnabled]);

  const checkout = useMutation({
    mutationFn: () => ordersApi.checkout({ shippingAddress, paymentMethod }),
    onError: (e) => {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Checkout failed.');
    },
  });

  async function onPlaceOrder() {
    setError(null);
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }

    const result = await checkout.mutateAsync();

    if (result.isCod) {
      finishUp();
      return;
    }

    // Online payment — hand off to Stripe's Payment Sheet.
    const init = await initPaymentSheet({
      paymentIntentClientSecret: result.clientSecret,
      merchantDisplayName: 'Barber Hub',
    });
    if (init.error) {
      setError(init.error.message);
      return;
    }

    const present = await presentPaymentSheet();
    if (present.error) {
      if (present.error.code !== 'Canceled') {
        setError(present.error.message);
      }
      return;
    }

    finishUp();
  }

  function finishUp() {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    Alert.alert('Order Confirmed!', 'Thank you for your purchase with Barber Hub.', [
      { text: 'View My Orders', onPress: () => navigation.replace('Orders') },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Complete Your Order</Text>
        <Text style={styles.subtitle}>Enter delivery address & select your payment preference.</Text>

        <FormInput
          label="Delivery Address"
          value={shippingAddress}
          onChangeText={setShippingAddress}
          multiline
          placeholder="Flat / house number, street, city, pincode"
        />

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodRow}>
          {features.onlinePaymentEnabled && (
            <Pressable
              style={[styles.methodChip, paymentMethod === 'Online' && styles.methodChipSelected]}
              onPress={() => setPaymentMethod('Online')}
            >
              <Text style={styles.methodEmoji}>💳</Text>
              <Text style={[styles.methodText, paymentMethod === 'Online' && styles.methodTextSelected]}>Pay Online (Card / UPI)</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.methodChip, paymentMethod === 'CashOnDelivery' && styles.methodChipSelected]}
            onPress={() => setPaymentMethod('CashOnDelivery')}
          >
            <Text style={styles.methodEmoji}>💵</Text>
            <Text style={[styles.methodText, paymentMethod === 'CashOnDelivery' && styles.methodTextSelected]}>Cash on Delivery</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <PrimaryButton title="Place Order" onPress={onPlaceOrder} loading={checkout.isPending} style={styles.button} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: colors.background, maxWidth: 520, width: '100%', alignSelf: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10, marginTop: 4 },
  methodRow: { gap: 10, marginBottom: 20 },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  methodChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  methodEmoji: { fontSize: 20, marginRight: 10 },
  methodText: { fontWeight: '700', color: colors.text, fontSize: 14 },
  methodTextSelected: { color: colors.primaryDark },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.dangerText, fontSize: 13, fontWeight: '600' },
  button: { marginTop: 10 },
});
