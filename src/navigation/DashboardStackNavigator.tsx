import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/barberTypes';
import DashboardScreen from '@/screens/barber/DashboardScreen';
import ServicesScreen from '@/screens/barber/ServicesScreen';
import ServiceFormScreen from '@/screens/barber/ServiceFormScreen';
import EarningsScreen from '@/screens/barber/EarningsScreen';
import LeaveDaysScreen from '@/screens/barber/LeaveDaysScreen';
import CustomersScreen from '@/screens/barber/CustomersScreen';
import CreateBookingOnBehalfScreen from '@/screens/barber/CreateBookingOnBehalfScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';

const DashboardScreenSafe = withSafeTop(DashboardScreen);

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Services' }} />
      <Stack.Screen name="ServiceForm" component={ServiceFormScreen} options={{ title: 'Service Details' }} />
      <Stack.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Shop Earnings' }} />
      <Stack.Screen name="LeaveDays" component={LeaveDaysScreen} options={{ title: 'Leave & Holidays' }} />
      <Stack.Screen name="Customers" component={CustomersScreen} options={{ title: 'My Customers' }} />
      <Stack.Screen name="CreateBookingOnBehalf" component={CreateBookingOnBehalfScreen} options={{ title: 'New Walk-in Booking' }} />
    </Stack.Navigator>
  );
}
