import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { radius, sizes, useAppTheme, type ColorName } from '@/theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

type IconButtonVariant = 'plain' | 'tonal' | 'primary' | 'overlay';

interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconColor?: ColorName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Nút tròn chỉ có icon (đóng, quay lại, chia sẻ…). */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  size = sizes.touchTarget,
  iconColor,
  disabled,
  style,
}: IconButtonProps) {
  const { colors } = useAppTheme();

  const backgroundColor = {
    plain: 'transparent',
    tonal: colors.surfaceVariant,
    primary: colors.primary,
    overlay: colors.surface,
  }[variant];

  const defaultIconColor: ColorName = variant === 'primary' ? 'onPrimary' : 'onSurface';

  return (
    <PressableScale
      haptic
      pressedScale={0.9}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={size < sizes.touchTarget ? (sizes.touchTarget - size) / 2 : undefined}
      style={[styles.base, { width: size, height: size, backgroundColor }, style]}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={iconColor ?? defaultIconColor} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
