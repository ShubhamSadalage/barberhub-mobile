import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SuperAdminDashboardStackNavigator } from '@/navigation/SuperAdminDashboardStackNavigator';
import { SuperAdminMarketplaceStackNavigator } from '@/navigation/SuperAdminMarketplaceStackNavigator';
import { SuperAdminUsersStackNavigator } from '@/navigation/SuperAdminUsersStackNavigator';
import AuditLogScreen from '@/screens/superadmin/AuditLogScreen';
import SuperAdminProfileScreen from '@/screens/superadmin/SuperAdminProfileScreen';
import type { SuperAdminAuditStackParamList, SuperAdminProfileStackParamList } from '@/navigation/superAdminTypes';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();
const AuditStack = createNativeStackNavigator<SuperAdminAuditStackParamList>();
const ProfileStack = createNativeStackNavigator<SuperAdminProfileStackParamList>();

function AuditStackNavigator() {
  return (
    <AuditStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <AuditStack.Screen name="AuditLog" component={AuditLogScreen} options={{ title: 'System Audit Logs' }} />
    </AuditStack.Navigator>
  );
}

function SuperAdminProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <ProfileStack.Screen name="SuperAdminProfile" component={SuperAdminProfileScreen} options={{ title: 'Super Admin' }} />
    </ProfileStack.Navigator>
  );
}

export function SuperAdminTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={SuperAdminDashboardStackNavigator}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚡</Text>,
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={SuperAdminMarketplaceStackNavigator}
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Users"
        component={SuperAdminUsersStackNavigator}
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Audit"
        component={AuditStackNavigator}
        options={{
          title: 'Audit Logs',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📜</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={SuperAdminProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛡️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
