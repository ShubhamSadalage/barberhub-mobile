import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/barberTypes';
import { adminApi } from '@/api/endpoints/barberOps';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/auth/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const features = useFeatureFlags();
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.dashboard() });

  return (
    <View style={styles.flex}>
      <AppHeader />

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
        {/* Top Shop Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerShop}>{user?.shopName || user?.fullName}</Text>
          <Text style={styles.bannerSubtitle}>Barber Shop Operations & Metrics</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.grid}>
            <StatCard icon="📅" label="Today's Bookings" value={data?.todayBookings ?? 0} highlight />
            <StatCard icon="⏳" label="Pending Approvals" value={data?.pendingBookings ?? 0} />
            <StatCard icon="✂️" label="Total Bookings" value={data?.bookingsCount ?? 0} />
            {features.productsEnabled && (
              <StatCard icon="📦" label="Products in Shop" value={data?.productsCount ?? 0} />
            )}
            {features.earningsFinancialsEnabled && (
              <StatCard icon="💰" label="Total Revenue Earned" value={`₹${data?.totalEarnings ?? 0}`} wide />
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Shop Quick Actions</Text>
        <QuickLink icon="✂️" label="Manage Services & Pricing" onPress={() => navigation.navigate('Services')} />
        <QuickLink icon="➕" label="Book on Behalf of Walk-in Customer" onPress={() => navigation.navigate('CreateBookingOnBehalf')} />
        <QuickLink icon="👥" label="Customer List & History" onPress={() => navigation.navigate('Customers')} />
        {features.earningsFinancialsEnabled && (
          <QuickLink icon="📈" label="Earnings & Financials" onPress={() => navigation.navigate('Earnings')} />
        )}
        <QuickLink icon="🏖️" label="Leave Days & Weekly Holidays" onPress={() => navigation.navigate('LeaveDays')} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, wide, highlight }: { icon: string; label: string; value: string | number; wide?: boolean; highlight?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.cardWide, highlight && styles.cardHighlight]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        {highlight ? (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>TODAY</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

function QuickLink({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.link, pressed && styles.linkPressed]} onPress={onPress}>
      <View style={styles.linkLeft}>
        <View style={styles.linkIconCircle}>
          <Text style={styles.linkIconText}>{icon}</Text>
        </View>
        <Text style={styles.linkText}>{label}</Text>
      </View>
      <Text style={styles.linkChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  bannerShop: {
    fontFamily: typography.fraunces,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  bannerSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardWide: { flexBasis: '100%' },
  cardHighlight: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: { fontSize: 22 },
  liveBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  liveBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  cardValue: {
    fontFamily: typography.fraunces,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  cardLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  sectionTitle: {
    fontFamily: typography.fraunces,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  linkPressed: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIconCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkIconText: { fontSize: 16 },
  linkText: { fontWeight: '700', color: colors.text, fontSize: 14 },
  linkChevron: { color: colors.primary, fontSize: 22, fontWeight: '700' },
});
