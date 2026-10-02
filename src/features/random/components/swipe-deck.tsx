import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText, EmptyState, IconButton } from '@/components/ui';
import { FoodImage } from '@/features/foods/components/food-image';
import { FoodMetaLine } from '@/features/foods/components/food-meta';
import { explain, type ScoredFood } from '@/features/recommendation/engine';
import { haptics } from '@/lib/haptics';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

import { weightedShuffle } from '../pool';

type Direction = 'left' | 'right';

interface SwipeDeckProps {
  pool: readonly ScoredFood[];
  onChoose: (picked: ScoredFood) => void;
  onSkip: (skipped: ScoredFood) => void;
}

/** Bộ thẻ vuốt chọn món: vuốt phải để chọn, vuốt trái để bỏ qua. */
export function SwipeDeck({ pool, onChoose, onSkip }: SwipeDeckProps) {
  const [deck, setDeck] = useState(() => weightedShuffle(pool));
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);

  const current = deck[index];
  const next = deck[index + 1];

  const handleSwiped = (direction: Direction) => {
    if (!current) return;
    progress.set(0);
    if (direction === 'right') {
      haptics.success();
      onChoose(current);
    } else {
      haptics.tap();
      onSkip(current);
    }
    setIndex((i) => i + 1);
  };

  if (!current) {
    return (
      <EmptyState
        icon="layers-outline"
        title="Hết thẻ rồi"
        message="Bạn đã lướt qua hết các món hợp bộ lọc. Xáo lại bộ thẻ nhé?"
        actionLabel="Xáo lại"
        onAction={() => {
          setDeck(weightedShuffle(pool));
          setIndex(0);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        {next && <SwipeCard key={next.food.slug} scored={next} isTop={false} progress={progress} />}
        <SwipeCard
          key={current.food.slug}
          scored={current}
          isTop
          progress={progress}
          onSwiped={handleSwiped}
        />
      </View>
      <View style={styles.actions}>
        <IconButton
          icon="close"
          variant="tonal"
          size={64}
          iconColor="error"
          accessibilityLabel="Bỏ qua món này"
          onPress={() => handleSwiped('left')}
        />
        <IconButton
          icon="checkmark"
          variant="primary"
          size={64}
          accessibilityLabel="Chốt món này"
          onPress={() => handleSwiped('right')}
        />
      </View>
    </View>
  );
}

interface SwipeCardProps {
  scored: ScoredFood;
  isTop: boolean;
  progress: SharedValue<number>;
  onSwiped?: (direction: Direction) => void;
}

/** Một thẻ món trong bộ thẻ vuốt. */
function SwipeCard({ scored, isTop, progress, onSwiped }: SwipeCardProps) {
  const { colors } = useAppTheme();
  const { pick } = useMotion();
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const threshold = width * 0.28;

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.set(e.translationX);
      translateY.set(e.translationY * 0.3);
      progress.set(Math.min(Math.abs(e.translationX) / threshold, 1));
    })
    .onEnd((e) => {
      const x = translateX.get();
      const shouldSwipe = Math.abs(x) > threshold || Math.abs(e.velocityX) > 900;
      if (!shouldSwipe) {
        translateX.set(withSpring(0, motion.spring));
        translateY.set(withSpring(0, motion.spring));
        progress.set(withTiming(0));
        return;
      }
      const direction: Direction = x > 0 ? 'right' : 'left';
      translateX.set(
        withTiming(Math.sign(x) * width * 1.4, { duration: motion.duration.normal }, (done) => {
          if (done && onSwiped) scheduleOnRN(onSwiped, direction);
        }),
      );
    });

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const scale = interpolate(progress.value, [0, 1], [0.94, 1], Extrapolation.CLAMP);
      return { transform: [{ scale }, { translateY: (1 - progress.value) * 14 }] };
    }
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${interpolate(translateX.value, [-width, width], [-14, 14])}deg` },
      ],
    };
  });

  const chooseStamp = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, threshold], [0, 1], Extrapolation.CLAMP),
  }));
  const skipStamp = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={isTop ? undefined : pick(FadeIn.duration(motion.duration.normal))}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }, cardStyle]}>
        <FoodImage food={scored.food} iconSize={72} style={styles.image} />
        <View style={styles.body}>
          <AppText variant="headline" numberOfLines={1}>
            {scored.food.nameVi}
          </AppText>
          <FoodMetaLine food={scored.food} />
          <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={2}>
            {explain(scored)}
          </AppText>
        </View>

        <Animated.View
          style={[styles.stamp, styles.stampRight, { borderColor: colors.primary }, chooseStamp]}>
          <AppText variant="title" color="primaryText">
            CHỐT
          </AppText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampLeft, { borderColor: colors.error }, skipStamp]}>
          <AppText variant="title" color="error">
            BỎ QUA
          </AppText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.lg },
  stack: { flex: 1 },
  card: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.hero,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  image: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.xs },
  stamp: {
    position: 'absolute',
    top: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 3,
    borderRadius: radius.sm,
  },
  stampRight: { left: spacing.lg, transform: [{ rotate: '-12deg' }] },
  stampLeft: { right: spacing.lg, transform: [{ rotate: '12deg' }] },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl },
});
