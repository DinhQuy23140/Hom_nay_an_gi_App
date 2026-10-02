import type { MealType } from '@/features/foods/types';

export type WeatherKind = 'RAIN' | 'COLD' | 'HOT' | 'MILD';

/** Bữa ăn mặc định theo giờ trong ngày. */
export function mealForTime(date: Date): MealType {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return 'BREAKFAST';
  if (hour >= 10 && hour < 14) return 'LUNCH';
  if (hour >= 14 && hour < 17) return 'SNACK';
  if (hour >= 17 && hour < 21) return 'DINNER';
  return 'LATE_NIGHT';
}

export function greetingForTime(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'Chào buổi sáng';
  if (hour >= 11 && hour < 14) return 'Trưa rồi';
  if (hour >= 14 && hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}
