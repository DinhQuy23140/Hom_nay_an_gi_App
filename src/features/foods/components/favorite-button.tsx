import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { Icon, PressableScale } from '@/components/ui';
import { useFavorites } from '@/features/favorites/use-favorites';
import { motion, radius, useAppTheme, useMotion } from '@/theme';

interface FavoriteButtonProps {
  slug: string;
  size?: number;
  /** Nền trắng mờ khi đặt trên ảnh. */
  overlay?: boolean;
}

/** Nút tim bật/tắt món yêu thích, có hiệu ứng nảy. */
export function FavoriteButton({ slug, size = 36, overlay = false }: FavoriteButtonProps) {
  const { colors } = useAppTheme();
  const { reduced } = useMotion();
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <PressableScale
      pressedScale={0.88}
      onPress={() => {
        if (!reduced) {
          scale.set(
            withSequence(withTiming(1.25, { duration: motion.duration.fast }), withSpring(1, motion.spring)),
          );
        }
        toggle(slug);
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Bỏ yêu thích' : 'Yêu thích'}
      accessibilityState={{ selected: active }}
      style={[
        styles.button,
        { width: size, height: size, backgroundColor: overlay ? colors.surface : 'transparent' },
      ]}>
      <Animated.View style={animatedStyle}>
        <Icon
          name={active ? 'heart' : 'heart-outline'}
          size={Math.round(size * 0.55)}
          color={active ? 'error' : 'onSurfaceVariant'}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
