import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/customerTypes';
import { productsApi, cartApi } from '@/api/endpoints/commerce';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<ShopStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const [added, setAdded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.details(productId),
  });

  const addToCart = useMutation({
    mutationFn: () => cartApi.add(productId, 1),
    onSuccess: () => setAdded(true),
  });

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Product Image Stage */}
      <View style={styles.imageStage}>
        {data.imageUrl ? (
          <Image source={{ uri: data.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🧴</Text>
          </View>
        )}
        {data.discountPercentage ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>SAVE {data.discountPercentage}%</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.seller}>Sold by <Text style={styles.sellerName}>{data.barberName || 'Barber Hub Studio'}</Text></Text>

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{data.effectivePrice}</Text>
            {data.discountPercentage ? (
              <>
                <Text style={styles.strike}>₹{data.price}</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{data.discountPercentage}% OFF</Text>
                </View>
              </>
            ) : null}
          </View>
          <Text style={styles.taxInfo}>Inclusive of all taxes</Text>
        </View>

        {data.description ? (
          <View style={styles.descBox}>
            <Text style={styles.descTitle}>About this item</Text>
            <Text style={styles.description}>{data.description}</Text>
          </View>
        ) : null}

        <View style={styles.stockRow}>
          <Text style={[styles.stock, data.stockQuantity > 0 ? styles.inStock : styles.outOfStock]}>
            {data.stockQuantity > 0 ? `✓ In stock (${data.stockQuantity} available)` : '⚠️ Out of stock'}
          </Text>
        </View>

        <PrimaryButton
          title={added ? 'Added to Cart ✓' : 'Add to Cart'}
          onPress={() => addToCart.mutate()}
          loading={addToCart.isPending}
          disabled={data.stockQuantity === 0}
          style={styles.button}
        />

        {added && (
          <PrimaryButton
            title="Proceed to Cart 🛒"
            variant="secondary"
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartButton}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  imageStage: {
    position: 'relative',
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 72,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    ...shadows.primaryGlow,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  seller: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  sellerName: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  strike: {
    fontSize: 16,
    color: colors.textSubtle,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  saveBadgeText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  taxInfo: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 4,
  },
  descBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stockRow: {
    marginTop: 14,
    marginBottom: 8,
  },
  stock: {
    fontSize: 13,
    fontWeight: '600',
  },
  inStock: {
    color: colors.successText,
  },
  outOfStock: {
    color: colors.dangerText,
  },
  button: {
    marginTop: 12,
  },
  cartButton: {
    marginTop: 10,
  },
});
