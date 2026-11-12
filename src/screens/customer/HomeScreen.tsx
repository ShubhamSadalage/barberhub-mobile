import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/customerTypes';
import { barbersApi } from '@/api/endpoints/barbers';
import { locationApi } from '@/api/endpoints/social';
import { BarberCard } from '@/components/BarberCard';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/auth/AuthContext';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          locationApi.update(lat, lng).catch(() => {});
        }
      } finally {
        setLocationChecked(true);
      }
    })();
  }, []);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['barbers-home', coords?.lat, coords?.lng],
    queryFn: () => barbersApi.home(coords?.lat, coords?.lng),
    enabled: locationChecked,
  });

  const barbersList = data?.barbers ?? data?.items ?? [];
  const locationSourceStr = String(data?.locationSource ?? (data?.source === 0 ? 'Live' : data?.source === 1 ? 'Saved' : data?.source === 2 ? 'City' : 'Featured'));

  return (
    <View style={styles.container}>
      {/* MVC Styled Sticky Navbar with Brand Mark, Notifications & Avatar */}
      <AppHeader />

      <FlatList
        data={barbersList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* User Greeting */}
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>Hi, {user?.fullName?.split(' ')[0] || 'Friend'} 👋</Text>
              <Text style={styles.greetingSub}>Book your premium haircut & grooming</Text>
            </View>

            {/* MVC Hero Banner with Gradient & Radial Glow */}
            <View style={styles.heroBanner}>
              <View style={styles.heroGlow} />
              <Text style={styles.heroTag}>PREMIUM GROOMING PLATFORM</Text>
              <Text style={styles.heroTitle}>Look Sharp, Feel Confident</Text>
              <Text style={styles.heroDesc}>
                Explore top-rated barbers, schedule appointments without queue delays, and order grooming essentials.
              </Text>
            </View>

            {/* Search Pill */}
            <Pressable style={styles.searchBar} onPress={() => navigation.navigate('BarbersList')}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchBarText}>Search barbers by city, shop or name…</Text>
            </Pressable>

            {/* Location Source Indicator */}
            <View style={styles.sourceRow}>
              <Text style={styles.sourceLabel}>
                {locationSourceStr === 'Live' || locationSourceStr === 'LiveLocation'
                  ? '📍 Showing barbers near your live location'
                  : locationSourceStr === 'Saved' || locationSourceStr === 'SavedLocation'
                  ? '📍 Showing barbers near your saved address'
                  : locationSourceStr === 'City'
                  ? `📍 Showing barbers in ${data?.label ?? user?.city ?? 'your area'}`
                  : '✨ Recommended top-rated partner barbers'}
              </Text>
            </View>

            <Text style={styles.sectionHeading}>
              {locationSourceStr === 'Live' || locationSourceStr === 'LiveLocation'
                ? 'Nearby Barber Shops'
                : 'Available Barber Shops'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BarberCard barber={item} onPress={() => navigation.navigate('BarberDetails', { barberId: item.id })} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💈</Text>
              <Text style={styles.emptyTitle}>No barbers listed yet</Text>
              <Text style={styles.emptySubtitle}>Try searching for barbers in other cities or explore marketplace products.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  greetingRow: {
    marginBottom: 14,
  },
  greeting: {
    fontFamily: typography.fraunces,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  heroBanner: {
    backgroundColor: '#1a1d29',
    borderRadius: borderRadius.lg,
    padding: 22,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(239, 91, 91, 0.42)',
  },
  heroTag: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: typography.fraunces,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroDesc: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 13,
    lineHeight: 19,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchBarText: {
    color: colors.textSubtle,
    fontSize: 14,
    fontWeight: '500',
  },
  sourceRow: {
    marginBottom: 12,
  },
  sourceLabel: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sectionHeading: {
    fontFamily: typography.fraunces,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: typography.fraunces,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
