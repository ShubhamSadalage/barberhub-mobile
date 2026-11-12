import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackNavigator } from '@/navigation/DashboardStackNavigator';
import { BarberProductsStackNavigator } from '@/navigation/BarberProductsStackNavigator';
import { ChatStackNavigator } from '@/navigation/ChatStackNavigator';
import BookingsManageScreen from '@/screens/barber/BookingsManageScreen';
import BarberProfileScreen from '@/screens/barber/BarberProfileScreen';
import type { BarberBookingsStackParamList, BarberProfileStackParamList } from '@/navigation/barberTypes';
import { colors } from '@/theme/colors';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const Tab = createBottomTabNavigator();
const BookingsStack = createNativeStackNavigator<BarberBookingsStackParamList>();
const ProfileStack = createNativeStackNavigator<BarberProfileStackParamList>();

function BarberBookingsStackNavigator() {
  return (
    <BookingsStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <BookingsStack.Screen name="BookingsManage" component={BookingsManageScreen} options={{ title: 'Manage Bookings' }} />
    </BookingsStack.Navigator>
  );
}

function BarberProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <ProfileStack.Screen name="BarberProfile" component={BarberProfileScreen} options={{ title: 'Barber Profile' }} />
    </ProfileStack.Navigator>
  );
}

export function BarberTabs() {
  const insets = useSafeAreaInsets();
  const features = useFeatureFlags();

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
        component={DashboardStackNavigator}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BarberBookingsStackNavigator}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✂️</Text>,
        }}
      />
      {features.productsEnabled && (
        <Tab.Screen
          name="Products"
          component={BarberProductsStackNavigator}
          options={{
            title: 'Products',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📦</Text>,
          }}
        />
      )}
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={BarberProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💈</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
