import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './app-text';
import { IconButton } from './icon-button';

interface ScreenHeaderProps {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
  /** Ẩn nút quay lại (màn gốc của tab). */
  hideBack?: boolean;
  backIcon?: 'arrow-back' | 'close';
}

/** Thanh tiêu đề màn hình với nút quay lại. */
export function ScreenHeader({ title, right, onBack, hideBack, backIcon = 'arrow-back' }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      {!hideBack && (
        <IconButton
          icon={backIcon}
          accessibilityLabel={backIcon === 'close' ? 'Đóng' : 'Quay lại'}
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        />
      )}
      <AppText variant="title" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  title: { flex: 1, paddingHorizontal: spacing.sm },
  right: { flexDirection: 'row', alignItems: 'center' },
});
