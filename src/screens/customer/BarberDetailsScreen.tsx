import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/customerTypes';
import { barbersApi } from '@/api/endpoints/barbers';
import type { BarberDetailsDto, ServiceDto } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'BarberDetails'>;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BarberDetailsScreen({ route, navigation }: Props) {
  const { barberId } = route.params;

  const { data, isLoading } = useQuery<BarberDetailsDto>({
    queryKey: ['barber-details', barberId],
    queryFn: () => barbersApi.details(barberId),
  });

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barber Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          {data.profileImageUrl ? (
            <Image source={{ uri: data.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{(data.shopName || data.fullName).charAt(0)}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.shopName}>{data.shopName || data.fullName}</Text>
            <Text style={styles.address}>📍 {data.address || data.city || 'Barber Hub Partner'}</Text>
            {data.openingTime && data.closingTime && (
              <View style={styles.hoursBadge}>
                <Text style={styles.hours}>
                  🕒 {data.openingTime.slice(0, 5)} – {data.closingTime.slice(0, 5)}
                  {data.weeklyHoliday !== undefined && ` · Closed ${DAY_NAMES[data.weeklyHoliday]}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {data.shopDescription ? <Text style={styles.description}>{data.shopDescription}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.chatButton, pressed && styles.chatButtonPressed]}
          onPress={() => navigation.navigate('ChatConversation', { otherUserId: barberId, otherUserName: data.fullName })}
        >
          <Text style={styles.chatButtonEmoji}>💬</Text>
          <Text style={styles.chatButtonText}>Message Barber</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Available Services</Text>

      <FlatList
        data={data.services.filter((s: ServiceDto) => s.isActive !== false)}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.servicesList}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.serviceCard, pressed && styles.serviceCardPressed]}
            onPress={() => navigation.navigate('Booking', { barberId, serviceId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceMeta}>⏱️ {item.durationMinutes} mins · {item.category || 'Grooming'}</Text>
              {item.description ? <Text style={styles.serviceDesc}>{item.description}</Text> : null}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.servicePrice}>₹{item.price}</Text>
              <View style={styles.bookPill}>
                <Text style={styles.bookPillText}>Book</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.empty}>No active services listed yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySoft,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
  },
  headerInfo: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  address: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  hoursBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  hours: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    lineHeight: 18,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  chatButtonPressed: {
    opacity: 0.8,
    backgroundColor: '#fed7aa',
  },
  chatButtonEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    color: colors.text,
  },
  servicesList: {
    paddingBottom: 28,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    ...shadows.sm,
  },
  serviceCardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  serviceMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  serviceDesc: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  bookPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  bookPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 24,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
  },
});
