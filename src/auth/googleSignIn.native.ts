import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@/config/env';

let configured = false;

function ensureConfigured() {
  if (configured || Platform.OS === 'web') return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

/** Runs the native Google Sign-In flow and returns the ID token to send to POST /api/auth/google. */
export async function signInWithGoogle(): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Google Sign-In is only supported on native mobile devices.');
  }
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) throw new Error('Google Sign-In did not return an ID token.');
  return idToken;
}

export async function signOutGoogle(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — user may not have signed in with Google
  }
}
