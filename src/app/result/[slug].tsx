import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppText, Button, EmptyState, Icon, IconButton, Screen, SectionHeader } from '@/components/ui';
import { FavoriteButton } from '@/features/foods/components/favorite-button';
import { FoodMetaLine } from '@/features/foods/components/food-meta';
import { FoodImage } from '@/features/foods/components/food-image';
import { FoodRow } from '@/features/foods/components/food-row';
import { foodRepository } from '@/features/foods/food-repository';
import type { InteractionSurface } from '@/features/history/types';
import { useLogInteraction } from '@/features/history/use-log-interaction';
import { FoodActions } from '@/features/places/components/food-actions';
import { shareFood } from '@/features/places/external-links';
import { useFiltersStore } from '@/features/recommendation/filters.store';
import { motion, radius, spacing, useMotion } from '@/theme';

const SURFACES: InteractionSurface[] = ['home', 'random', 'wheel', 'swipe', 'detail', 'search'];

/** Màn Kết quả random "Hôm nay ăn…" (/result/[slug]): lý do gợi ý và các hành động Ra quán / Tự nấu / Đặt giao. */
export default function ResultScreen() {
  const params = useLocalSearchParams<{ slug: string; reason?: string; surface?: string }>();
  const food = foodRepository.bySlug(params.slug);
  const surface = SURFACES.find((s) => s === params.surface) ?? 'random';
  const log = useLogInteraction();
  const excludeToday = useFiltersStore((s) => s.excludeToday);
  const { pick } = useMotion();
  const selectedRef = useRef(false);

  if (!food) {
    return (
      <Screen edges={['top', 'bottom']}>
        <EmptyState icon="help-circle-outline" title="Không tìm thấy món" actionLabel="Quay lại" onAction={router.back} />
      </Screen>
    );
  }

  const markSelected = () => {
    if (selectedRef.current) return;
    selectedRef.current = true;
    log('SELECT', food.slug, surface);
  };

  const dislike = () => {
    log('DISLIKE', food.slug, surface);
    excludeToday(food.slug);
    router.back();
  };

  const extras = [...foodRepository.pairings(food), ...foodRepository.drinks().filter((d) => d.popularity >= 80)]
    .filter((f, i, all) => f.slug !== food.slug && all.findIndex((x) => x.slug === f.slug) === i)
    .slice(0, 8);

  const enter = (delay: number) => pick(FadeInDown.duration(motion.duration.slow).delay(delay).easing(motion.easing));

  return (
    <Screen
      scroll
      edges={['top']}
      contentStyle={styles.content}
      header={
        <View style={styles.header}>
          <IconButton icon="close" accessibilityLabel="Đóng" onPress={router.back} />
          <View style={styles.flex} />
          <IconButton icon="share-social-outline" accessibilityLabel="Chia sẻ" onPress={() => void shareFood(food)} />
          <FavoriteButton slug={food.slug} size={48} />
        </View>
      }
      footer={
        <View style={styles.footerRow}>
          <Button label="Không thích" variant="secondary" icon="thumbs-down-outline" style={styles.flex} onPress={dislike} />
          <Button label="Random lại" icon="shuffle" style={styles.flex} onPress={router.back} />
        </View>
      }>
      <Animated.View entering={enter(0)} style={styles.titleBlock}>
        <View style={styles.badge}>
          <Icon name="sparkles" size={16} color="primaryText" />
          <AppText variant="label" color="primaryText">
            Hôm nay ăn
          </AppText>
        </View>
      </Animated.View>

      <Animated.View entering={pick(ZoomIn.springify().damping(14).stiffness(140))}>
        <FoodImage food={food} iconSize={80} style={styles.image} />
      </Animated.View>

      <Animated.View entering={enter(120)} style={styles.titleBlock}>
        <AppText variant="display" align="center">
          {food.nameVi}
        </AppText>
        <FoodMetaLine food={food} />
        {params.reason && (
          <AppText color="onSurfaceVariant" align="center">
            {params.reason}
          </AppText>
        )}
      </Animated.View>

      <Animated.View entering={enter(200)}>
        <FoodActions food={food} onAction={markSelected} />
      </Animated.View>

      <Animated.View entering={enter(260)}>
        <Button
          label="Xem chi tiết món"
          variant="text"
          onPress={() => router.push({ pathname: '/food/[slug]', params: { slug: food.slug } })}
        />
      </Animated.View>

      {extras.length > 0 && (
        <Animated.View entering={enter(320)}>
          <SectionHeader title="Ăn kèm cho trọn vị" />
          <FoodRow foods={extras} cardWidth={132} />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, minHeight: 56 },
  content: { gap: spacing.lg },
  titleBlock: { alignItems: 'center', gap: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.hero },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
