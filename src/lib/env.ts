/**
 * Expo chỉ inline biến `EXPO_PUBLIC_*` khi được truy cập trực tiếp qua `process.env.NAME`,
 * nên mỗi biến phải được liệt kê tường minh.
 */
export const env = {
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    bucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || 'media',
  },
} as const;

export const isFirebaseConfigured = Boolean(
  env.firebase.apiKey && env.firebase.projectId && env.firebase.appId,
);

export const isSupabaseConfigured = Boolean(env.supabase.url && env.supabase.anonKey);

export const isGoogleSignInConfigured = Boolean(env.googleWebClientId);
