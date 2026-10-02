import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Chip, SegmentedControl, type SegmentOption } from '@/components/ui';
import { CUISINES, DISH_TYPES } from '@/features/foods/data/taxonomy';
import type { Cuisine, DishType, Level } from '@/features/foods/types';
import { BudgetPicker, ChipWrap, EditorSection, SPICY_LABELS } from '@/features/profile/components/taste-editors';
import { countActiveFilters, useFiltersStore } from '@/features/recommendation/filters.store';
import { useRecommender } from '@/features/recommendation/use-recommender';
import { spacing } from '@/theme';

type Adventure = 'safe' | 'balanced' | 'bold';

const ADVENTURE: SegmentOption<Adventure>[] = [
  { value: 'safe', label: 'Quen thuộc' },
  { value: 'balanced', label: 'Cân bằng' },
  { value: 'bold', label: 'Mới lạ' },
];
const ADVENTURE_VALUE: Record<Adventure, number> = { safe: 0.2, balanced: 0.5, bold: 0.8 };

function toAdventure(value: number): Adventure {
  if (value < 0.35) return 'safe';
  if (value > 0.65) return 'bold';
  return 'balanced';
}

const SPICY_MAX: (Level | null)[] = [null, 0, 1, 2, 3];

/** Bottom sheet Bộ lọc (/filters): ngân sách, kiểu món, ẩm thực, độ cay, độ phiêu lưu. */
export default function FiltersSheet() {
  const insets = useSafeAreaInsets();
  const recommender = useRecommender();
  const store = useFiltersStore();
  const matches = recommender.ranked().length;
  const active = countActiveFilters(recommender.filters);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="headline" style={styles.flex}>
          Bộ lọc
        </AppText>
        {active > 0 && <Button label="Đặt lại" variant="text" compact onPress={store.reset} />}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EditorSection title="Ngân sách mỗi người">
          <BudgetPicker value={store.budgetMax} onChange={store.setBudgetMax} />
        </EditorSection>

        <EditorSection title="Kiểu món">
          <ChipWrap>
            {(Object.keys(DISH_TYPES) as DishType[]).map((type) => (
              <Chip
                key={type}
                label={DISH_TYPES[type].label}
                icon={DISH_TYPES[type].icon}
                selected={store.dishTypes.includes(type)}
                onPress={() => store.toggleDishType(type)}
              />
            ))}
          </ChipWrap>
        </EditorSection>

        <EditorSection title="Ẩm thực">
          <ChipWrap>
            {(Object.keys(CUISINES) as Cuisine[]).map((cuisine) => (
              <Chip
                key={cuisine}
                label={CUISINES[cuisine]}
                tone="secondary"
                selected={store.cuisines.includes(cuisine)}
                onPress={() => store.toggleCuisine(cuisine)}
              />
            ))}
          </ChipWrap>
        </EditorSection>

        <EditorSection title="Cay tối đa">
          <ChipWrap>
            {SPICY_MAX.map((level) => (
              <Chip
                key={level ?? 'any'}
                label={level === null ? 'Sao cũng được' : SPICY_LABELS[level]}
                icon={level === null ? undefined : level === 0 ? 'leaf-outline' : 'flame-outline'}
                selected={store.spicyMax === level}
                onPress={() => store.setSpicyMax(level)}
              />
            ))}
          </ChipWrap>
        </EditorSection>

        <EditorSection title="Độ mạo hiểm" hint="Mới lạ sẽ ưu tiên món bạn chưa thử gần đây.">
          <SegmentedControl
            options={ADVENTURE}
            value={toAdventure(store.adventure)}
            onChange={(v) => store.setAdventure(ADVENTURE_VALUE[v])}
          />
        </EditorSection>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label={matches > 0 ? `Xem ${matches} món phù hợp` : 'Không có món phù hợp'}
          disabled={matches === 0}
          onPress={router.back}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  content: { paddingHorizontal: spacing.screen, paddingBottom: spacing.lg, gap: spacing.lg },
  footer: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
});
