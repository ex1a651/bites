# Bites — Architecture

Minimal-first: one screen-state machine in `App.tsx`, one SQLite file, pure functions for everything that can be pure.
No router, no Redux/Zustand, no network.

## Folder layout

```
bites/
├── App.tsx                  # Root: fonts, tab bar, app state, all modals
├── index.ts                 # registerRootComponent
├── app.json                 # Expo config (light UI, Android package com.ex1a651.bites)
├── assets/fonts/            # Fredoka Regular/Medium/SemiBold/Bold (static .ttf) + OFL
├── src/
│   ├── db.ts                # SQLite schema + CRUD (the only file that touches expo-sqlite)
│   ├── stats.ts             # PURE: summaries per restaurant + all Stats-tab numbers
│   ├── csv.ts               # PURE: CSV building (escaping, BOM)
│   ├── emoji.ts             # PURE: food-name → emoji guesser, emoji grids, rating faces
│   ├── format.ts            # PURE: dates, numbers, plurals
│   ├── theme.ts             # Colors, radii, fonts, shadow, rating → color
│   ├── ui.tsx               # Shared bits: Txt, Bubbly, Fab, IconBtn, Button, Field, Sheet, RatingPill, EmojiBubble, Empty
│   ├── screens/
│   │   ├── RestaurantsScreen.tsx   # Tab 1: restaurant cards, search, ＋ Add restaurant
│   │   ├── StatsScreen.tsx         # Tab 2: tiles, rankings, distribution, fun facts
│   │   └── ExportScreen.tsx        # Tab 3: CSV / SQLite via share sheet
│   └── components/
│       ├── RestaurantSheet.tsx     # Full-screen popup: one restaurant's foods grouped by date
│       ├── RestaurantModal.tsx     # Add / edit restaurant (name + icon)
│       ├── FoodModal.tsx           # Add / edit food (name, icon, rating, date, note; "Save & add more")
│       ├── RatingPicker.tsx        # 1–10 bubbles + ½ toggle
│       └── EmojiRow.tsx            # Horizontal emoji chooser
├── tests/logic.test.ts      # node:test for stats / emoji / csv (no deps)
└── .github/workflows/build-apk.yml  # typecheck → tests → prebuild → gradle → release APK
```

## Data model

```
restaurants                         foods
───────────                         ─────
id          INTEGER PK          ┌── id          INTEGER PK
name        TEXT                │   restaurant_id INTEGER FK → restaurants.id  ON DELETE CASCADE
emoji       TEXT ('🍽️')         │   name        TEXT
created_at  TEXT (ISO)          │   rating      REAL  CHECK 0..10 (UI gives 1–10 in ½ steps)
     1 ─────────────────────── *┘   emoji       TEXT
                                    eaten_on    TEXT 'YYYY-MM-DD' (local date)
                                    note        TEXT ('')
                                    created_at  TEXT (ISO)

VIEW restaurant_stats  → dishes, visits, avg_rating, best_rating, first_visit, last_visit per restaurant
PRAGMA user_version = 1 → bump + migrate in getDb() when the schema changes
```

- Dates are stored as local `YYYY-MM-DD` strings so grouping by day never shifts with time zones.
- A **visit** is derived, not stored: distinct `(restaurant_id, eaten_on)` pairs.
- `foods.emoji` is saved (not recomputed) so your manual icon choice sticks and the "favorite kind" stat can group by it.

## Data flow

```
         ┌──────────── App.tsx (state) ─────────────┐
         │ restaurants[], foods[]  ← loadAll()      │
         │ summaries = summarize(restaurants, foods)│   (useMemo)
         │ tab, openId, restModal, foodModal, lastDate
         └───┬───────────────┬───────────────┬──────┘
             │ props         │ props         │ props
   RestaurantsScreen    StatsScreen      ExportScreen
             │          computeStats()   dishesCsv() / restaurantsCsv() / copy .db
             ▼                (useMemo)
      RestaurantSheet ──► FoodModal / RestaurantModal
             │                     │
             └── callbacks ──► db.ts write ──► refresh() ──► loadAll() ──► re-render
```

1. On launch `App` loads fonts, then `loadAll()` reads both tables once.
2. Every write (add/edit/delete) goes through `db.ts`, then `refresh()` reloads everything.
   Personal-scale data (hundreds to a few thousand rows) makes "reload all" simpler and fast enough — no cache invalidation bugs.
3. Derived data (`summarize`, `computeStats`) is recomputed in `useMemo` from the two arrays.
   Keeping these pure (no React, no SQLite) means they're unit-tested with plain Node.

## UI flow

```
Restaurants tab ──＋ Add restaurant──► RestaurantModal ──save──► RestaurantSheet opens
                                                                  └─(350 ms)─► FoodModal (add)
                                                                                 ├─ Save & add more → stays open, same date, "✓ Added …" list
                                                                                 └─ Save → closes
Restaurants tab ── tap card ─────────► RestaurantSheet ── ✏️/🗑️ per food, ✏️/🗑️ restaurant in header
Stats tab ── tap a restaurant/dish ──► RestaurantSheet
```

Modals are siblings at the bottom of `App`; later ones render above earlier ones
(`RestaurantSheet` < `RestaurantModal` < `FoodModal`). The food popup opens 350 ms after a new
restaurant's sheet so Android stacks them in the right order.

## Look & feel

- **Palette:** cream background `#FFF7F2`, white cards, strawberry `#FF7A9A` accent, plus peach, butter, mint and lavender for tints. Plum text `#4A2E3A` instead of black keeps it soft.
- **Rating colors:** lavender (<4) → mint (4+) → butter (6+) → peach (7.5+) → strawberry (9+). Used for pills, bars and the picker.
- **Shape:** 20–28 px radii, pill buttons, circular emoji bubbles, soft pink shadows, a floating pill tab bar.
- **Type:** Fredoka (rounded) in four static weights — Android can't pick weights from one family, so `Txt w="bold"` maps to `Fredoka-Bold` etc.
- **Motion:** `Bubbly` pressables squish to 96 % on press; sheets slide, dialogs fade.
- **Datey touches:** today's date above every title, foods grouped under 📅 date headers, date chip on each food, "Best food day" and "This month" stats.

## Export

| Export | Built by | Notes |
|---|---|---|
| Dishes CSV | `csv.dishesCsv` | sorted by date; UTF-8 BOM for Excel |
| Restaurants CSV | `csv.restaurantsCsv(summarize())` | sorted by avg rating |
| SQLite | `PRAGMA wal_checkpoint(TRUNCATE)` then copy `SQLite/bites.db` | WAL flushed first so the copy is complete |

Files go to the cache dir, then `expo-sharing` opens the Android share sheet.

## Extending

- **Import** (restore from the exported `.sqlite` or Dishes CSV): add `expo-document-picker`, parse with `csv.ts` counterparts, insert inside `withTransactionAsync`.
- **Photos per dish:** add `photo_uri TEXT` column (bump `user_version`), `expo-image-picker`, copy into `documentDirectory`.
- **Web build:** `expo-sqlite` on web needs its wasm setup and COOP/COEP headers — check the Expo docs before hosting.
