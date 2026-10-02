import { FlatList, StyleSheet } from 'react-native';

import { spacing } from '@/theme';

import type { Food } from '../types';
import { FoodCard } from './food-card';

interface FoodRowProps {
  foods: readonly Food[];
  cardWidth?: number;
}

/** Hàng thẻ món cuộn ngang, tràn sát mép màn hình. */
export function FoodRow({ foods, cardWidth = 156 }: FoodRowProps) {
  return (
    <FlatList
      horizontal
      data={foods}
      keyExtractor={(item) => item.slug}
      renderItem={({ item }) => <FoodCard food={item} width={cardWidth} />}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { marginHorizontal: -spacing.screen },
  content: { paddingHorizontal: spacing.screen, gap: spacing.md },
});
