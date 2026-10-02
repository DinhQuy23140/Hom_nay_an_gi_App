import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion, radius, spacing, typography, useAppTheme } from '@/theme';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { IconButton } from './icon-button';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: IconName;
  ref?: Ref<TextInput>;
}

/** Ô nhập liệu: nhãn, icon, viền khi focus, báo lỗi, nút hiện/ẩn mật khẩu. */
export function TextField({ label, error, icon, secureTextEntry, onFocus, onBlur, ref, style, ...rest }: TextFieldProps) {
  const { colors } = useAppTheme();
  const [revealed, setRevealed] = useState(false);
  const hidden = !!secureTextEntry && !revealed;
  const focus = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : interpolateColor(focus.value, [0, 1], [colors.outline, colors.primary]),
  }));

  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="label" color="onSurfaceVariant">
          {label}
        </AppText>
      )}
      <Animated.View style={[styles.field, { backgroundColor: colors.surfaceVariant }, borderStyle]}>
        {icon && <Icon name={icon} size={20} />}
        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor={colors.onSurfaceVariant}
          selectionColor={colors.primary}
          onFocus={(e) => {
            focus.set(withTiming(1, { duration: motion.duration.fast }));
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.set(withTiming(0, { duration: motion.duration.fast }));
            onBlur?.(e);
          }}
          style={[styles.input, typography.body, { color: colors.onSurface }, style]}
          accessibilityLabel={rest.accessibilityLabel ?? label}
        />
        {secureTextEntry && (
          <IconButton
            icon={hidden ? 'eye-outline' : 'eye-off-outline'}
            accessibilityLabel={hidden ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'}
            size={36}
            iconColor="onSurfaceVariant"
            onPress={() => setRevealed((v) => !v)}
          />
        )}
      </Animated.View>
      {error && (
        <AppText variant="caption" color="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  input: { flex: 1, paddingVertical: spacing.sm },
});
