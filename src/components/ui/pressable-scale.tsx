import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { motion, useMotion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  /** Mức co khi nhấn, mặc định 0.97. */
  pressedScale?: number;
  haptic?: boolean;
}

/** Vùng bấm thu nhỏ nhẹ khi nhấn, có tùy chọn rung phản hồi. */
export function PressableScale({
  style,
  pressedScale = 0.97,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const { reduced } = useMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled, ...rest.accessibilityState }}
      onPressIn={(e) => {
        if (!reduced) scale.set(withTiming(pressedScale, { duration: motion.duration.fast }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: motion.duration.normal, easing: motion.easing }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) haptics.tap();
        onPress?.(e);
      }}
      style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
    />
  );
}
