// Push notifications require a real Firebase project (google-services.json) to be configured.
// Both functions are no-ops until that's wired in — see @react-native-firebase/messaging for the
// original implementation.

export async function registerForPushNotificationsAsync(): Promise<void> {}

export async function unregisterPushToken(): Promise<void> {}
