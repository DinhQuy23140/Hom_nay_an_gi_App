import { useShallow } from 'zustand/react/shallow';

import { foodRepository } from '@/features/foods/food-repository';
import type { MealType } from '@/features/foods/types';
import { useProfile, useUserData } from '@/features/profile/user-data-provider';
import { useWeather } from '@/features/weather/use-weather';

import { mealForTime } from './context';
import {
  rankFoods,
  recommend,
  type RecommendationContext,
  type RecommendationFilters,
} from './engine';
import { selectFilters, useFiltersStore } from './filters.store';

const NO_FILTERS: Omit<RecommendationFilters, 'meal' | 'excluded'> = {
  budgetMax: null,
  dishTypes: [],
  cuisines: [],
  spicyMax: null,
  adventure: 0.5,
};

/** Nối engine gợi ý với hồ sơ, lịch sử, yêu thích, thời tiết và bộ lọc hiện tại. */
export function useRecommender() {
  const profile = useProfile();
  const { history, favorites } = useUserData();
  const { weather } = useWeather();
  const filters = useFiltersStore(useShallow(selectFilters));

  const activeMeal = filters.meal ?? mealForTime(new Date());

  const buildContext = (meal: MealType): RecommendationContext => ({
    now: new Date(),
    meal,
    weather: weather?.kind ?? null,
    preferences: profile.preferences,
    restrictions: profile.restrictions,
    history,
    favorites,
  });

  const all = foodRepository.all();

  return {
    filters,
    activeMeal,
    weather,

    /** Món phù hợp với bộ lọc hiện tại, xếp theo điểm. */
    ranked: (meal: MealType = activeMeal) => rankFoods(all, { ...filters, meal }, buildContext(meal)),

    /** Random có trọng số theo bộ lọc hiện tại. */
    recommend: (meal: MealType = activeMeal) =>
      recommend(all, { ...filters, meal }, buildContext(meal)),

    /** "Đừng hỏi, cứ chọn": bỏ qua bộ lọc mềm, vẫn giữ bộ lọc cứng (dị ứng, chế độ ăn). */
    recommendInstant: () =>
      recommend(all, { ...NO_FILTERS, meal: activeMeal, excluded: filters.excluded }, buildContext(activeMeal)),
  };
}
