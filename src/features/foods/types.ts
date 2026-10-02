export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'LATE_NIGHT' | 'DRINK' | 'DESSERT';

export type DishType =
  | 'NOODLE_SOUP'
  | 'NOODLE_DRY'
  | 'RICE'
  | 'BREAD'
  | 'STICKY_RICE'
  | 'GRILL'
  | 'HOTPOT'
  | 'SALAD'
  | 'SNACK'
  | 'COFFEE'
  | 'TEA'
  | 'JUICE'
  | 'ICE_CREAM'
  | 'SWEET_SOUP';

export type Cuisine = 'VIETNAMESE' | 'JAPANESE' | 'KOREAN' | 'CHINESE' | 'THAI' | 'WESTERN' | 'INDIAN';

export type Region = 'NORTH' | 'CENTRAL' | 'SOUTH' | 'NATIONAL';

export type Allergen = 'PEANUT' | 'SHELLFISH' | 'FISH' | 'EGG' | 'MILK' | 'GLUTEN' | 'SOY' | 'TREE_NUT' | 'SESAME';

export type Diet = 'VEGETARIAN' | 'VEGAN' | 'HALAL' | 'LOW_SUGAR' | 'LOW_CARB';

export type FoodTag =
  | 'GRILLED'
  | 'STREET_FOOD'
  | 'POPULAR'
  | 'SOUPY'
  | 'HEALTHY'
  | 'QUICK'
  | 'GROUP'
  | 'WARM'
  | 'COOL'
  | 'RICH'
  | 'SOUR'
  | 'CRISPY'
  | 'DATE';

export type Level = 0 | 1 | 2 | 3;

/** Dữ liệu biên tập của một món, trước khi suy ra dị ứng. */
export interface FoodSeed {
  slug: string;
  nameVi: string;
  nameEn: string;
  aliases?: string[];
  dishType: DishType;
  cuisine: Cuisine;
  region: Region;
  mealTypes: MealType[];
  priceMin: number;
  priceMax: number;
  spicyLevel: Level;
  sweetLevel: Level;
  diets?: Diet[];
  tags: FoodTag[];
  ingredients: string[];
  caloriesEst?: number;
  /** Caffeine ước lượng (mg) cho nhánh đồ uống. */
  caffeineMg?: number;
  description: string;
  popularity: number;
  pairings?: string[];
}

export interface Food extends Omit<FoodSeed, 'aliases' | 'diets' | 'pairings'> {
  id: string;
  aliases: string[];
  diets: Diet[];
  pairings: string[];
  allergens: Allergen[];
  /** Chuỗi đã bỏ dấu, dùng cho tìm kiếm. */
  searchText: string;
}
