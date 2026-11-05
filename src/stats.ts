/**
 * Pure stats over the raw rows. No React / SQLite here so it's easy to test
 * (`npm test`). A "visit" = one restaurant on one date.
 */
import type { Food, Restaurant } from './db';

const DEFAULT_EMOJI = '🍽️';

export type RestaurantSummary = {
  restaurant: Restaurant;
  dishes: number;
  visits: number;
  avg: number | null; // null when no foods yet
  best: Food | null;
  lastDate: string; // YYYY-MM-DD — latest food date, or created date if empty
};

export type RankedFood = Food & { restaurantName: string; restaurantEmoji: string };

export type Stats = {
  totals: { restaurants: number; dishes: number; visits: number; avg: number | null; perfectTens: number };
  bestRestaurants: RestaurantSummary[];
  topFoods: RankedFood[];
  distribution: number[]; // index 0..9 → ratings 1..10 (floored, 1-wide buckets)
  facts: {
    mostVisited: RestaurantSummary | null;
    mostConsistent: (RestaurantSummary & { spread: number }) | null;
    letdown: RankedFood | null;
    favKind: { emoji: string; avg: number; count: number } | null;
    bestDay: { date: string; avg: number; count: number } | null;
    thisMonth: { dishes: number; avg: number | null };
  };
};

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function stdev(xs: number[]) {
  const m = mean(xs);
  if (m === null) return 0;
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length);
}

function groupBy<T, K>(xs: T[], key: (x: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const x of xs) {
    const k = key(x);
    const arr = m.get(k);
    if (arr) arr.push(x);
    else m.set(k, [x]);
  }
  return m;
}

const byRatingDesc = (a: Food, b: Food) => b.rating - a.rating || b.eaten_on.localeCompare(a.eaten_on) || b.id - a.id;

/** One row per restaurant for the Restaurants list, newest activity first. */
export function summarize(restaurants: Restaurant[], foods: Food[]): RestaurantSummary[] {
  const byRest = groupBy(foods, (f) => f.restaurant_id);
  return restaurants
    .map((r) => {
      const fs = byRest.get(r.id) ?? [];
      const ratings = fs.map((f) => f.rating);
      const dates = fs.map((f) => f.eaten_on).sort();
      return {
        restaurant: r,
        dishes: fs.length,
        visits: new Set(dates).size,
        avg: mean(ratings),
        best: fs.length ? [...fs].sort(byRatingDesc)[0] : null,
        lastDate: dates.length ? dates[dates.length - 1] : r.created_at.slice(0, 10),
      };
    })
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate) || b.restaurant.id - a.restaurant.id);
}

export function computeStats(restaurants: Restaurant[], foods: Food[], minDishes = 1, today = new Date()): Stats {
  const summaries = summarize(restaurants, foods);
  const restById = new Map(restaurants.map((r) => [r.id, r]));
  const rank = (f: Food): RankedFood => {
    const r = restById.get(f.restaurant_id);
    return { ...f, restaurantName: r?.name ?? '?', restaurantEmoji: r?.emoji ?? DEFAULT_EMOJI };
  };

  const rated = summaries.filter((s) => s.avg !== null);
  const ratings = foods.map((f) => f.rating);

  const bestRestaurants = rated
    .filter((s) => s.dishes >= minDishes)
    .sort((a, b) => b.avg! - a.avg! || b.dishes - a.dishes || a.restaurant.name.localeCompare(b.restaurant.name));

  const topFoods = [...foods].sort(byRatingDesc).slice(0, 10).map(rank);

  const distribution = Array.from({ length: 10 }, () => 0);
  for (const r of ratings) distribution[Math.min(9, Math.max(0, Math.floor(r) - 1))]++;

  // Fun facts
  const mostVisited = rated.length
    ? [...rated].sort((a, b) => b.visits - a.visits || b.dishes - a.dishes || b.avg! - a.avg!)[0]
    : null;

  const byRest = groupBy(foods, (f) => f.restaurant_id);
  const consistent = rated
    .filter((s) => s.dishes >= 3)
    .map((s) => ({ ...s, spread: stdev((byRest.get(s.restaurant.id) ?? []).map((f) => f.rating)) }))
    .sort((a, b) => a.spread - b.spread || b.avg! - a.avg!);

  const letdown = foods.length ? rank([...foods].sort((a, b) => a.rating - b.rating || b.eaten_on.localeCompare(a.eaten_on))[0]) : null;

  const kinds = [...groupBy(foods.filter((f) => f.emoji !== DEFAULT_EMOJI), (f) => f.emoji)]
    .filter(([, fs]) => fs.length >= 2)
    .map(([emoji, fs]) => ({ emoji, avg: mean(fs.map((f) => f.rating))!, count: fs.length }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count);

  const days = [...groupBy(foods, (f) => f.eaten_on)]
    .filter(([, fs]) => fs.length >= 2)
    .map(([date, fs]) => ({ date, avg: mean(fs.map((f) => f.rating))!, count: fs.length }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count || b.date.localeCompare(a.date));

  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthFoods = foods.filter((f) => f.eaten_on.startsWith(monthKey));

  return {
    totals: {
      restaurants: restaurants.length,
      dishes: foods.length,
      visits: summaries.reduce((a, s) => a + s.visits, 0),
      avg: mean(ratings),
      perfectTens: ratings.filter((r) => r >= 10).length,
    },
    bestRestaurants,
    topFoods,
    distribution,
    facts: {
      mostVisited,
      mostConsistent: consistent[0] ?? null,
      letdown,
      favKind: kinds[0] ?? null,
      bestDay: days[0] ?? null,
      thisMonth: { dishes: monthFoods.length, avg: mean(monthFoods.map((f) => f.rating)) },
    },
  };
}
