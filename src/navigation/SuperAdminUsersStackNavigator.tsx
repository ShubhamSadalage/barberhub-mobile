import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SuperAdminUsersStackParamList } from '@/navigation/superAdminTypes';
import ManageUsersScreen from '@/screens/superadmin/ManageUsersScreen';
import ManageBarbersScreen from '@/screens/superadmin/ManageBarbersScreen';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<SuperAdminUsersStackParamList>();

export function SuperAdminUsersStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ title: 'Customer Accounts' }} />
      <Stack.Screen name="ManageBarbers" component={ManageBarbersScreen} options={{ title: 'Barber Accounts' }} />
    </Stack.Navigator>
  );
}
