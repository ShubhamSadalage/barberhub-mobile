import React from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/customerTypes';
import { productsApi } from '@/api/endpoints/commerce';
import { AppHeader } from '@/components/AppHeader';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<ShopStackParamList, 'ProductsList'>;

export default function ProductsListScreen({ navigation }: Props) {
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.all() });

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.contentPadding}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Marketplace</Text>
            <Text style={styles.subtitle}>Premium hair styling, beard oils & shaving essentials</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionPillOutline} onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.actionPillOutlineText}>📦 Orders</Text>
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(p) => p.id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 64 }}
            columnWrapperStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
              >
                <View style={styles.imageWrap}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                      <Text style={styles.imagePlaceholderText}>🧴</Text>
                    </View>
                  )}
                  {item.discountPercentage ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.seller} numberOfLines={1}>💈 {item.barberName || 'Barber Hub'}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.effectivePrice}</Text>
                    {item.discountPercentage ? (
                      <Text style={styles.strike}>₹{item.price}</Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛍️</Text>
                <Text style={styles.empty}>No products available right now.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentPadding: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  title: {
    fontFamily: typography.fraunces,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPillOutline: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPillOutlineText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    flex: 1,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardPressed: {
    borderColor: colors.primary,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 130,
    backgroundColor: colors.primaryTint,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 36,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  seller: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  strike: {
    fontSize: 11,
    color: colors.textSubtle,
    textDecorationLine: 'line-through',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
  },
});
