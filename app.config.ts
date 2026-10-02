import type { ConfigContext, ExpoConfig } from 'expo/config';

const GOOGLE_IOS_URL_SCHEME =
  process.env.GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.replace-with-ios-client-id';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Hôm nay ăn gì',
  slug: config.slug ?? 'hom-nay-an-gi',
  plugins: [
    ...(config.plugins ?? []),
    ['@react-native-google-signin/google-signin', { iosUrlScheme: GOOGLE_IOS_URL_SCHEME }],
  ],
});
