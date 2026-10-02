import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, spacing, useMotion } from '@/theme';

import { AppText } from './app-text';
import { Button } from './button';
import { Gradient } from './gradient';
import { Icon, type IconName } from './icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Trạng thái trống hoặc lỗi: icon, tiêu đề, mô tả và nút hành động. */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { pick } = useMotion();

  return (
    <Animated.View entering={pick(FadeIn.duration(300))} style={styles.container}>
      <Gradient name="leaf" style={styles.iconCircle}>
        <Icon name={icon} size={36} color="primaryText" />
      </Gradient>
      <AppText variant="title" align="center">
        {title}
      </AppText>
      {message && (
        <AppText color="onSurfaceVariant" align="center">
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} compact style={styles.action} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  action: { marginTop: spacing.sm },
});
