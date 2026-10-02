import { create } from 'zustand';

import type { Cuisine, DishType, Level, MealType } from '@/features/foods/types';

import type { RecommendationFilters } from './engine';

export const BUDGET_PRESETS = [
  { id: 'student', label: 'Sinh viên', max: 40_000 },
  { id: 'casual', label: 'Bình dân', max: 70_000 },
  { id: 'comfy', label: 'Thoải mái', max: 150_000 },
  { id: 'fancy', label: 'Sang', max: null },
] as const;

const INITIAL: RecommendationFilters = {
  meal: null,
  budgetMax: null,
  dishTypes: [],
  cuisines: [],
  spicyMax: null,
  adventure: 0.5,
  excluded: [],
};

interface FiltersState extends RecommendationFilters {
  setMeal: (meal: MealType | null) => void;
  setBudgetMax: (value: number | null) => void;
  toggleDishType: (value: DishType) => void;
  toggleCuisine: (value: Cuisine) => void;
  setSpicyMax: (value: Level | null) => void;
  setAdventure: (value: number) => void;
  excludeToday: (slug: string) => void;
  /** Bộ lọc mềm về mặc định, giữ nguyên bữa đang chọn. */
  reset: () => void;
  /** Xóa sạch, kể cả bữa và món đã loại — dùng khi đổi tài khoản. */
  clear: () => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const useFiltersStore = create<FiltersState>()((set) => ({
  ...INITIAL,
  setMeal: (meal) => set({ meal }),
  setBudgetMax: (budgetMax) => set({ budgetMax }),
  toggleDishType: (value) => set((s) => ({ dishTypes: toggle(s.dishTypes, value) })),
  toggleCuisine: (value) => set((s) => ({ cuisines: toggle(s.cuisines, value) })),
  setSpicyMax: (spicyMax) => set({ spicyMax }),
  setAdventure: (adventure) => set({ adventure }),
  excludeToday: (slug) => set((s) => ({ excluded: [...new Set([...s.excluded, slug])] })),
  reset: () => set((s) => ({ ...INITIAL, meal: s.meal })),
  clear: () => set(INITIAL),
}));

export function selectFilters(state: FiltersState): RecommendationFilters {
  return {
    meal: state.meal,
    budgetMax: state.budgetMax,
    dishTypes: state.dishTypes,
    cuisines: state.cuisines,
    spicyMax: state.spicyMax,
    adventure: state.adventure,
    excluded: state.excluded,
  };
}

export function countActiveFilters(f: RecommendationFilters): number {
  return (
    (f.budgetMax !== null ? 1 : 0) +
    f.dishTypes.length +
    f.cuisines.length +
    (f.spicyMax !== null ? 1 : 0) +
    (f.adventure !== 0.5 ? 1 : 0)
  );
}
