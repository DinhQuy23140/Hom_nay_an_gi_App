import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, PressableScale } from '@/components/ui';
import { radius, spacing } from '@/theme';

import type { Food } from '../types';
import { FavoriteButton } from './favorite-button';
import { FoodMetaLine } from './food-meta';
import { FoodImage } from './food-image';

interface FoodCardProps {
  food: Food;
  width?: number;
  /** Ảnh vuông cho lưới 2 cột (đồ uống, tráng miệng). */
  square?: boolean;
}

/** Thẻ món dạng dọc: ảnh, tên và thông tin ngắn. */
export function FoodCard({ food, width, square = false }: FoodCardProps) {
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/food/[slug]', params: { slug: food.slug } })}
      accessibilityRole="button"
      accessibilityLabel={food.nameVi}
      style={[styles.card, width ? { width } : styles.flex]}>
      <View>
        <FoodImage food={food} style={[styles.image, { aspectRatio: square ? 1 : 4 / 3 }]} />
        <View style={styles.favorite}>
          <FavoriteButton slug={food.slug} overlay size={32} />
        </View>
      </View>
      <View style={styles.texts}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {food.nameVi}
        </AppText>
        <FoodMetaLine food={food} />
      </View>
    </PressableScale>
  );
}

/** Thẻ món dạng hàng ngang, có chỗ cho phần tử bên phải (ví dụ huy hiệu xếp hạng). */
export function FoodCardCompact({ food, trailing }: { food: Food; trailing?: ReactNode }) {
  return (
    <PressableScale
      pressedScale={0.98}
      onPress={() => router.push({ pathname: '/food/[slug]', params: { slug: food.slug } })}
      accessibilityRole="button"
      accessibilityLabel={food.nameVi}
      style={styles.compact}>
      <FoodImage food={food} iconSize={24} style={styles.compactImage} />
      <View style={styles.compactTexts}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {food.nameVi}
        </AppText>
        <FoodMetaLine food={food} />
      </View>
      {trailing}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: spacing.sm },
  image: { width: '100%', borderRadius: radius.sm },
  favorite: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  texts: { gap: 2 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  compactImage: { width: 64, height: 64, borderRadius: radius.sm },
  compactTexts: { flex: 1, gap: 2 },
});
