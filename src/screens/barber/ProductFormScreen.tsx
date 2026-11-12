import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BarberProductsStackParamList } from '@/navigation/barberTypes';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { barberProductsApi } from '@/api/endpoints/barberOps';
import type { ApiErrorBody } from '@/types/api';
import { AxiosError } from 'axios';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<BarberProductsStackParamList, 'ProductForm'>;

export default function ProductFormScreen({ route, navigation }: Props) {
  const productId = route.params?.productId;
  const queryClient = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ['product-edit', productId],
    queryFn: () => barberProductsApi.forEdit(productId!),
    enabled: !!productId,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? '');
      setDescription(existing.description ?? '');
      setCategory(existing.category ?? 'General');
      setPrice(String(existing.price ?? ''));
      setCostPrice(existing.costPrice ? String(existing.costPrice) : '');
      setDiscountPercentage(existing.discountPercentage ? String(existing.discountPercentage) : '');
      setStockQuantity(String(existing.stockQuantity ?? ''));
      setIsActive(existing.isActive ?? true);
      setExistingImageUrl(existing.existingImageUrl ?? null);
    }
  }, [existing]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageAsset(result.assets[0]);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append('Name', name);
      form.append('Description', description);
      form.append('Category', category);
      form.append('Price', price);
      if (costPrice) form.append('CostPrice', costPrice);
      if (discountPercentage) form.append('DiscountPercentage', discountPercentage);
      form.append('StockQuantity', stockQuantity);
      form.append('IsActive', String(isActive));
      if (imageAsset) {
        // @ts-expect-error RN FormData file shape
        form.append('Image', { uri: imageAsset.uri, name: imageAsset.fileName ?? 'photo.jpg', type: imageAsset.mimeType ?? 'image/jpeg' });
      }
      return productId ? barberProductsApi.edit(productId, form) : barberProductsApi.create(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      navigation.goBack();
    },
    onError: (e) => {
      const err = e as AxiosError<ApiErrorBody>;
      setError(err.response?.data?.error ?? 'Could not save product.');
    },
  });

  function onSubmit() {
    setError(null);
    if (!name || !price || !stockQuantity) {
      setError('Please fill in name, price, and stock quantity.');
      return;
    }
    saveMutation.mutate();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{productId ? 'Edit Product' : 'Add Retail Product'}</Text>
        <Text style={styles.subtitle}>List hair, beard, or skin care products in the shop.</Text>

        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {imageAsset ? (
            <Image source={{ uri: imageAsset.uri }} style={styles.image} />
          ) : existingImageUrl ? (
            <Image source={{ uri: existingImageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Text style={styles.imagePickerIcon}>📸</Text>
              <Text style={styles.imagePlaceholderText}>Tap to select product photo</Text>
            </View>
          )}
        </Pressable>

        <FormInput label="Product Name" placeholder="e.g. Matte Clay Hair Pomade" value={name} onChangeText={setName} />
        <FormInput label="Description (optional)" placeholder="Styling hold, shine, scent, and ingredients" value={description} onChangeText={setDescription} multiline />
        <FormInput label="Category" value={category} onChangeText={setCategory} placeholder="Styling, Beard Care, Hair Care, Shaving…" />
        <FormInput label="Selling Price (₹)" placeholder="e.g. 550" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <View style={styles.costBox}>
          <View style={styles.costHeader}>
            <Text style={styles.costTitle}>Buying / Wholesale Cost (₹)</Text>
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>🔒 Private to you</Text>
            </View>
          </View>
          <FormInput
            label=""
            placeholder="e.g. 250 (cost per single product)"
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="numeric"
          />
          <Text style={styles.costHint}>
            Never visible to customers or admins. Used solely for your product profit & financial calculations.
          </Text>
        </View>

        <FormInput label="Discount % (optional)" placeholder="e.g. 10 (for 10% off)" value={discountPercentage} onChangeText={setDiscountPercentage} keyboardType="numeric" />
        <FormInput label="Stock Quantity" placeholder="e.g. 25" value={stockQuantity} onChangeText={setStockQuantity} keyboardType="numeric" />

        <View style={styles.switchBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Available in Marketplace</Text>
            <Text style={styles.switchSub}>Display this product on the public shop catalogue</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={isActive ? colors.primary : '#ffffff'}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <PrimaryButton title={productId ? "Save Product Changes" : "Publish Product"} onPress={onSubmit} loading={saveMutation.isPending} style={styles.mt8} />
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
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryTint,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerIcon: { fontSize: 32, marginBottom: 6 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholderText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
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
  switchLabel: { fontWeight: '700', color: colors.text, fontSize: 14 },
  switchSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 16,
  },
  error: { color: colors.dangerText, fontWeight: '600', fontSize: 13 },
  costBox: {
    backgroundColor: '#f8fafc',
    borderRadius: borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  costHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  costTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  privateBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  privateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1',
  },
  costHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },
  mt8: { marginTop: 8 },
});
