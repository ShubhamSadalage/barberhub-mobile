import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/auth/AuthContext';
import { notificationsApi } from '@/api/endpoints/social';
import { cartApi } from '@/api/endpoints/commerce';
import { colors, shadows, borderRadius } from '@/theme/colors';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

export function AppHeader({ title, showBack, onBackPress }: AppHeaderProps) {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();

  const { data: notifications } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        const res = await notificationsApi.recent();
        return res.unreadCount || 0;
      } catch {
        return 0;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });

  const { data: cart } = useQuery({
    queryKey: ['cart-header-count'],
    queryFn: async () => {
      try {
        return await cartApi.get();
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && user?.role === 'User',
    refetchInterval: 20_000,
  });

  const unreadCount = typeof notifications === 'number' ? notifications : 0;
  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const initial = (user?.fullName || user?.shopName || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        {showBack ? (
          <Pressable
            onPress={onBackPress || (() => navigation.goBack())}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        ) : null}

        <BrandLogo size="sm" onPress={() => navigation.navigate('Home' as never)} />

        {title ? (
          <View style={styles.titleDivider}>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : null}
      </View>

      {isAuthenticated ? (
        <View style={styles.rightSection}>
          {/* Notification Bell with Badge */}
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Cart Pill for Customers */}
          {user?.role === 'User' && (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Cart' as never)}
            >
              <Ionicons name="bag-handle-outline" size={20} color={colors.text} />
              {cartCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
          )}

          {/* User Avatar with MVC Gradient */}
          <Pressable
            style={({ pressed }) => [styles.avatarPill, pressed && styles.pressed]}
            onPress={() => navigation.navigate('ProfileTab' as never)}
          >
            {user?.profileImageUrl ? (
              <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarInitial}>{initial}</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
    ...shadows.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 2,
  },
  titleDivider: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    marginLeft: 6,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarPill: {
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
