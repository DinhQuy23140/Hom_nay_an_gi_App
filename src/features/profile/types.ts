import type { Allergen, Cuisine, Diet, DishType, Level } from '@/features/foods/types';

export interface TastePreferences {
  spicyLevel: Level;
  /** Ngân sách tối đa mỗi người (VND); null = không giới hạn. */
  budgetMax: number | null;
  cuisines: Cuisine[];
  dishTypes: DishType[];
}

/** Bộ lọc cứng: món vi phạm bị loại hẳn khỏi gợi ý. */
export interface DietaryRestrictions {
  allergens: Allergen[];
  diets: Diet[];
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  onboarded: boolean;
  preferences: TastePreferences;
  restrictions: DietaryRestrictions;
}

export const DEFAULT_PREFERENCES: TastePreferences = {
  spicyLevel: 1,
  budgetMax: null,
  cuisines: [],
  dishTypes: [],
};

export const DEFAULT_RESTRICTIONS: DietaryRestrictions = {
  allergens: [],
  diets: [],
};
