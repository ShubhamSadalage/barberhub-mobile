import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { HomeStackNavigator } from '@/navigation/HomeStackNavigator';
import { ShopStackNavigator } from '@/navigation/ShopStackNavigator';
import { ChatStackNavigator } from '@/navigation/ChatStackNavigator';
import MyBookingsScreen from '@/screens/customer/MyBookingsScreen';
import ProfileScreen from '@/screens/customer/ProfileScreen';
import { SlotTakenOfferModal } from '@/components/SlotTakenOfferModal';
import { onSlotTakenOffer } from '@/realtime/NotificationsHubProvider';
import type { SlotTakenOfferDto } from '@/types/api';
import type { BookingsStackParamList, ProfileStackParamList } from '@/navigation/customerTypes';
import { colors } from '@/theme/colors';

import { useFeatureFlags } from '@/hooks/useFeatureFlags';

import ChatConversationScreen from '@/screens/customer/ChatConversationScreen';

const Tab = createBottomTabNavigator();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function BookingsStackNavigator() {
  return (
    <BookingsStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <BookingsStack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
      <BookingsStack.Screen name="ChatConversation" component={ChatConversationScreen} options={{ title: 'Conversation' }} />
    </BookingsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

export function CustomerTabs({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const features = useFeatureFlags();
  const [globalSlotOffer, setGlobalSlotOffer] = useState<SlotTakenOfferDto | null>(null);

  useEffect(() => {
    const unsub = onSlotTakenOffer((offer) => {
      setGlobalSlotOffer(offer);
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    });
    return () => unsub();
  }, [queryClient]);

  return (
    <View style={{ flex: 1 }}>
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
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsStackNavigator}
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
          }}
        />
        {features.productsEnabled && (
          <Tab.Screen
            name="Shop"
            component={ShopStackNavigator}
            options={{
              title: 'Shop',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛍️</Text>,
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
          component={ProfileStackNavigator}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
          }}
        />
      </Tab.Navigator>

      <SlotTakenOfferModal
        offer={globalSlotOffer}
        onDismiss={() => setGlobalSlotOffer(null)}
        onShiftSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
          navigation?.navigate('Bookings');
        }}
      />
    </View>
  );
}
