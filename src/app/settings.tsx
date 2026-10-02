import Constants from 'expo-constants';
import { Alert, StyleSheet, View } from 'react-native';

import {
  AppText,
  ListGroup,
  ListRow,
  Screen,
  ScreenHeader,
  SegmentedControl,
  SwitchRow,
  type SegmentOption,
} from '@/components/ui';
import { signOut } from '@/features/auth/services/auth.service';
import { useSettingsStore, type ThemeMode } from '@/features/settings/settings.store';
import { spacing } from '@/theme';

const THEME_OPTIONS: SegmentOption<ThemeMode>[] = [
  { value: 'system', label: 'Hệ thống', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Sáng', icon: 'sunny-outline' },
  { value: 'dark', label: 'Tối', icon: 'moon-outline' },
];

/** Màn Cài đặt (/settings): giao diện, giảm chuyển động, rung phản hồi, đăng xuất. */
export default function SettingsScreen() {
  const settings = useSettingsStore();

  const confirmSignOut = () =>
    Alert.alert('Đăng xuất?', 'Bạn có thể đăng nhập lại bất cứ lúc nào.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => void signOut() },
    ]);

  return (
    <Screen scroll header={<ScreenHeader title="Cài đặt" />} contentStyle={styles.content}>
      <View style={styles.section}>
        <AppText variant="label" color="onSurfaceVariant">
          Giao diện
        </AppText>
        <SegmentedControl options={THEME_OPTIONS} value={settings.themeMode} onChange={settings.setThemeMode} />
      </View>

      <ListGroup>
        <SwitchRow
          icon="sparkles-outline"
          title="Giảm chuyển động"
          subtitle="Tắt hiệu ứng trượt, quay và phóng to"
          value={settings.reduceMotion}
          onValueChange={settings.setReduceMotion}
        />
        <SwitchRow
          icon="pulse-outline"
          title="Rung phản hồi"
          value={settings.haptics}
          onValueChange={settings.setHaptics}
        />
      </ListGroup>

      <ListGroup>
        <ListRow icon="log-out-outline" title="Đăng xuất" destructive onPress={confirmSignOut} right={null} />
      </ListGroup>

      <AppText variant="caption" color="onSurfaceVariant" align="center">
        Hôm nay ăn gì · phiên bản {Constants.expoConfig?.version ?? '1.0.0'}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.sm },
  section: { gap: spacing.sm },
});
