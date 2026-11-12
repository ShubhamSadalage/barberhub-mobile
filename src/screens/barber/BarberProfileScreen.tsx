import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/auth/AuthContext';
import { authApi } from '@/api/endpoints/auth';
import { unregisterPushToken } from '@/push/registerPush';
import { colors, shadows, borderRadius } from '@/theme/colors';

export default function BarberProfileScreen() {
  const { user, refreshMe, logout } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [shopName, setShopName] = useState(user?.shopName ?? '');
  const [shopDescription, setShopDescription] = useState(user?.shopDescription ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [saved, setSaved] = useState(false);

  const updateProfile = useMutation({
    mutationFn: () =>
      authApi.updateProfile({ fullName, phoneNumber, city, address }),
    onSuccess: async () => {
      await refreshMe();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) =>
      authApi.uploadPhoto(asset.uri, asset.fileName ?? 'photo.jpg', asset.mimeType ?? 'image/jpeg'),
    onSuccess: () => refreshMe(),
  });

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) uploadPhoto.mutate(result.assets[0]);
  }

  async function handleLogout() {
    await unregisterPushToken();
    queryClient.clear();
    await logout();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
          {user?.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{(user?.shopName || user?.fullName || '?').charAt(0)}</Text>
            </View>
          )}
          <View style={styles.changeBadge}>
            <Text style={styles.changeBadgeText}>📷 Change Shop Photo</Text>
          </View>
        </Pressable>

        {user?.approvalStatus && (
          <View style={[styles.badge, user.approvalStatus === 'Approved' ? styles.badgeApproved : styles.badgePending]}>
            <Text style={[styles.badgeText, user.approvalStatus === 'Approved' ? styles.badgeTextApproved : styles.badgeTextPending]}>
              {user.approvalStatus === 'Approved' ? '✓ Verified Partner Shop' : '⏳ Approval Pending'}
            </Text>
          </View>
        )}

        <FormInput label="Shop Name" value={shopName} onChangeText={setShopName} editable={false} />
        <Text style={styles.hint}>Shop name is registered and locked. Contact support to rename.</Text>

        <FormInput label="Owner / Lead Barber Name" value={fullName} onChangeText={setFullName} />
        <FormInput label="Contact Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <FormInput label="City" value={city} onChangeText={setCity} />
        <FormInput label="Physical Shop Address" value={address} onChangeText={setAddress} multiline />

        {saved && (
          <View style={styles.savedBox}>
            <Text style={styles.saved}>✓ Barber profile updated successfully!</Text>
          </View>
        )}

        <PrimaryButton title="Save Shop Profile" onPress={() => updateProfile.mutate()} loading={updateProfile.isPending} style={styles.button} />
        <PrimaryButton title="Log Out" onPress={handleLogout} variant="danger" style={styles.logoutButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.background,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 36,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  avatarWrap: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: borderRadius.full, backgroundColor: colors.primarySoft },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 38, fontWeight: '800', color: colors.primary },
  changeBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: 8,
  },
  changeBadgeText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: 20,
    borderWidth: 1,
  },
  badgeApproved: { backgroundColor: colors.successSoft, borderColor: '#bbf7d0' },
  badgePending: { backgroundColor: colors.warningSoft, borderColor: '#fde68a' },
  badgeText: { fontWeight: '700', fontSize: 12 },
  badgeTextApproved: { color: colors.successText },
  badgeTextPending: { color: colors.warningText },
  hint: { fontSize: 11, color: colors.textSubtle, marginTop: -8, marginBottom: 16, marginLeft: 2 },
  savedBox: {
    backgroundColor: colors.successSoft,
    padding: 12,
    borderRadius: borderRadius.sm,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  saved: { color: colors.successText, fontWeight: '700', textAlign: 'center', fontSize: 13 },
  button: { marginTop: 8 },
  logoutButton: { marginTop: 12 },
});
