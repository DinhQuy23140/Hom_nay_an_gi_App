import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, sizes, spacing, useAppTheme, type ColorName } from '@/theme';

import { AppText } from './app-text';
import { Gradient } from './gradient';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const VARIANT_COLORS: Record<ButtonVariant, { bg: ColorName | null; fg: ColorName }> = {
  primary: { bg: null, fg: 'onPrimary' },
  secondary: { bg: 'surfaceVariant', fg: 'onSurface' },
  text: { bg: null, fg: 'primaryText' },
  danger: { bg: 'errorContainer', fg: 'onErrorContainer' },
};

/** Nút bấm: biến thể primary (gradient) / secondary / text / danger, hỗ trợ loading và icon. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  compact,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useAppTheme();
  const { bg, fg } = VARIANT_COLORS[variant];

  return (
    <PressableScale
      haptic
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: !!loading }}
      style={[
        styles.base,
        compact ? styles.compact : styles.regular,
        { backgroundColor: bg ? colors[bg] : 'transparent' },
        style,
      ]}>
      {variant === 'primary' && <Gradient name="brand" direction="horizontal" fill />}
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={20} color={fg} />}
          <AppText variant="label" color={fg} numberOfLines={1}>
            {label}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  regular: { minHeight: sizes.buttonHeight },
  compact: { minHeight: 40, paddingHorizontal: spacing.md },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
