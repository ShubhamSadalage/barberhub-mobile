import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BarberProductsStackParamList } from '@/navigation/barberTypes';
import ProductsManageScreen from '@/screens/barber/ProductsManageScreen';
import ProductFormScreen from '@/screens/barber/ProductFormScreen';
import OrdersManageScreen from '@/screens/barber/OrdersManageScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';

const ProductsManageScreenSafe = withSafeTop(ProductsManageScreen);

const Stack = createNativeStackNavigator<BarberProductsStackParamList>();

export function BarberProductsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="ProductsManage" component={ProductsManageScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="OrdersManage" component={OrdersManageScreen} options={{ title: 'Product Orders' }} />
    </Stack.Navigator>
  );
}
