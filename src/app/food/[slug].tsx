import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Chip, EmptyState, IconButton, Screen, SectionHeader } from '@/components/ui';
import { AllergenNotice } from '@/features/foods/components/allergen-notice';
import { FavoriteButton } from '@/features/foods/components/favorite-button';
import { FoodImage } from '@/features/foods/components/food-image';
import { SPICY_LABELS } from '@/features/profile/components/taste-editors';
import { FoodRow } from '@/features/foods/components/food-row';
import { CUISINES, DISH_TYPES, REGIONS } from '@/features/foods/data/taxonomy';
import { foodRepository, isDrink } from '@/features/foods/food-repository';
import type { Food } from '@/features/foods/types';
import { useLogInteraction } from '@/features/history/use-log-interaction';
import { FoodActions } from '@/features/places/components/food-actions';
import { shareFood } from '@/features/places/external-links';
import { useProfile } from '@/features/profile/user-data-provider';
import { radius, spacing, useAppTheme } from '@/theme';
import { formatPriceRange } from '@/utils/format';

const SWEET_LABELS = ['Không ngọt', 'Hơi ngọt', 'Ngọt vừa', 'Rất ngọt'] as const;

/** Màn Chi tiết món (/food/[slug]); hiện thông báo nếu không tìm thấy món. */
export default function FoodDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const food = foodRepository.bySlug(slug);

  if (!food) {
    return (
      <Screen edges={['top', 'bottom']}>
        <EmptyState icon="help-circle-outline" title="Không tìm thấy món" actionLabel="Quay lại" onAction={router.back} />
      </Screen>
    );
  }
  return <FoodDetail food={food} />;
}

/** Nội dung chi tiết món: ảnh hero parallax, thông tin, nguyên liệu, món kèm, nút Chốt món. */
function FoodDetail({ food }: { food: Food }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const log = useLogInteraction();
  const scrollY = useSharedValue(0);

  const logView = useEffectEvent(() => log('VIEW', food.slug, 'detail'));
  useEffect(() => {
    logView();
  }, [food.slug]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0, 300], [-100, 0, 120]) },
      { scale: interpolate(scrollY.value, [-200, 0], [1.4, 1], 'clamp') },
    ],
  }));

  const facts = [
    { label: 'Giá', value: formatPriceRange(food.priceMin, food.priceMax) },
    { label: 'Độ cay', value: SPICY_LABELS[food.spicyLevel] },
    { label: 'Độ ngọt', value: SWEET_LABELS[food.sweetLevel] },
    food.caloriesEst ? { label: 'Năng lượng', value: `~${food.caloriesEst} kcal` } : null,
    isDrink(food) && food.caffeineMg !== undefined ? { label: 'Caffeine', value: `~${food.caffeineMg} mg` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  const similar = foodRepository.similar(food);
  const pairings = foodRepository.pairings(food);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <Animated.View style={heroStyle}>
          <FoodImage food={food} iconSize={96} style={styles.hero} />
        </Animated.View>

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.titleBlock}>
            <AppText variant="display">{food.nameVi}</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {food.nameEn}
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags}>
              <Chip label={DISH_TYPES[food.dishType].label} icon={DISH_TYPES[food.dishType].icon} selected />
              <Chip label={CUISINES[food.cuisine]} tone="secondary" selected />
              <Chip label={REGIONS[food.region]} tone="secondary" selected />
            </ScrollView>
          </View>

          <AppText>{food.description}</AppText>

          <View style={[styles.facts, { backgroundColor: colors.surface }]}>
            {facts.map((fact) => (
              <View key={fact.label} style={styles.fact}>
                <AppText variant="caption" color="onSurfaceVariant">
                  {fact.label}
                </AppText>
                <AppText variant="bodyMedium" tabular>
                  {fact.value}
                </AppText>
              </View>
            ))}
          </View>

          <FoodActions food={food} onAction={() => log('SELECT', food.slug, 'detail')} />

          <AllergenNotice food={food} restrictions={profile.restrictions} />

          <View style={styles.block}>
            <SectionHeader title="Thành phần chính" />
            <View style={styles.wrap}>
              {food.ingredients.map((ingredient) => (
                <View key={ingredient} style={[styles.ingredient, { backgroundColor: colors.surfaceVariant }]}>
                  <AppText variant="bodySmall">{ingredient}</AppText>
                </View>
              ))}
            </View>
          </View>

          {pairings.length > 0 && (
            <View>
              <SectionHeader title="Ăn kèm" />
              <FoodRow foods={pairings} cardWidth={132} />
            </View>
          )}

          {similar.length > 0 && (
            <View>
              <SectionHeader title="Món tương tự" />
              <FoodRow foods={similar} />
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <View style={[styles.topBar, { top: insets.top + spacing.xs }]}>
        <IconButton icon="arrow-back" variant="overlay" accessibilityLabel="Quay lại" onPress={router.back} />
        <View style={styles.topBarRight}>
          <IconButton
            icon="share-social-outline"
            variant="overlay"
            accessibilityLabel="Chia sẻ"
            onPress={() => void shareFood(food)}
          />
          <FavoriteButton slug={food.slug} overlay size={48} />
        </View>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md), backgroundColor: colors.background },
        ]}>
        <Button
          label="Chốt món này"
          icon="checkmark"
          onPress={() =>
            router.push({
              pathname: '/result/[slug]',
              params: { slug: food.slug, surface: 'detail' },
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { width: '100%', aspectRatio: 4 / 3 },
  sheet: {
    marginTop: -radius.hero,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    padding: spacing.screen,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  titleBlock: { gap: spacing.xs },
  tags: { gap: spacing.sm, paddingTop: spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: radius.lg, padding: spacing.md, rowGap: spacing.md },
  fact: { width: '50%', gap: 2 },
  block: { gap: 0 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ingredient: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  topBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarRight: { flexDirection: 'row', gap: spacing.sm },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
});
