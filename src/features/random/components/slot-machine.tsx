import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText, Button, Gradient, Icon } from '@/components/ui';
import { DISH_TYPES } from '@/features/foods/data/taxonomy';
import type { Food } from '@/features/foods/types';
import { pickWeighted, type ScoredFood } from '@/features/recommendation/engine';
import { haptics } from '@/lib/haptics';
import { radius, spacing, useAppTheme, useMotion } from '@/theme';

const ITEM_HEIGHT = 76;
const VISIBLE_ROWS = 3;
const REEL_LENGTH = 24;
const SPIN_EASING = Easing.bezier(0.12, 0.8, 0.2, 1);

interface SlotMachineProps {
  pool: readonly ScoredFood[];
  onResult: (picked: ScoredFood) => void;
}

function buildReel(pool: readonly ScoredFood[], target: ScoredFood): Food[] {
  const filler = Array.from(
    { length: REEL_LENGTH - 1 },
    () => pool[Math.floor(Math.random() * pool.length)].food,
  );
  return [...filler, target.food];
}

/** Máy xèng chọn món: cuộn danh sách rồi dừng ở món được chọn. */
export function SlotMachine({ pool, onResult }: SlotMachineProps) {
  const { colors } = useAppTheme();
  const { reduced } = useMotion();
  const [reel, setReel] = useState<Food[]>(() => pool.slice(0, 3).map((s) => s.food));
  const [spinning, setSpinning] = useState(false);
  const offset = useSharedValue(-ITEM_HEIGHT);

  const finish = (picked: ScoredFood) => {
    setSpinning(false);
    haptics.success();
    onResult(picked);
  };

  const spin = () => {
    const picked = pickWeighted(pool);
    if (!picked || spinning) return;
    haptics.impact();
    const next = buildReel(pool, picked);
    const end = -(next.length - 1) * ITEM_HEIGHT;
    setReel(next);

    if (reduced) {
      offset.set(end);
      finish(picked);
      return;
    }
    setSpinning(true);
    offset.set(0);
    offset.set(
      withTiming(end, { duration: 2200, easing: SPIN_EASING }, (done) => {
        if (done) scheduleOnRN(finish, picked);
      }),
    );
  };

  const reelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value + ITEM_HEIGHT }],
  }));

  const fade = [colors.surface, `${colors.surface}00`] as const;

  return (
    <View style={styles.container}>
      <View style={[styles.window, { backgroundColor: colors.surface }]}>
        <View style={[styles.highlight, { borderColor: colors.primary }]}>
          <Gradient name="leaf" direction="horizontal" fill />
        </View>
        <Animated.View style={reelStyle}>
          {reel.map((food, index) => (
            <View key={`${food.slug}-${index}`} style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Icon name={DISH_TYPES[food.dishType].icon} size={22} color="primaryText" />
              </View>
              <AppText variant="title" numberOfLines={1} style={styles.rowText}>
                {food.nameVi}
              </AppText>
            </View>
          ))}
        </Animated.View>
        <LinearGradient pointerEvents="none" colors={fade} style={[styles.mask, styles.maskTop]} />
        <LinearGradient
          pointerEvents="none"
          colors={fade}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={[styles.mask, styles.maskBottom]}
        />
      </View>

      <Button
        label={spinning ? 'Đang quay…' : 'Quay!'}
        icon="dice-outline"
        disabled={spinning || pool.length === 0}
        onPress={spin}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl, alignItems: 'stretch' },
  window: {
    height: ITEM_HEIGHT * VISIBLE_ROWS,
    borderRadius: radius.hero,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  row: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  mask: { position: 'absolute', left: 0, right: 0, height: ITEM_HEIGHT },
  maskTop: { top: 0 },
  maskBottom: { bottom: 0 },
  button: { alignSelf: 'center', minWidth: 200 },
});
