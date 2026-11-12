import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '@/navigation/customerTypes';
import ChatContactsScreen from '@/screens/customer/ChatContactsScreen';
import ChatConversationScreen from '@/screens/customer/ChatConversationScreen';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="ChatContacts" component={ChatContactsScreen} options={{ title: 'Messages' }} />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} options={{ title: 'Conversation' }} />
    </Stack.Navigator>
  );
}
