import { useDeferredValue, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { AppText, Chip, EmptyState, Gradient, Screen, SectionHeader, TextField } from '@/components/ui';
import { FoodCard, FoodCardCompact } from '@/features/foods/components/food-card';
import { FoodRow } from '@/features/foods/components/food-row';
import { DISH_TYPES } from '@/features/foods/data/taxonomy';
import { foodRepository } from '@/features/foods/food-repository';
import type { DishType, Food } from '@/features/foods/types';
import { radius, spacing, useAppTheme, useMotion } from '@/theme';

const DISH_FILTERS = Object.keys(DISH_TYPES) as DishType[];

/** Tab Khám phá (/explore): tìm kiếm món, lọc theo kiểu món, bảng xếp hạng. */
export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [dishType, setDishType] = useState<DishType | null>(null);
  const deferredQuery = useDeferredValue(query);
  const searching = deferredQuery.trim().length > 0;

  const results = searching ? foodRepository.search(deferredQuery) : [];
  const byType = dishType ? foodRepository.all().filter((f) => f.dishType === dishType) : [];

  return (
    <Screen scroll contentStyle={styles.content}>
      <AppText variant="headline">Khám phá</AppText>
      <TextField
        icon="search-outline"
        placeholder="Tìm món: pho, bun bo, tra sua…"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Tìm món"
      />

      {searching ? (
        <SearchResults foods={results} query={deferredQuery} />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chips}
            contentContainerStyle={styles.chipsContent}>
            <Chip label="Tất cả" selected={dishType === null} onPress={() => setDishType(null)} />
            {DISH_FILTERS.map((type) => (
              <Chip
                key={type}
                label={DISH_TYPES[type].label}
                icon={DISH_TYPES[type].icon}
                selected={dishType === type}
                onPress={() => setDishType(dishType === type ? null : type)}
              />
            ))}
          </ScrollView>

          {dishType ? <FoodGrid key={dishType} foods={byType} /> : <Discover />}
        </>
      )}
    </Screen>
  );
}

/** Danh sách kết quả tìm kiếm theo tên món (gõ không dấu cũng được). */
function SearchResults({ foods, query }: { foods: Food[]; query: string }) {
  const { pick } = useMotion();
  if (!foods.length) {
    return (
      <EmptyState
        icon="search-outline"
        title="Chưa có món này"
        message={`Không tìm thấy “${query.trim()}”. Thử gõ tên khác hoặc không dấu nhé.`}
      />
    );
  }
  return (
    <View>
      {foods.map((food) => (
        <Animated.View key={food.slug} entering={pick(FadeIn.duration(180))} layout={pick(LinearTransition)}>
          <FoodCardCompact food={food} />
        </Animated.View>
      ))}
    </View>
  );
}

/** Lưới món thuộc kiểu món đang chọn. */
function FoodGrid({ foods }: { foods: Food[] }) {
  const { pick } = useMotion();
  return (
    <Animated.View entering={pick(FadeIn.duration(220))} style={styles.grid}>
      {foods.map((food) => (
        <View key={food.slug} style={styles.gridItem}>
          <FoodCard food={food} square />
        </View>
      ))}
    </Animated.View>
  );
}

/** Nội dung mặc định khi chưa tìm/lọc: top món phổ biến, đồ uống, tráng miệng. */
function Discover() {
  const { colors } = useAppTheme();
  const top = foodRepository.popular(10);

  return (
    <>
      <View>
        <SectionHeader title="Được chọn nhiều nhất" />
        {top.map((food, index) => (
          <FoodCardCompact
            key={food.slug}
            food={food}
            trailing={
              <View style={[styles.rank, { backgroundColor: colors.surfaceVariant }]}>
                {index < 3 && <Gradient name="brand" fill />}
                <AppText variant="label" color={index < 3 ? 'onPrimary' : 'onSurfaceVariant'} tabular>
                  {index + 1}
                </AppText>
              </View>
            }
          />
        ))}
      </View>
      <View>
        <SectionHeader title="Đồ uống" />
        <FoodRow foods={foodRepository.drinks()} cardWidth={132} />
      </View>
      <View>
        <SectionHeader title="Tráng miệng" />
        <FoodRow foods={foodRepository.desserts()} cardWidth={132} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.md },
  chips: { marginHorizontal: -spacing.screen, flexGrow: 0 },
  chipsContent: { paddingHorizontal: spacing.screen, gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm / 2, rowGap: spacing.md },
  gridItem: { width: '50%', paddingHorizontal: spacing.sm / 2 },
  rank: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
