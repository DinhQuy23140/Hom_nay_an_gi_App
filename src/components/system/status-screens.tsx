import { StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Screen } from '@/components/ui';
import { signOut } from '@/features/auth/services/auth.service';
import { radius, spacing, useAppTheme } from '@/theme';

const REQUIRED_ENV = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

/** Hiện khi chưa có file .env, thay vì để app crash khi khởi tạo Firebase. */
export function ConfigMissingScreen() {
  const { colors } = useAppTheme();
  return (
    <Screen scroll edges={['top', 'bottom']}>
      <EmptyState
        icon="construct-outline"
        title="Chưa cấu hình Firebase"
        message="Sao chép .env.example thành .env, điền thông tin Firebase và Supabase, rồi khởi động lại Metro (npx expo start -c)."
      />
      <View style={[styles.codeBox, { backgroundColor: colors.surfaceVariant }]}>
        {REQUIRED_ENV.map((name) => (
          <AppText key={name} variant="caption" color="onSurfaceVariant">
            {name}
          </AppText>
        ))}
      </View>
    </Screen>
  );
}

/** Màn lỗi khi không tải được hồ sơ người dùng, có nút đăng xuất. */
export function ProfileErrorScreen() {
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.center}>
      <EmptyState
        icon="cloud-offline-outline"
        title="Không tải được hồ sơ"
        message="Kiểm tra kết nối mạng và Firestore rules, rồi đăng nhập lại nhé."
      />
      <Button label="Đăng xuất" variant="secondary" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  codeBox: { borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
});
