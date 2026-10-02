import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui';
import { MEAL_TYPES } from '@/features/foods/data/taxonomy';
import type { MealType } from '@/features/foods/types';
import { spacing } from '@/theme';

const MEALS: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'LATE_NIGHT'];

interface MealChipsProps {
  value: MealType;
  onChange: (meal: MealType) => void;
}

/** Hàng chip chọn bữa ăn (Sáng, Trưa, Tối, Ăn vặt…). */
export function MealChips({ value, onChange }: MealChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.content}>
      {MEALS.map((meal) => (
        <Chip
          key={meal}
          label={MEAL_TYPES[meal].label}
          icon={MEAL_TYPES[meal].icon}
          selected={meal === value}
          onPress={() => onChange(meal)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { marginHorizontal: -spacing.screen, flexGrow: 0 },
  content: { paddingHorizontal: spacing.screen, gap: spacing.sm },
});
