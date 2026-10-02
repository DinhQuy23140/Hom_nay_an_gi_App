import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, Avatar, PressableScale, Screen, SectionHeader } from '@/components/ui';
import { FoodRow } from '@/features/foods/components/food-row';
import { foodRepository } from '@/features/foods/food-repository';
import type { MealType } from '@/features/foods/types';
import { useProfile, useUserData } from '@/features/profile/user-data-provider';
import { MealChips } from '@/features/recommendation/components/meal-chips';
import { SuggestionHero } from '@/features/recommendation/components/suggestion-hero';
import { greetingForTime } from '@/features/recommendation/context';
import { useFiltersStore } from '@/features/recommendation/filters.store';
import { useSuggestion } from '@/features/recommendation/use-suggestion';
import { WeatherPill } from '@/features/weather/components/weather-pill';
import { motion, spacing, useMotion } from '@/theme';

/** Tab Trang chủ (/): lời chào, thời tiết, chọn bữa, thẻ gợi ý món và các hàng món gợi ý. */
export default function HomeScreen() {
  const profile = useProfile();
  const { favorites } = useUserData();
  const setMeal = useFiltersStore((s) => s.setMeal);
  const { meal, recommendation, refresh, recommender } = useSuggestion();

  const firstName = profile.displayName?.trim().split(/\s+/).pop();
  const favoriteFoods = foodRepository.bySlugs([...favorites]).slice(0, 10);
  const mealPicks = recommender
    .ranked(meal)
    .filter((s) => s.food.slug !== recommendation?.food.slug)
    .slice(0, 10)
    .map((s) => s.food);
  const drinks = recommender.ranked('DRINK').slice(0, 10).map((s) => s.food);
  const desserts = recommender.ranked('DESSERT').slice(0, 10).map((s) => s.food);

  const changeMeal = (next: MealType) => {
    setMeal(next);
    refresh(next);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Reveal index={0}>
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <AppText variant="headline">
              {greetingForTime(new Date())}
              {firstName ? `, ${firstName}` : ''}!
            </AppText>
            <AppText color="onSurfaceVariant">Hôm nay ăn gì nhỉ?</AppText>
          </View>
          <PressableScale
            onPress={() => router.navigate('/me')}
            accessibilityRole="button"
            accessibilityLabel="Trang cá nhân">
            <Avatar name={profile.displayName} uri={profile.photoURL} size={44} />
          </PressableScale>
        </View>
        <WeatherPill />
      </Reveal>

      <Reveal index={1}>
        <MealChips value={meal} onChange={changeMeal} />
      </Reveal>

      <Reveal index={2}>
        <SuggestionHero recommendation={recommendation} onNext={() => refresh()} />
      </Reveal>

      {favoriteFoods.length > 0 && (
        <Reveal index={3}>
          <SectionHeader title="Món bạn thích" actionLabel="Xem tất cả" onAction={() => router.push('/favorites')} />
          <FoodRow foods={favoriteFoods} />
        </Reveal>
      )}

      {mealPicks.length > 0 && (
        <Reveal index={4}>
          <SectionHeader title="Cũng hợp bữa này" />
          <FoodRow foods={mealPicks} />
        </Reveal>
      )}

      <Reveal index={5}>
        <SectionHeader title="Uống gì cho đã" actionLabel="Khám phá" onAction={() => router.navigate('/explore')} />
        <FoodRow foods={drinks} cardWidth={132} />
      </Reveal>

      <Reveal index={6}>
        <SectionHeader title="Tráng miệng ngọt ngào" />
        <FoodRow foods={desserts} cardWidth={132} />
      </Reveal>
    </Screen>
  );
}

/** Các khối nội dung lần lượt trượt nhẹ lên khi mở màn. */
function Reveal({ index, children }: PropsWithChildren<{ index: number }>) {
  const { pick } = useMotion();
  return (
    <Animated.View
      entering={pick(
        FadeInDown.duration(motion.duration.slow)
          .delay(Math.min(index, 4) * 50)
          .easing(motion.easing),
      )}
      style={styles.section}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.md },
  section: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerTexts: { flex: 1, gap: 2 },
});
