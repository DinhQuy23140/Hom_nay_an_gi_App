import { Stack } from 'expo-router';

import { useAppTheme } from '@/theme';

/** Layout nhóm màn xác thực: Stack cho Chào mừng, Đăng nhập, Đăng ký, Quên mật khẩu. */
export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
