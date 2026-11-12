import Constants from 'expo-constants';

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? 'http://localhost:51850';

// Derived from API_BASE_URL — SignalR hub endpoints live on the same host as the API.
export const HUB_URLS = {
  notifications: `${API_BASE_URL}/hubs/notifications`,
  chat: `${API_BASE_URL}/hubs/chat`,
};

export const GOOGLE_WEB_CLIENT_ID = '979920316990-to1agici7gldloip2d3f6jr14samn4go.apps.googleusercontent.com';
export const STRIPE_PUBLISHABLE_KEY = 'REPLACE-WITH-YOUR-STRIPE-PUBLISHABLE-KEY';
