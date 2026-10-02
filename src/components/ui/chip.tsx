import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion, radius, spacing, useAppTheme, type ColorName, type GradientName } from '@/theme';

import { AppText } from './app-text';
import { Gradient } from './gradient';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

type ChipTone = 'primary' | 'secondary' | 'error';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  tone?: ChipTone;
  disabled?: boolean;
}

const TONES: Record<ChipTone, { bg: ColorName; fg: ColorName; gradient: GradientName | null }> = {
  primary: { bg: 'primaryContainer', fg: 'primaryText', gradient: 'leaf' },
  secondary: { bg: 'secondaryContainer', fg: 'secondaryText', gradient: 'lagoon' },
  error: { bg: 'errorContainer', fg: 'onErrorContainer', gradient: null },
};

/** Chip chọn/bỏ chọn, dùng cho bộ lọc và quiz. */
export function Chip({ label, selected = false, onPress, icon, tone = 'primary', disabled }: ChipProps) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(selected ? 1 : 0);
  const { bg, fg, gradient } = TONES[tone];

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: motion.duration.normal });
  }, [progress, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surfaceVariant, colors[bg]]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.outline, colors[bg]]),
  }));

  const gradientStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const textColor: ColorName = selected ? fg : 'onSurface';

  return (
    <PressableScale
      haptic
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.chip, animatedStyle]}>
      {gradient && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, gradientStyle]}>
          <Gradient name={gradient} direction="horizontal" fill />
        </Animated.View>
      )}
      {icon && <Icon name={icon} size={16} color={selected ? fg : 'onSurfaceVariant'} />}
      <AppText variant="label" color={textColor}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
