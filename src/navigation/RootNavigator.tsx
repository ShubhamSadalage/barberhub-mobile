import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { AuthStack } from '@/navigation/AuthStack';
import { CustomerTabs } from '@/navigation/CustomerTabs';
import { BarberTabs } from '@/navigation/BarberTabs';
import { SuperAdminTabs } from '@/navigation/SuperAdminTabs';
import PendingApprovalScreen from '@/screens/auth/PendingApprovalScreen';

export function RootNavigator() {
  const { isBootstrapping, isAuthenticated, user } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user!.role === 'Admin' && user!.approvalStatus !== 'Approved' ? (
        <PendingApprovalScreen />
      ) : user!.role === 'SuperAdmin' ? (
        <SuperAdminTabs />
      ) : user!.role === 'Admin' ? (
        <BarberTabs />
      ) : (
        <CustomerTabs />
      )}
    </NavigationContainer>
  );
}
