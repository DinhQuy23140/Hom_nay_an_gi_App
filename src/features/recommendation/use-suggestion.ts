import { useState } from 'react';

import type { MealType } from '@/features/foods/types';
import { useLogInteraction } from '@/features/history/use-log-interaction';

import type { Recommendation } from './engine';
import { useRecommender } from './use-recommender';

interface SuggestionState {
  meal: MealType;
  recommendation: Recommendation | null;
}

/**
 * Món gợi ý ở Trang chủ. Giữ cố định cho tới khi người dùng chủ động đổi
 * (Món khác / đổi bữa), để dữ liệu realtime không làm món nhảy lung tung.
 */
export function useSuggestion() {
  const recommender = useRecommender();
  const log = useLogInteraction();
  const [state, setState] = useState<SuggestionState>(() => ({
    meal: recommender.activeMeal,
    recommendation: recommender.recommend(),
  }));

  const refresh = (meal: MealType = state.meal) => {
    if (state.recommendation && meal === state.meal) {
      log('SKIP', state.recommendation.food.slug, 'home');
    }
    setState({ meal, recommendation: recommender.recommend(meal) });
  };

  return { ...state, refresh, recommender };
}
