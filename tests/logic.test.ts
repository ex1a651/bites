// Run: npm test  (Node 22+, uses --experimental-strip-types; no deps needed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, summarize } from '../src/stats.ts';
import { guessFoodEmoji, ratingFace } from '../src/emoji.ts';
import { csvCell, dishesCsv, restaurantsCsv, BOM } from '../src/csv.ts';

const R = (id: number, name: string, emoji = '🍽️') => ({ id, name, emoji, created_at: '2026-10-01T00:00:00.000Z' });
let fid = 0;
const F = (restaurant_id: number, name: string, rating: number, eaten_on: string, emoji = '🍽️', note = '') => ({
  id: ++fid,
  restaurant_id,
  name,
  rating,
  emoji,
  eaten_on,
  note,
  created_at: '2026-10-01T00:00:00.000Z',
});

const restaurants = [R(1, 'Ramen Nagi', '🍜'), R(2, 'Jollibee', '🍗'), R(3, 'Empty Place'), R(4, 'Mendokoro', '🍜')];
const foods = [
  F(1, 'Butao King', 9.5, '2026-11-01', '🍜'),
  F(1, 'Black King', 8.5, '2026-11-01', '🍜'),
  F(1, 'Gyoza', 7, '2026-11-03', '🥟'),
  F(2, 'Chickenjoy', 8, '2026-10-20', '🍗'),
  F(2, 'Spaghetti', 6, '2026-10-20', '🍝'),
  F(2, 'Peach mango pie', 10, '2026-11-03', '🍰'),
  F(4, 'Shoyu ramen', 10, '2026-11-02', '🍜'),
];

test('summarize: averages, visits, best dish, ordering by last activity', () => {
  const s = summarize(restaurants, foods);
  const nagi = s.find((x) => x.restaurant.id === 1)!;
  assert.equal(nagi.dishes, 3);
  assert.equal(nagi.visits, 2); // Nov 1 + Nov 3
  assert.ok(Math.abs(nagi.avg! - 25 / 3) < 1e-9);
  assert.equal(nagi.best!.name, 'Butao King');
  const empty = s.find((x) => x.restaurant.id === 3)!;
  assert.equal(empty.avg, null);
  assert.equal(empty.lastDate, '2026-10-01');
  // Newest activity first: Nov 3 (Jollibee id 2, Nagi id 1 → higher id first), then Nov 2, then empty
  assert.deepEqual(s.map((x) => x.restaurant.id), [2, 1, 4, 3]);
});

test('computeStats: best restaurants + min dishes filter', () => {
  const all = computeStats(restaurants, foods, 1, new Date(2026, 10, 5));
  assert.deepEqual(all.bestRestaurants.map((r) => r.restaurant.name), ['Mendokoro', 'Ramen Nagi', 'Jollibee']);
  const min2 = computeStats(restaurants, foods, 2, new Date(2026, 10, 5));
  assert.deepEqual(min2.bestRestaurants.map((r) => r.restaurant.name), ['Ramen Nagi', 'Jollibee']);
});

test('computeStats: totals, top foods, distribution', () => {
  const st = computeStats(restaurants, foods, 1, new Date(2026, 10, 5));
  assert.equal(st.totals.restaurants, 4);
  assert.equal(st.totals.dishes, 7);
  assert.equal(st.totals.perfectTens, 2);
  assert.equal(st.totals.visits, 2 + 2 + 1);
  assert.equal(st.topFoods[0].rating, 10);
  assert.equal(st.topFoods[0].name, 'Peach mango pie'); // tie on 10 → newer date first
  assert.equal(st.topFoods[1].restaurantName, 'Mendokoro');
  assert.equal(st.distribution.reduce((a, b) => a + b, 0), 7);
  assert.equal(st.distribution[9], 2); // 10s
  assert.equal(st.distribution[8], 1); // 9.5 floors to 9
  assert.equal(st.distribution[7], 2); // 8.5, 8
});

test('computeStats: fun facts', () => {
  const st = computeStats(restaurants, foods, 1, new Date(2026, 10, 5));
  const f = st.facts;
  assert.equal(f.letdown!.name, 'Spaghetti');
  assert.equal(f.favKind!.emoji, '🍜'); // 3 ramen dishes avg 9.33
  assert.equal(f.favKind!.count, 3);
  assert.equal(f.bestDay!.date, '2026-11-01'); // avg 9 over 2 (Nov 3 avg 8.5)
  assert.equal(f.thisMonth.dishes, 5);
  assert.ok(['Ramen Nagi', 'Jollibee'].includes(f.mostVisited!.restaurant.name));
  assert.ok(f.mostConsistent); // both have 3 dishes
  assert.equal(f.mostConsistent!.restaurant.name, 'Ramen Nagi'); // spread ~1.03 vs ~1.63
});

test('computeStats: empty data', () => {
  const st = computeStats([], []);
  assert.equal(st.totals.avg, null);
  assert.equal(st.bestRestaurants.length, 0);
  assert.equal(st.facts.letdown, null);
  assert.equal(st.facts.favKind, null);
});

test('guessFoodEmoji', () => {
  const cases: [string, string][] = [
    ['Tonkotsu Ramen', '🍜'],
    ['Wintermelon milk tea', '🧋'],
    ['Chicken burger', '🍔'],
    ['Pork sisig', '🍳'],
    ['Bola bola chaofan', '🍚'],
    ['Halo-halo', '🍧'],
    ['Steak frites', '🥩'],
    ['Iced americano', '☕'],
    ['Pancakes', '🥞'],
    ['Kale salad', '🥗'],
    ['Mystery dish', '🍽️'],
    ['', '🍽️'],
  ];
  for (const [name, want] of cases) assert.equal(guessFoodEmoji(name), want, name);
});

test('ratingFace', () => {
  assert.equal(ratingFace(10), '🤩');
  assert.equal(ratingFace(9.5), '😍');
  assert.equal(ratingFace(2), '😖');
});

test('csv escaping + exports', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell(null), '');
  const d = dishesCsv(restaurants, foods);
  assert.ok(d.startsWith(BOM + 'date,restaurant,food,rating,emoji,note\n'));
  assert.equal(d.trim().split('\n').length, 8);
  assert.ok(d.includes('2026-10-20,Jollibee,Chickenjoy,8,🍗,'));
  const r = restaurantsCsv(summarize(restaurants, foods));
  const lines = r.trim().split('\n');
  assert.ok(lines[1].startsWith('Mendokoro,10,1,1,Shoyu ramen,10,2026-11-02'));
  assert.ok(lines[4].startsWith('Empty Place,,0,0,,,'));
});
