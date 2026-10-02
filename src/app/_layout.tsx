import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  useFonts,
} from '@expo-google-fonts/be-vietnam-pro';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ConfigMissingScreen, ProfileErrorScreen } from '@/components/system/status-screens';
import { AuthProvider } from '@/features/auth/auth-provider';
import { useSessionStatus } from '@/features/auth/use-session-status';
import { UserDataProvider } from '@/features/profile/user-data-provider';
import { isFirebaseConfigured } from '@/lib/env';
import { queryClient } from '@/lib/query-client';
import { AppThemeProvider, radius, useAppTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/** Layout gốc của app: nạp font, bọc các provider (gesture, React Query, theme, auth, dữ liệu người dùng). */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          {isFirebaseConfigured ? (
            <AuthProvider>
              <UserDataProvider>
                <RootNavigator />
              </UserDataProvider>
            </AuthProvider>
          ) : (
            <SplashGate ready>
              <ConfigMissingScreen />
            </SplashGate>
          )}
        </AppThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/** Giữ màn splash cho tới khi `ready`, rồi mới hiện nội dung. */
function SplashGate({ ready, children }: { ready: boolean; children: React.ReactNode }) {
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);
  return ready ? children : null;
}

/** Stack điều hướng gốc: chặn route theo trạng thái phiên (chưa đăng nhập / chưa làm quiz / sẵn sàng). */
function RootNavigator() {
  const status = useSessionStatus();
  const { colors, isDark } = useAppTheme();

  return (
    <SplashGate ready={status !== 'loading'}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {status === 'error' ? (
        <ProfileErrorScreen />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Protected guard={status === 'signedOut'}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Protected guard={status === 'onboarding'}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>

          <Stack.Protected guard={status === 'ready'}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="food/[slug]" />
            <Stack.Screen name="result/[slug]" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="filters"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.92],
                sheetCornerRadius: radius.xl,
                sheetGrabberVisible: true,
                contentStyle: { backgroundColor: colors.surface },
              }}
            />
            <Stack.Screen name="post/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="favorites" />
            <Stack.Screen name="history" />
            <Stack.Screen name="taste-profile" />
            <Stack.Screen name="settings" />
          </Stack.Protected>
        </Stack>
      )}
    </SplashGate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
