import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import { EmptyState, Screen, ScreenHeader } from '@/components/ui';
import { FoodCard } from '@/features/foods/components/food-card';
import { foodRepository } from '@/features/foods/food-repository';
import { useUserData } from '@/features/profile/user-data-provider';
import { motion, spacing, useMotion } from '@/theme';

/** Màn Món yêu thích (/favorites): danh sách món đã thả tim. */
export default function FavoritesScreen() {
  const { favorites } = useUserData();
  const { pick } = useMotion();
  const foods = foodRepository.bySlugs([...favorites]);

  return (
    <Screen scroll header={<ScreenHeader title="Món yêu thích" />} contentStyle={styles.content}>
      {foods.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Chưa có món yêu thích"
          message="Nhấn trái tim ở món bạn thích để lưu lại và được gợi ý nhiều hơn."
          actionLabel="Khám phá món"
          onAction={() => router.navigate('/explore')}
        />
      ) : (
        <View style={styles.grid}>
          {foods.map((food) => (
            <Animated.View
              key={food.slug}
              exiting={pick(FadeOut.duration(motion.duration.fast))}
              layout={pick(LinearTransition.duration(motion.duration.normal))}
              style={styles.item}>
              <FoodCard food={food} square />
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm / 2, rowGap: spacing.md },
  item: { width: '50%', paddingHorizontal: spacing.sm / 2 },
});
