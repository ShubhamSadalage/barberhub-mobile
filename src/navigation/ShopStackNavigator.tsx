import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/customerTypes';
import ProductsListScreen from '@/screens/customer/ProductsListScreen';
import ProductDetailsScreen from '@/screens/customer/ProductDetailsScreen';
import CartScreen from '@/screens/customer/CartScreen';
import CheckoutScreen from '@/screens/customer/CheckoutScreen';
import OrdersScreen from '@/screens/customer/OrdersScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';

const ProductsListScreenSafe = withSafeTop(ProductsListScreen);

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="ProductsList" component={ProductsListScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Shopping Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
    </Stack.Navigator>
  );
}
