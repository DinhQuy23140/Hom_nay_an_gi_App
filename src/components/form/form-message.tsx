import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText, Icon } from '@/components/ui';
import { radius, spacing, useAppTheme, useMotion } from '@/theme';

interface FormMessageProps {
  message: string | null | undefined;
  tone?: 'error' | 'success';
}

/** Banner thông báo dưới form, xuất hiện/biến mất mờ dần. */
export function FormMessage({ message, tone = 'error' }: FormMessageProps) {
  const { colors } = useAppTheme();
  const { pick } = useMotion();
  if (!message) return null;

  const isError = tone === 'error';
  return (
    <Animated.View
      entering={pick(FadeIn.duration(200))}
      exiting={pick(FadeOut.duration(150))}
      accessibilityLiveRegion="polite"
      style={[
        styles.box,
        { backgroundColor: isError ? colors.errorContainer : colors.primaryContainer },
      ]}>
      <Icon
        name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={20}
        color={isError ? 'onErrorContainer' : 'primaryText'}
      />
      <AppText variant="bodySmall" color={isError ? 'onErrorContainer' : 'primaryText'} style={styles.text}>
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  text: { flex: 1 },
});
