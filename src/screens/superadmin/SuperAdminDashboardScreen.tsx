import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SuperAdminDashboardStackParamList } from '@/navigation/superAdminTypes';
import { superAdminApi } from '@/api/endpoints/superAdmin';
import { AppHeader } from '@/components/AppHeader';
import { colors, shadows, borderRadius } from '@/theme/colors';
import { typography } from '@/theme/fonts';

type Props = NativeStackScreenProps<SuperAdminDashboardStackParamList, 'SADashboard'>;

export default function SuperAdminDashboardScreen({ navigation }: Props) {
  const { data, isLoading } = useQuery({ queryKey: ['sa-dashboard'], queryFn: () => superAdminApi.dashboard() });

  return (
    <View style={styles.flex}>
      <AppHeader />

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>BarberHub Master Control</Text>
          <Text style={styles.bannerSub}>Platform-wide metrics, partner approvals & marketplace statistics</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.grid}>
            <StatCard
              icon="⏳"
              label="Pending Approvals"
              value={data?.pendingBarbers ?? 0}
              highlight={!!data?.pendingBarbers}
              onPress={() => navigation.navigate('Approvals')}
            />
            <StatCard icon="💈" label="Active Barbers" value={data?.approvedBarbers ?? 0} />
            <StatCard icon="🏪" label="Total Registered Shops" value={data?.totalBarbers ?? 0} />
            <StatCard icon="👥" label="Total Customers" value={data?.totalUsers ?? 0} />
            <StatCard icon="🛍️" label="Platform Products" value={data?.marketplaceProducts ?? 0} />
            <StatCard icon="🧴" label="Barber Shop Products" value={data?.barberProducts ?? 0} />
            <StatCard icon="✂️" label="Total Appointments" value={data?.totalBookings ?? 0} />
            <StatCard icon="📦" label="Total Retail Orders" value={data?.totalOrders ?? 0} />
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => navigation.navigate('Approvals')}
        >
          <View style={styles.actionLeft}>
            <Text style={styles.actionIcon}>🛡️</Text>
            <View>
              <Text style={styles.actionText}>Review Partner Barber Approvals</Text>
              <Text style={styles.actionSub}>Verify new barbers, shops & registration requests</Text>
            </View>
          </View>
          {!!data?.pendingBarbers && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{data.pendingBarbers} PENDING</Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
  onPress,
}: {
  icon: string;
  label: string;
  value: number;
  highlight?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        {highlight ? (
          <View style={styles.actionPill}>
            <Text style={styles.actionPillText}>ACTION</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.cardValue, highlight && styles.cardValueHighlight]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={{ flexBasis: '48%' }} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
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
  bannerTitle: {
    fontFamily: typography.fraunces,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  bannerSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHighlight: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: { fontSize: 20 },
  actionPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  actionPillText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  cardValue: {
    fontFamily: typography.fraunces,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  cardValueHighlight: { color: colors.primary },
  cardLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: 18,
    marginTop: 8,
    ...shadows.primaryGlow,
  },
  actionCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIcon: { fontSize: 24 },
  actionText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  actionSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  badge: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: { color: colors.primaryDark, fontWeight: '800', fontSize: 11 },
});
