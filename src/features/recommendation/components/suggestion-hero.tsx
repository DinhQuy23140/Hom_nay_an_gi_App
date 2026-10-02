import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText, Button, EmptyState, Gradient, Icon, PressableScale } from '@/components/ui';
import { FavoriteButton } from '@/features/foods/components/favorite-button';
import { FoodImage } from '@/features/foods/components/food-image';
import { FoodMetaLine } from '@/features/foods/components/food-meta';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

import type { Recommendation } from '../engine';

interface SuggestionHeroProps {
  recommendation: Recommendation | null;
  onNext: () => void;
}

/** Thẻ gợi ý lớn ở Trang chủ; đổi món bằng hiệu ứng crossfade. */
export function SuggestionHero({ recommendation, onNext }: SuggestionHeroProps) {
  const { colors } = useAppTheme();
  const { pick } = useMotion();

  if (!recommendation) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <EmptyState
          icon="funnel-outline"
          title="Không còn món phù hợp"
          message="Bộ lọc đang hơi chặt. Nới bớt ngân sách hoặc kiểu món nhé."
          actionLabel="Mở bộ lọc"
          onAction={() => router.push('/filters')}
        />
      </View>
    );
  }

  const { food, reason } = recommendation;

  return (
    <View style={styles.card}>
      <Gradient name="hero" fill />
      <Animated.View
        key={food.slug}
        entering={pick(FadeIn.duration(motion.duration.normal))}
        exiting={pick(FadeOut.duration(motion.duration.fast))}>
        <PressableScale
          pressedScale={0.98}
          onPress={() => router.push({ pathname: '/food/[slug]', params: { slug: food.slug } })}
          accessibilityRole="button"
          accessibilityLabel={`Xem chi tiết ${food.nameVi}`}>
          <View>
            <FoodImage food={food} iconSize={64} style={styles.image} />
            <View style={styles.favorite}>
              <FavoriteButton slug={food.slug} overlay />
            </View>
          </View>
          <View style={styles.body}>
            <AppText variant="caption" color="primaryText">
              GỢI Ý CHO BẠN
            </AppText>
            <AppText variant="headline" numberOfLines={2}>
              {food.nameVi}
            </AppText>
            <FoodMetaLine food={food} />
            <View style={styles.reason}>
              <Icon name="sparkles-outline" size={16} color="primaryText" />
              <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.flex}>
                {reason}
              </AppText>
            </View>
          </View>
        </PressableScale>
      </Animated.View>

      <View style={styles.actions}>
        <Button label="Món khác" variant="secondary" icon="refresh" style={styles.flex} onPress={onNext} />
        <Button
          label="Chốt món"
          icon="checkmark"
          style={styles.flex}
          onPress={() =>
            router.push({ pathname: '/result/[slug]', params: { slug: food.slug, reason, surface: 'home' } })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radius.hero, padding: spacing.sm, gap: spacing.sm, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.xl },
  favorite: { position: 'absolute', top: spacing.md, right: spacing.md },
  body: { paddingHorizontal: spacing.sm, paddingTop: spacing.md, gap: spacing.xs },
  reason: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.xs },
});
