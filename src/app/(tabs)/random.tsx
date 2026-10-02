import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText, Icon, IconButton, Screen, SegmentedControl, type SegmentOption } from '@/components/ui';
import { MEAL_TYPES } from '@/features/foods/data/taxonomy';
import { useLogInteraction } from '@/features/history/use-log-interaction';
import type { InteractionSurface } from '@/features/history/types';
import { SlotMachine } from '@/features/random/components/slot-machine';
import { SpinWheel } from '@/features/random/components/spin-wheel';
import { SwipeDeck } from '@/features/random/components/swipe-deck';
import { useShake } from '@/features/random/use-shake';
import { MealChips } from '@/features/recommendation/components/meal-chips';
import { explain, type ScoredFood } from '@/features/recommendation/engine';
import { countActiveFilters, useFiltersStore } from '@/features/recommendation/filters.store';
import { useRecommender } from '@/features/recommendation/use-recommender';
import { haptics } from '@/lib/haptics';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

type Mode = 'slot' | 'wheel' | 'swipe';

const MODES: SegmentOption<Mode>[] = [
  { value: 'slot', label: 'Máy xèng', icon: 'dice-outline' },
  { value: 'wheel', label: 'Vòng quay', icon: 'sync-outline' },
  { value: 'swipe', label: 'Vuốt thẻ', icon: 'layers-outline' },
];

const POOL_SIZE = 12;

/** Tab Random (/random): máy xèng, vòng quay, vuốt thẻ và lắc máy để chọn món. */
export default function RandomScreen() {
  const { colors } = useAppTheme();
  const { pick } = useMotion();
  const [mode, setMode] = useState<Mode>('slot');
  const recommender = useRecommender();
  const setMeal = useFiltersStore((s) => s.setMeal);
  const log = useLogInteraction();

  const ranked = recommender.ranked();
  const pool = ranked.slice(0, POOL_SIZE);
  const activeFilters = countActiveFilters(recommender.filters);
  const surface: InteractionSurface = mode === 'slot' ? 'random' : mode;

  const showResult = (food: ScoredFood['food'], reason: string, from: InteractionSurface) =>
    router.push({ pathname: '/result/[slug]', params: { slug: food.slug, reason, surface: from } });

  const onPicked = (picked: ScoredFood) => showResult(picked.food, explain(picked), surface);

  useShake(() => {
    const rec = recommender.recommend();
    if (!rec) return;
    haptics.success();
    showResult(rec.food, rec.reason, 'random');
  });

  // Đổi chế độ/bữa/bộ lọc thì dựng lại component để bộ thẻ được xáo theo pool mới.
  const poolKey = `${mode}:${recommender.activeMeal}:${JSON.stringify(recommender.filters)}`;

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="headline">Random món</AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant" tabular>
            {MEAL_TYPES[recommender.activeMeal].label} · {ranked.length} món phù hợp
          </AppText>
        </View>
        <View>
          <IconButton
            icon="options-outline"
            variant="tonal"
            accessibilityLabel={`Bộ lọc${activeFilters ? `, ${activeFilters} đang bật` : ''}`}
            onPress={() => router.push('/filters')}
          />
          {activeFilters > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" color="onPrimary" tabular>
                {activeFilters}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <MealChips value={recommender.activeMeal} onChange={setMeal} />
      <SegmentedControl options={MODES} value={mode} onChange={setMode} />

      <Animated.View key={poolKey} entering={pick(FadeIn.duration(motion.duration.normal))} style={styles.stage}>
        {pool.length === 0 ? (
          <View style={styles.center}>
            <Icon name="funnel-outline" size={40} color="onSurfaceVariant" />
            <AppText align="center" color="onSurfaceVariant">
              Không có món nào hợp bộ lọc. Thử nới bớt điều kiện nhé.
            </AppText>
          </View>
        ) : mode === 'slot' ? (
          <View style={styles.center}>
            <SlotMachine pool={pool} onResult={onPicked} />
          </View>
        ) : mode === 'wheel' ? (
          <View style={styles.center}>
            <SpinWheel pool={pool} onResult={onPicked} />
          </View>
        ) : (
          <SwipeDeck
            pool={pool}
            onChoose={onPicked}
            onSkip={(skipped) => log('SKIP', skipped.food.slug, 'swipe')}
          />
        )}
      </Animated.View>

      {mode !== 'swipe' && (
        <View style={[styles.hint, { backgroundColor: colors.surfaceVariant }]}>
          <Icon name="phone-portrait-outline" size={16} />
          <AppText variant="caption" color="onSurfaceVariant">
            Lắc điện thoại để chọn ngay
          </AppText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  stage: { flex: 1, marginTop: spacing.sm },
  center: { flex: 1, justifyContent: 'center', gap: spacing.md, alignItems: 'stretch' },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
