import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Gradient, Icon } from '@/components/ui';
import { getPublicStorageUrl } from '@/lib/supabase';
import type { ColorName, GradientName } from '@/theme';

import { DISH_TYPES } from '../data/taxonomy';
import { isDessert, isDrink } from '../food-repository';
import type { Food } from '../types';

interface FoodImageProps {
  food: Food;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}

function placeholderTone(food: Food): { bg: GradientName; fg: ColorName } {
  if (isDrink(food)) return { bg: 'lagoon', fg: 'secondaryText' };
  if (isDessert(food)) return { bg: 'lavender', fg: 'dessert' };
  return { bg: 'leaf', fg: 'primaryText' };
}

/**
 * Ảnh món từ Supabase Storage (`foods/<slug>-640.webp`).
 * Khi chưa có ảnh hoặc lỗi tải, hiện nền tonal kèm icon loại món.
 */
export function FoodImage({ food, style, iconSize = 40 }: FoodImageProps) {
  const uri = getPublicStorageUrl(`foods/${food.slug}-640.webp`);
  const [failed, setFailed] = useState(!uri);
  const tone = placeholderTone(food);

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Ảnh ${food.nameVi}`}>
      <Gradient name={tone.bg} style={styles.placeholder}>
        <Icon name={DISH_TYPES[food.dishType].icon} size={iconSize} color={tone.fg} />
      </Gradient>
      {!failed && uri && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          recyclingKey={food.slug}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  placeholder: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
