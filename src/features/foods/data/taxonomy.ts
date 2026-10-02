import type { IconName } from '@/components/ui';

import type { Allergen, Cuisine, Diet, DishType, MealType, Region } from '../types';

interface TaxonomyItem {
  label: string;
  icon: IconName;
}

export const MEAL_TYPES: Record<MealType, TaxonomyItem> = {
  BREAKFAST: { label: 'Sáng', icon: 'sunny-outline' },
  LUNCH: { label: 'Trưa', icon: 'restaurant-outline' },
  DINNER: { label: 'Tối', icon: 'moon-outline' },
  SNACK: { label: 'Ăn vặt', icon: 'fast-food-outline' },
  LATE_NIGHT: { label: 'Ăn đêm', icon: 'cloudy-night-outline' },
  DRINK: { label: 'Đồ uống', icon: 'cafe-outline' },
  DESSERT: { label: 'Tráng miệng', icon: 'ice-cream-outline' },
};

export const DISH_TYPES: Record<DishType, TaxonomyItem> = {
  NOODLE_SOUP: { label: 'Món nước', icon: 'water-outline' },
  NOODLE_DRY: { label: 'Bún, mì khô', icon: 'restaurant-outline' },
  RICE: { label: 'Cơm', icon: 'nutrition-outline' },
  BREAD: { label: 'Bánh mì, bánh', icon: 'pizza-outline' },
  STICKY_RICE: { label: 'Xôi', icon: 'leaf-outline' },
  GRILL: { label: 'Nướng, chiên', icon: 'flame-outline' },
  HOTPOT: { label: 'Lẩu', icon: 'people-outline' },
  SALAD: { label: 'Gỏi, salad', icon: 'leaf-outline' },
  SNACK: { label: 'Ăn vặt', icon: 'fast-food-outline' },
  COFFEE: { label: 'Cà phê', icon: 'cafe-outline' },
  TEA: { label: 'Trà', icon: 'beer-outline' },
  JUICE: { label: 'Nước ép, sinh tố', icon: 'wine-outline' },
  ICE_CREAM: { label: 'Kem', icon: 'ice-cream-outline' },
  SWEET_SOUP: { label: 'Chè, bánh ngọt', icon: 'heart-outline' },
};

export const CUISINES: Record<Cuisine, string> = {
  VIETNAMESE: 'Việt',
  JAPANESE: 'Nhật',
  KOREAN: 'Hàn',
  CHINESE: 'Trung',
  THAI: 'Thái',
  WESTERN: 'Âu',
  INDIAN: 'Ấn',
};

export const REGIONS: Record<Region, string> = {
  NORTH: 'Miền Bắc',
  CENTRAL: 'Miền Trung',
  SOUTH: 'Miền Nam',
  NATIONAL: 'Phổ biến',
};

export const ALLERGENS: Record<Allergen, string> = {
  PEANUT: 'Đậu phộng',
  SHELLFISH: 'Hải sản có vỏ',
  FISH: 'Cá, nước mắm',
  EGG: 'Trứng',
  MILK: 'Sữa',
  GLUTEN: 'Gluten',
  SOY: 'Đậu nành',
  TREE_NUT: 'Hạt cây',
  SESAME: 'Mè (vừng)',
};

export const DIETS: Record<Diet, string> = {
  VEGETARIAN: 'Ăn chay',
  VEGAN: 'Thuần chay',
  HALAL: 'Halal',
  LOW_SUGAR: 'Ít đường',
  LOW_CARB: 'Low-carb',
};

/**
 * Bảng ánh xạ nguyên liệu → dị ứng. Dị ứng của món được suy ra từ đây,
 * không nhập tay, để tránh sai sót ở dữ liệu nhạy cảm.
 */
export const INGREDIENT_ALLERGENS: Record<string, Allergen[]> = {
  'đậu phộng': ['PEANUT'],
  tôm: ['SHELLFISH'],
  cua: ['SHELLFISH'],
  'mắm tôm': ['SHELLFISH'],
  'mắm ruốc': ['SHELLFISH'],
  ốc: ['SHELLFISH'],
  hến: ['SHELLFISH'],
  mực: ['SHELLFISH'],
  'hải sản': ['SHELLFISH', 'FISH'],
  'nước mắm': ['FISH'],
  cá: ['FISH'],
  'chả cá': ['FISH'],
  'cá hồi': ['FISH'],
  trứng: ['EGG'],
  sữa: ['MILK'],
  'sữa đặc': ['MILK'],
  'phô mai': ['MILK'],
  'kem sữa': ['MILK'],
  'bơ sữa': ['MILK'],
  'bột mì': ['GLUTEN'],
  'bánh mì': ['GLUTEN'],
  mì: ['GLUTEN'],
  'mì Ý': ['GLUTEN'],
  'nước tương': ['SOY', 'GLUTEN'],
  'đậu hũ': ['SOY'],
  'đậu nành': ['SOY'],
  'tương ớt Hàn': ['SOY', 'GLUTEN'],
  'hạt điều': ['TREE_NUT'],
  'dừa': ['TREE_NUT'],
  mè: ['SESAME'],
  'dầu mè': ['SESAME'],
};
