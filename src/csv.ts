import type { Food, Restaurant } from './db';
import type { RestaurantSummary } from './stats';

export const csvCell = (v: string | number | null) => {
  if (v === null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const r2 = (n: number | null) => (n === null ? '' : String(Math.round(n * 100) / 100));

/** UTF-8 BOM so Excel/Sheets show emoji & accents correctly. */
export const BOM = '﻿';

export function toCsv(rows: (string | number | null)[][]): string {
  return BOM + rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}

/** One line per dish — the full log. */
export function dishesCsv(restaurants: Restaurant[], foods: Food[]): string {
  const names = new Map(restaurants.map((r) => [r.id, r.name]));
  const sorted = [...foods].sort((a, b) => a.eaten_on.localeCompare(b.eaten_on) || a.id - b.id);
  return toCsv([
    ['date', 'restaurant', 'food', 'rating', 'emoji', 'note'],
    ...sorted.map((f) => [f.eaten_on, names.get(f.restaurant_id) ?? '', f.name, f.rating, f.emoji, f.note]),
  ]);
}

/** One line per restaurant — averages & visit dates. */
export function restaurantsCsv(summaries: RestaurantSummary[]): string {
  const sorted = [...summaries].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  return toCsv([
    ['restaurant', 'avg_rating', 'dishes', 'visits', 'best_dish', 'best_rating', 'last_visit'],
    ...sorted.map((s) => [
      s.restaurant.name,
      r2(s.avg),
      s.dishes,
      s.visits,
      s.best?.name ?? '',
      s.best?.rating ?? '',
      s.dishes ? s.lastDate : '',
    ]),
  ]);
}
