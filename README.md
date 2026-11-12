# Barber Hub — Mobile (React Native / Expo dev client)

## Why a dev client, not Expo Go
This app uses native modules that Expo Go doesn't support: `@react-native-firebase/messaging`
(FCM push), `@stripe/stripe-react-native` (Payment Sheet), and
`@react-native-google-signin/google-signin`. You need a custom dev client build.

## One-time setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Firebase (push notifications)**
   - Create a Firebase project, add an Android app with package name `com.barberhub.mobile`
     (must match `app.json` → `expo.android.package`).
   - Download `google-services.json` and place it at the project root (same folder as `app.json`).
   - In the .NET API, set `Firebase:ServiceAccountJson` (or `ServiceAccountJsonPath`) to the
     **service account** key from the same Firebase project (Project settings → Service accounts),
     and set `Features:PushEnabled = true`.

3. **Google Sign-In**
   - In Google Cloud Console (same project as Firebase, or linked), create an OAuth 2.0
     **Web application** client ID — this is what both the app and the API validate against.
   - Put it in `src/config/env.ts` → `GOOGLE_WEB_CLIENT_ID`, and in the API's
     `appsettings.json` → `Google:OAuth:ClientId` (same value both places).
   - Also create an **Android** OAuth client (uses your app's SHA-1 + package name) — Google
     Sign-In needs this to exist even though you don't paste its ID anywhere client-side.

4. **Stripe**
   - Put your publishable key in `src/config/env.ts` → `STRIPE_PUBLISHABLE_KEY`.
   - Put the matching secret key + webhook secret in the API's `appsettings.json` → `Stripe`.

5. **API base URL**
   - Set `expo.extra.apiBaseUrl` in `app.json` to your running API's base URL
     (e.g. `http://10.0.2.2:5000` for the Android emulator talking to a host machine API,
     or your deployed HTTPS URL).

6. **Build the dev client**
   ```
   npx expo prebuild
   npx expo run:android
   ```
   After the first native build, subsequent iteration is just `npm start` — no need to
   rebuild native code unless you add/change a native module.

## What's included in this module (App shell & infra)

- Navigation skeleton: `AuthStack` (login/register/OTP/Google/2FA) → role-based tabs
  (`CustomerTabs` / `BarberTabs` / `SuperAdminTabs`, currently placeholders — filled in
  Modules 2–4) → `PendingApprovalScreen` for barbers awaiting approval.
- `AuthContext` — session state, bootstraps from stored tokens on launch, exposes
  `setSession`/`logout`/`refreshMe`.
- Axios client with automatic 401 → refresh-token → retry, including request queueing so
  concurrent 401s only trigger one refresh call. Session-expired (refresh itself invalid)
  routes the app back to the login screen automatically.
- SecureStore-backed token storage.
- SignalR connection factory + a `NotificationsHubProvider` that keeps one live connection
  to `/hubs/notifications` while logged in, and a pub-sub (`onIncomingNotification`) any
  screen can subscribe to.
- FCM push registration (permission request, token registration with the API, token-refresh
  handling) + a foreground handler that surfaces a local notification banner (Android doesn't
  auto-show FCM notifications while the app is in the foreground).
- Stripe and Google Sign-In provider/helpers wired up, ready for Module 2's checkout and
  login screens to use.

All screens are functional (call the real API), styled simply and consistently — visual
polish can be layered on later without touching the logic.
