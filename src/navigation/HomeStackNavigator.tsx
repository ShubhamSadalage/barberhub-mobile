import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/customerTypes';
import HomeScreen from '@/screens/customer/HomeScreen';
import BarbersListScreen from '@/screens/customer/BarbersListScreen';
import BarberDetailsScreen from '@/screens/customer/BarberDetailsScreen';
import BookingScreen from '@/screens/customer/BookingScreen';
import NotificationsScreen from '@/screens/customer/NotificationsScreen';
import ChatConversationScreen from '@/screens/customer/ChatConversationScreen';
import { colors } from '@/theme/colors';
import { withSafeTop } from '@/components/SafeTop';

const HomeScreenSafe = withSafeTop(HomeScreen);

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreenSafe} options={{ headerShown: false }} />
      <Stack.Screen name="BarbersList" component={BarbersListScreen} options={{ title: 'Find Barbers' }} />
      <Stack.Screen name="BarberDetails" component={BarberDetailsScreen} options={{ title: 'Barber Details' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} options={{ title: 'Conversation' }} />
    </Stack.Navigator>
  );
}
