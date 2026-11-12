import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/customerTypes';
import { FormInput } from '@/components/FormInput';
import { BarberCard } from '@/components/BarberCard';
import { barbersApi } from '@/api/endpoints/barbers';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'BarbersList'>;

export default function BarbersListScreen({ navigation }: Props) {
  const [city, setCity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['barbers-search', city],
    queryFn: () => barbersApi.search({ city: city || undefined }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchCard}>
        <FormInput
          label="Filter by City or Area"
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Pune, Mumbai, Delhi..."
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BarberCard barber={item} onPress={() => navigation.navigate('BarberDetails', { barberId: item.id })} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>💈</Text>
              <Text style={styles.empty}>No barbers found for "{city}".</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  list: {
    paddingBottom: 24,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
  },
});
