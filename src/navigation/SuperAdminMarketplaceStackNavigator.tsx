import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SuperAdminMarketplaceStackParamList } from '@/navigation/superAdminTypes';
import MarketplaceProductsScreen from '@/screens/superadmin/MarketplaceProductsScreen';
import MarketplaceProductFormScreen from '@/screens/superadmin/MarketplaceProductFormScreen';
import MarketplaceOrdersScreen from '@/screens/superadmin/MarketplaceOrdersScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';

const MarketplaceProductsScreenSafe = withSafeTop(MarketplaceProductsScreen);

const Stack = createNativeStackNavigator<SuperAdminMarketplaceStackParamList>();

export function SuperAdminMarketplaceStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="MarketplaceProducts" component={MarketplaceProductsScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="MarketplaceProductForm" component={MarketplaceProductFormScreen} options={{ title: 'Marketplace Product' }} />
      <Stack.Screen name="MarketplaceOrders" component={MarketplaceOrdersScreen} options={{ title: 'Platform Orders' }} />
    </Stack.Navigator>
  );
}
