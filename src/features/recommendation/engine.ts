import { CUISINES, DISH_TYPES } from '@/features/foods/data/taxonomy';
import type { Cuisine, DishType, Food, FoodTag, Level, MealType } from '@/features/foods/types';
import type { InteractionEvent } from '@/features/history/types';
import type { DietaryRestrictions, TastePreferences } from '@/features/profile/types';

import type { WeatherKind } from './context';

export interface RecommendationFilters {
  meal: MealType | null;
  budgetMax: number | null;
  dishTypes: DishType[];
  cuisines: Cuisine[];
  spicyMax: Level | null;
  /** 0 = món quen, 1 = thử món mới. */
  adventure: number;
  /** Món bị loại trong hôm nay ("hôm nay không ăn phở nữa"). */
  excluded: string[];
}

export interface RecommendationContext {
  now: Date;
  meal: MealType;
  weather: WeatherKind | null;
  preferences: TastePreferences;
  restrictions: DietaryRestrictions;
  history: readonly InteractionEvent[];
  favorites: ReadonlySet<string>;
}

type ReasonKey =
  | 'WEATHER_RAIN'
  | 'WEATHER_COLD'
  | 'WEATHER_HOT'
  | 'LIKES_CUISINE'
  | 'LIKES_DISH'
  | 'FAVORITE'
  | 'POPULAR'
  | 'NEW'
  | 'FITS_BUDGET';

export interface ScoredFood {
  food: Food;
  score: number;
  reasons: ReasonKey[];
}

export interface Recommendation {
  food: Food;
  reason: string;
  /** Tập ứng viên đã cân nhắc (dùng cho vòng quay và log). */
  candidates: Food[];
}

/** Trọng số chấm điểm; về sau đưa lên Remote Config. */
const WEIGHTS = {
  popularity: 2,
  cuisinePref: 1.5,
  dishPref: 1.2,
  spicyFit: 1.5,
  budgetFit: 0.8,
  weather: 1.5,
  favorite: 1.2,
  liked: 1,
  novelty: 1.5,
  dislike: -3,
  skip: -0.6,
  recentSelect: -4,
  diversity: -1,
} as const;

const RECENT_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const PORK_KEYWORDS = ['heo', 'lợn', 'pate', 'thịt nguội', 'xúc xích', 'bì', 'nem chua'];
const LOW_CARB_TYPES: DishType[] = ['SALAD', 'GRILL', 'HOTPOT'];

const WEATHER_TAGS: Record<Exclude<WeatherKind, 'MILD'>, FoodTag[]> = {
  RAIN: ['SOUPY', 'WARM'],
  COLD: ['SOUPY', 'WARM'],
  HOT: ['COOL'],
};

// ── Bộ lọc cứng ───────────────────────────────────────────────

export function passesRestrictions(food: Food, restrictions: DietaryRestrictions): boolean {
  if (food.allergens.some((a) => restrictions.allergens.includes(a))) return false;

  for (const diet of restrictions.diets) {
    switch (diet) {
      case 'VEGAN':
        if (!food.diets.includes('VEGAN')) return false;
        break;
      case 'VEGETARIAN':
        if (!food.diets.includes('VEGETARIAN') && !food.diets.includes('VEGAN')) return false;
        break;
      case 'HALAL': {
        const hasPork = food.ingredients.some((i) => PORK_KEYWORDS.some((k) => i.includes(k)));
        if (hasPork && !food.diets.includes('HALAL')) return false;
        break;
      }
      case 'LOW_SUGAR':
        if (food.sweetLevel > 1) return false;
        break;
      case 'LOW_CARB':
        if (!food.diets.includes('LOW_CARB') && !LOW_CARB_TYPES.includes(food.dishType)) return false;
        break;
    }
  }
  return true;
}

export function filterCandidates(
  foods: readonly Food[],
  filters: RecommendationFilters,
  meal: MealType,
  restrictions: DietaryRestrictions,
): Food[] {
  return foods.filter((food) => {
    if (!passesRestrictions(food, restrictions)) return false;
    if (!food.mealTypes.includes(meal)) return false;
    if (filters.excluded.includes(food.slug)) return false;
    if (filters.budgetMax !== null && food.priceMin > filters.budgetMax) return false;
    if (filters.spicyMax !== null && food.spicyLevel > filters.spicyMax) return false;
    if (filters.dishTypes.length && !filters.dishTypes.includes(food.dishType)) return false;
    if (filters.cuisines.length && !filters.cuisines.includes(food.cuisine)) return false;
    return true;
  });
}

// ── Chấm điểm ────────────────────────────────────────────────

function daysSince(date: Date, now: Date) {
  return (now.getTime() - date.getTime()) / DAY_MS;
}

export function scoreFood(
  food: Food,
  filters: RecommendationFilters,
  ctx: RecommendationContext,
  lastDishType: DishType | null = null,
): ScoredFood {
  const reasons: ReasonKey[] = [];
  const { preferences, history, now } = ctx;
  let score = food.popularity * WEIGHTS.popularity;
  if (food.popularity >= 0.8) reasons.push('POPULAR');

  if (preferences.cuisines.includes(food.cuisine)) {
    score += WEIGHTS.cuisinePref;
    reasons.push('LIKES_CUISINE');
  }
  if (preferences.dishTypes.includes(food.dishType)) {
    score += WEIGHTS.dishPref;
    reasons.push('LIKES_DISH');
  }

  score += WEIGHTS.spicyFit * (1 - Math.abs(food.spicyLevel - preferences.spicyLevel) / 3);

  const budget = filters.budgetMax ?? preferences.budgetMax;
  if (budget !== null && food.priceMax <= budget) {
    score += WEIGHTS.budgetFit;
    reasons.push('FITS_BUDGET');
  }

  const weather = ctx.weather;
  if (weather && weather !== 'MILD' && food.tags.some((t) => WEATHER_TAGS[weather].includes(t))) {
    score += WEIGHTS.weather;
    reasons.push(`WEATHER_${weather}`);
  }

  if (ctx.favorites.has(food.slug)) {
    score += WEIGHTS.favorite;
    reasons.push('FAVORITE');
  }

  const events = history.filter((e) => e.slug === food.slug);
  let tried = false;
  for (const event of events) {
    const age = daysSince(event.createdAt, now);
    if (event.type === 'SELECT') tried = true;
    if (event.type === 'LIKE') score += WEIGHTS.liked;
    if (event.type === 'DISLIKE') score += WEIGHTS.dislike;
    if (event.type === 'SKIP' && age < RECENT_DAYS) score += WEIGHTS.skip;
    // Penalty món vừa chọn, giảm dần tuyến tính trong 7 ngày.
    if (event.type === 'SELECT' && age < RECENT_DAYS) {
      score += WEIGHTS.recentSelect * (1 - age / RECENT_DAYS);
    }
  }

  // Thanh phiêu lưu: món chưa thử được cộng khi muốn khám phá, món quen được cộng khi muốn an toàn.
  const noveltyDirection = tried ? 0.5 - filters.adventure : filters.adventure - 0.5;
  score += WEIGHTS.novelty * noveltyDirection * 2;
  if (!tried && filters.adventure > 0.6) reasons.push('NEW');

  // Đa dạng: tránh gợi ý cùng loại món với lần chọn gần nhất trong 24 giờ.
  if (lastDishType === food.dishType) score += WEIGHTS.diversity;

  return { food, score, reasons };
}

export function rankFoods(
  foods: readonly Food[],
  filters: RecommendationFilters,
  ctx: RecommendationContext,
): ScoredFood[] {
  const lastSelect = ctx.history.find(
    (e) => e.type === 'SELECT' && daysSince(e.createdAt, ctx.now) < 1,
  );
  const lastDishType = lastSelect
    ? (foods.find((f) => f.slug === lastSelect.slug)?.dishType ?? null)
    : null;

  return filterCandidates(foods, filters, ctx.meal, ctx.restrictions)
    .map((food) => scoreFood(food, filters, ctx, lastDishType))
    .sort((a, b) => b.score - a.score);
}

// ── Chọn ngẫu nhiên có trọng số ──────────────────────────────

/** Softmax sampling trong nhóm top N; temperature thấp = bám sát điểm hơn. */
export function pickWeighted<T extends { score: number }>(
  ranked: readonly T[],
  { topN = 12, temperature = 0.6, rng = Math.random }: { topN?: number; temperature?: number; rng?: () => number } = {},
): T | null {
  const pool = ranked.slice(0, topN);
  if (!pool.length) return null;
  const max = pool[0]!.score;
  const weights = pool.map((item) => Math.exp((item.score - max) / temperature));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let threshold = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    threshold -= weights[i]!;
    if (threshold <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}

// ── Giải thích gợi ý ─────────────────────────────────────────

const REASON_PRIORITY: ReasonKey[] = [
  'WEATHER_RAIN',
  'WEATHER_COLD',
  'WEATHER_HOT',
  'FAVORITE',
  'LIKES_DISH',
  'LIKES_CUISINE',
  'NEW',
  'FITS_BUDGET',
  'POPULAR',
];

function reasonText(key: ReasonKey, food: Food): string {
  switch (key) {
    case 'WEATHER_RAIN':
      return 'trời đang mưa';
    case 'WEATHER_COLD':
      return 'trời se lạnh';
    case 'WEATHER_HOT':
      return 'trời đang nóng';
    case 'FAVORITE':
      return 'bạn đã thích món này';
    case 'LIKES_DISH':
      return `bạn hay chọn ${DISH_TYPES[food.dishType].label.toLowerCase()}`;
    case 'LIKES_CUISINE':
      return `bạn thích món ${CUISINES[food.cuisine]}`;
    case 'NEW':
      return 'bạn chưa thử món này';
    case 'FITS_BUDGET':
      return 'vừa ngân sách của bạn';
    case 'POPULAR':
      return 'nhiều người đang chọn';
  }
}

export function explain(scored: ScoredFood): string {
  const top = REASON_PRIORITY.filter((key) => scored.reasons.includes(key)).slice(0, 2);
  if (!top.length) return 'Một lựa chọn mới cho hôm nay';
  const text = top.map((key) => reasonText(key, scored.food)).join(' và ');
  return `Vì ${text}`;
}

export function recommend(
  foods: readonly Food[],
  filters: RecommendationFilters,
  ctx: RecommendationContext,
  rng: () => number = Math.random,
): Recommendation | null {
  const ranked = rankFoods(foods, filters, ctx);
  const picked = pickWeighted(ranked, { rng });
  if (!picked) return null;
  return {
    food: picked.food,
    reason: explain(picked),
    candidates: ranked.slice(0, 12).map((s) => s.food),
  };
}
