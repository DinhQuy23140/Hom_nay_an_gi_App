import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './app-text';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Tiêu đề một khu vực nội dung, kèm nút hành động tùy chọn. */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button">
          <AppText variant="label" color="primaryText">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { flex: 1 },
});
