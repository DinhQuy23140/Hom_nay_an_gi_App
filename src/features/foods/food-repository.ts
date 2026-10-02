import { normalizeVi } from '@/utils/text';

import { FOOD_SEEDS } from './data/foods';
import { INGREDIENT_ALLERGENS } from './data/taxonomy';
import type { Allergen, Food, FoodSeed, MealType } from './types';

const DRINK_TYPES = new Set(['COFFEE', 'TEA', 'JUICE']);
const DESSERT_TYPES = new Set(['ICE_CREAM', 'SWEET_SOUP']);

/**
 * Suy ra dị ứng từ nguyên liệu theo hướng an toàn: nguyên liệu chỉ cần
 * chứa từ khóa (ví dụ "tôm khô" chứa "tôm") là tính.
 */
function deriveAllergens(ingredients: string[]): Allergen[] {
  const result = new Set<Allergen>();
  for (const ingredient of ingredients) {
    const name = ingredient.toLowerCase();
    for (const [keyword, allergens] of Object.entries(INGREDIENT_ALLERGENS)) {
      if (name.includes(keyword.toLowerCase())) allergens.forEach((a) => result.add(a));
    }
  }
  return [...result];
}

function toFood(seed: FoodSeed): Food {
  const aliases = seed.aliases ?? [];
  return {
    ...seed,
    id: seed.slug,
    aliases,
    diets: seed.diets ?? [],
    pairings: seed.pairings ?? [],
    allergens: deriveAllergens(seed.ingredients),
    searchText: normalizeVi([seed.nameVi, seed.nameEn, ...aliases].join(' ')),
  };
}

const FOODS: readonly Food[] = FOOD_SEEDS.map(toFood);
const BY_SLUG = new Map(FOODS.map((food) => [food.slug, food]));

export function isDrink(food: Food) {
  return DRINK_TYPES.has(food.dishType);
}

export function isDessert(food: Food) {
  return DESSERT_TYPES.has(food.dishType);
}

export const foodRepository = {
  all(): readonly Food[] {
    return FOODS;
  },

  bySlug(slug: string): Food | undefined {
    return BY_SLUG.get(slug);
  },

  bySlugs(slugs: readonly string[]): Food[] {
    return slugs.map((slug) => BY_SLUG.get(slug)).filter((f): f is Food => !!f);
  },

  byMeal(meal: MealType): Food[] {
    return FOODS.filter((food) => food.mealTypes.includes(meal));
  },

  /** Tìm theo tên, tên tiếng Anh, alias; hỗ trợ gõ không dấu. */
  search(query: string, limit = 30): Food[] {
    const q = normalizeVi(query);
    if (!q) return [];
    const terms = q.split(/\s+/);
    return FOODS.filter((food) => terms.every((term) => food.searchText.includes(term)))
      .sort((a, b) => {
        const aStarts = a.searchText.startsWith(q) ? 1 : 0;
        const bStarts = b.searchText.startsWith(q) ? 1 : 0;
        return bStarts - aStarts || b.popularity - a.popularity;
      })
      .slice(0, limit);
  },

  similar(food: Food, limit = 8): Food[] {
    return FOODS.filter((other) => other.slug !== food.slug)
      .map((other) => {
        let score = 0;
        if (other.dishType === food.dishType) score += 2;
        if (other.cuisine === food.cuisine) score += 1;
        score += other.tags.filter((t) => food.tags.includes(t)).length;
        return { other, score };
      })
      .filter(({ score }) => score >= 2)
      .sort((a, b) => b.score - a.score || b.other.popularity - a.other.popularity)
      .slice(0, limit)
      .map(({ other }) => other);
  },

  pairings(food: Food): Food[] {
    return this.bySlugs(food.pairings);
  },

  drinks(): Food[] {
    return FOODS.filter(isDrink);
  },

  desserts(): Food[] {
    return FOODS.filter(isDessert);
  },

  popular(limit = 10): Food[] {
    return [...FOODS].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  },
};
