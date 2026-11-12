import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { NotificationsHubProvider } from '@/realtime/NotificationsHubProvider';
import { AppStripeProvider } from '@/payments/AppStripeProvider';
import { RootNavigator } from '@/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function WebFontLoader() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'barberhub-google-fonts';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap';
        document.head.appendChild(link);
      }

      const styleId = 'barberhub-global-fonts';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          * { -webkit-font-smoothing: antialiased; }
          body, input, button, textarea, select {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);
  return null;
}

function PushBootstrapper() {
  const { isAuthenticated } = useAuth();
  void isAuthenticated;
  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppStripeProvider>
              <NotificationsHubProvider>
                <WebFontLoader />
                <PushBootstrapper />
                <StatusBar style="dark" />
                <RootNavigator />
              </NotificationsHubProvider>
            </AppStripeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
