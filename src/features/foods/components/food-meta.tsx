import { StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { formatPriceRange } from '@/utils/format';

import { DISH_TYPES } from '../data/taxonomy';
import type { Food, Level } from '../types';

/** 1–3 icon ớt đơn sắc, kèm nhãn chữ cho trình đọc màn hình. */
export function SpicyIndicator({ level }: { level: Level }) {
  if (level === 0) return null;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={['', 'Hơi cay', 'Cay vừa', 'Rất cay'][level]}>
      {Array.from({ length: level }, (_, i) => (
        <Icon key={i} name="flame-outline" size={14} />
      ))}
    </View>
  );
}

/** Một dòng phụ: "40–60k · Món nước". */
export function foodSubtitle(food: Food): string {
  return `${formatPriceRange(food.priceMin, food.priceMax)} · ${DISH_TYPES[food.dishType].label}`;
}

/** Dòng thông tin món: giá · kiểu món · độ cay. */
export function FoodMetaLine({ food }: { food: Food }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color="onSurfaceVariant" tabular numberOfLines={1}>
        {foodSubtitle(food)}
      </AppText>
      <SpicyIndicator level={food.spicyLevel} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
