import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { adminApi } from '@/api/endpoints/barberOps';
import type { EarningsDto, ProductFinancialRow, DailyProductEarningRow, DailyEarningRow, ServiceEarningRow } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

type TabKey = 'services' | 'products';

export default function EarningsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('services');
  const { data, isLoading } = useQuery<EarningsDto>({ queryKey: ['earnings'], queryFn: () => adminApi.earnings() });

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const serviceEarnings = data.serviceTotalEarnings ?? data.totalEarnings ?? 0;
  const productRevenue = data.productTotalRevenue ?? 0;
  const productCost = data.productTotalCost ?? 0;
  const productProfit = data.productNetProfit ?? 0;
  const productMargin = data.productProfitMarginPercentage ?? 0;
  const combinedRevenue = data.combinedTotalRevenue ?? (serviceEarnings + productRevenue);
  const combinedProfit = data.combinedTotalProfit ?? (serviceEarnings + productProfit);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Top Combined Business Summary Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Total Business Revenue</Text>
          <Text style={styles.summaryVal}>₹{combinedRevenue.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Total Net Profit</Text>
          <Text style={[styles.summaryVal, { color: '#16a34a' }]}>₹{combinedProfit.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Segmented Dual Tabs Switcher */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabButton, activeTab === 'services' && styles.tabButtonActive]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'services' && styles.tabButtonTextActive]}>
            ✂️ Services ({data.serviceTotalCompleted ?? data.totalCompleted ?? 0})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === 'products' && styles.tabButtonActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'products' && styles.tabButtonTextActive]}>
            🛍️ Products Selling ({data.productTotalUnitsSold ?? 0} sold)
          </Text>
        </Pressable>
      </View>

      {/* ================= TAB 1: SERVICES ================= */}
      {activeTab === 'services' && (
        <View>
          <View style={styles.grid}>
            <StatCard label="Today's Service Revenue" value={data.serviceTodayEarnings ?? data.todayEarnings} highlight />
            <StatCard label="This Week" value={data.serviceThisWeekEarnings ?? data.thisWeekEarnings} />
            <StatCard label="This Month" value={data.serviceThisMonthEarnings ?? data.thisMonthEarnings} />
            <StatCard label="All-Time Services Revenue" value={serviceEarnings} wide />
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{data.serviceTotalCompleted ?? data.totalCompleted ?? 0}</Text>
              <Text style={styles.counterLabel}>Completed Appointments</Text>
            </View>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{data.serviceTotalAccepted ?? data.totalAccepted ?? 0}</Text>
              <Text style={styles.counterLabel}>Accepted / In-Progress</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>✂️ Revenue by Service</Text>
          <View style={styles.sectionCard}>
            {(!data.byService || data.byService.length === 0) ? (
              <Text style={styles.empty}>No service earnings recorded yet.</Text>
            ) : (
              data.byService.map((row: ServiceEarningRow) => (
                <View key={row.serviceName} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{row.serviceName}</Text>
                    <Text style={styles.rowMeta}>{row.count} completed appointment{row.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.rowAmount}>₹{row.amount.toLocaleString('en-IN')}</Text>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>📅 Daily Appointments Breakdown</Text>
          <View style={styles.sectionCard}>
            {(!data.dailyBreakdown || data.dailyBreakdown.length === 0) ? (
              <Text style={styles.empty}>No daily appointment activity recorded yet.</Text>
            ) : (
              data.dailyBreakdown.map((row: DailyEarningRow) => (
                <View key={row.date} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{format(new Date(row.date), 'EEE, MMM d, yyyy')}</Text>
                    <Text style={styles.rowMeta}>{row.bookingsCount} booking{row.bookingsCount !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.rowAmount}>₹{row.amount.toLocaleString('en-IN')}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {/* ================= TAB 2: PRODUCTS SELLING ================= */}
      {activeTab === 'products' && (
        <View>
          {/* Main Financial KPI Grid */}
          <View style={styles.grid}>
            <View style={[styles.card, styles.cardProfit]}>
              <View style={styles.profitHeader}>
                <Text style={styles.cardProfitValue}>₹{productProfit.toLocaleString('en-IN')}</Text>
                <View style={styles.marginBadge}>
                  <Text style={styles.marginBadgeText}>{productMargin}% margin</Text>
                </View>
              </View>
              <Text style={styles.cardProfitLabel}>Net Product Profit</Text>
              <Text style={styles.cardProfitSub}>Revenue minus wholesale buying cost</Text>
            </View>

            <StatCard label="Total Sales Revenue" value={productRevenue} />
            <StatCard label="Total Cost of Goods (Wholesale)" value={productCost} />
            <StatCard label="Today's Product Sales" value={data.productTodayRevenue ?? 0} />
            <StatCard label="This Month Sales" value={data.productThisMonthRevenue ?? 0} />
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{data.productTotalUnitsSold ?? 0}</Text>
              <Text style={styles.counterLabel}>Total Units Sold</Text>
            </View>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{data.productTotalOrders ?? 0}</Text>
              <Text style={styles.counterLabel}>Total Customer Orders</Text>
            </View>
          </View>

          {/* Per-Product Financial Breakdown */}
          <Text style={styles.sectionTitle}>📦 Product-by-Product Profit Analysis</Text>
          <View style={styles.sectionCard}>
            {(!data.byProduct || data.byProduct.length === 0) ? (
              <Text style={styles.empty}>No products listed or sold yet.</Text>
            ) : (
              data.byProduct.map((p: ProductFinancialRow) => (
                <View key={p.productId} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.productName}</Text>
                      <View style={styles.tagRow}>
                        <Text style={styles.stockTag}>Stock: {p.currentStock} left</Text>
                        <Text style={styles.soldTag}>Sold: {p.unitsSold} units</Text>
                      </View>
                    </View>
                    <View style={styles.productProfitBox}>
                      <Text style={styles.productProfitVal}>+₹{p.netProfit.toLocaleString('en-IN')}</Text>
                      <Text style={styles.productMarginText}>{p.profitMarginPercentage}% margin</Text>
                    </View>
                  </View>

                  <View style={styles.priceBreakdownRow}>
                    <View style={styles.priceCol}>
                      <Text style={styles.priceColLabel}>Selling Price</Text>
                      <Text style={styles.priceColVal}>₹{p.sellingPrice}</Text>
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={styles.priceColLabel}>Buying Cost (🔒)</Text>
                      <Text style={styles.priceColVal}>{p.costPrice != null ? `₹${p.costPrice}` : 'N/A'}</Text>
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={styles.priceColLabel}>Total Revenue</Text>
                      <Text style={styles.priceColVal}>₹{p.totalRevenue.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={styles.priceColLabel}>Total Cost</Text>
                      <Text style={styles.priceColVal}>₹{p.totalCost.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Daily Product Sales Log */}
          <Text style={styles.sectionTitle}>📅 Daily Product Sales & Profit</Text>
          <View style={styles.sectionCard}>
            {(!data.productDailyBreakdown || data.productDailyBreakdown.length === 0) ? (
              <Text style={styles.empty}>No daily product sales recorded yet.</Text>
            ) : (
              data.productDailyBreakdown.map((row: DailyProductEarningRow) => (
                <View key={row.date} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{format(new Date(row.date), 'EEE, MMM d, yyyy')}</Text>
                    <Text style={styles.rowMeta}>{row.unitsSold} unit{row.unitsSold !== 1 ? 's' : ''} sold • Cost: ₹{row.cost.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.rowAmount}>₹{row.revenue.toLocaleString('en-IN')}</Text>
                    <Text style={styles.rowProfit}>+₹{row.profit.toLocaleString('en-IN')} profit</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, wide, highlight }: { label: string; value: number; wide?: boolean; highlight?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.cardWide, highlight && styles.cardHighlight]}>
      <Text style={styles.cardValue}>₹{value.toLocaleString('en-IN')}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  // Top Summary Banner
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryVal: { fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: colors.borderLight, marginHorizontal: 8 },

  // Segmented Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.primary,
  },

  // KPI Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardWide: { flexBasis: '100%' },
  cardHighlight: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
  },
  cardValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  cardLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '600' },

  // Profit Card
  cardProfit: {
    flexBasis: '100%',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  profitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardProfitValue: { fontSize: 26, fontWeight: '900', color: '#16a34a' },
  marginBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  marginBadgeText: { fontSize: 12, fontWeight: '800', color: '#15803d' },
  cardProfitLabel: { fontSize: 13, fontWeight: '700', color: '#166534', marginTop: 4 },
  cardProfitSub: { fontSize: 11, color: '#15803d', marginTop: 2 },

  // Counter Row
  counterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  counterBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  counterNum: { fontSize: 18, fontWeight: '800', color: colors.text },
  counterLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '600' },

  // Section Cards
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 10, marginBottom: 10 },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: { fontWeight: '700', color: colors.text, fontSize: 13 },
  rowMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  rowAmount: { fontWeight: '800', color: colors.text, fontSize: 14 },
  rowProfit: { fontWeight: '700', color: '#16a34a', fontSize: 11, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textMuted, paddingVertical: 14, fontSize: 13 },

  // Product Analysis Item
  productCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: { fontSize: 14, fontWeight: '800', color: colors.text },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  stockTag: { fontSize: 11, color: colors.textMuted, backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  soldTag: { fontSize: 11, color: colors.primaryDark, backgroundColor: colors.primaryTint, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  productProfitBox: { alignItems: 'flex-end' },
  productProfitVal: { fontSize: 15, fontWeight: '800', color: '#16a34a' },
  productMarginText: { fontSize: 11, fontWeight: '700', color: '#15803d' },

  priceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: borderRadius.sm,
    padding: 8,
    marginTop: 6,
  },
  priceCol: { alignItems: 'center' },
  priceColLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  priceColVal: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 2 },
});
