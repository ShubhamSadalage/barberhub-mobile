/** Web fallback for Google Sign-In */
export async function signInWithGoogle(): Promise<string> {
  throw new Error('Google Sign-In is currently supported on native mobile devices. Please use Email/OTP login on web.');
}

export async function signOutGoogle(): Promise<void> {
  // No-op on web
}
