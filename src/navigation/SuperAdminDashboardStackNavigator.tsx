import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SuperAdminDashboardStackParamList } from '@/navigation/superAdminTypes';
import SuperAdminDashboardScreen from '@/screens/superadmin/SuperAdminDashboardScreen';
import ApprovalsScreen from '@/screens/superadmin/ApprovalsScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';

const SuperAdminDashboardScreenSafe = withSafeTop(SuperAdminDashboardScreen);

const Stack = createNativeStackNavigator<SuperAdminDashboardStackParamList>();

export function SuperAdminDashboardStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="SADashboard" component={SuperAdminDashboardScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Barber Approvals' }} />
    </Stack.Navigator>
  );
}
