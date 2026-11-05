import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'bites.db';

export type Restaurant = {
  id: number;
  name: string;
  emoji: string;
  created_at: string; // ISO timestamp
};

export type Food = {
  id: number;
  restaurant_id: number;
  name: string;
  rating: number; // 1–10, half steps
  emoji: string;
  eaten_on: string; // YYYY-MM-DD
  note: string;
  created_at: string; // ISO timestamp
};

/** What the editor sends; ids/timestamps are filled in here. */
export type FoodInput = Pick<Food, 'name' | 'rating' | 'emoji' | 'eaten_on' | 'note'>;
export type RestaurantInput = Pick<Restaurant, 'name' | 'emoji'>;

const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS restaurants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          emoji TEXT NOT NULL DEFAULT '🍽️',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS foods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 10),
          emoji TEXT NOT NULL DEFAULT '🍽️',
          eaten_on TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_foods_restaurant ON foods(restaurant_id);
        CREATE INDEX IF NOT EXISTS idx_foods_eaten_on ON foods(eaten_on);

        -- Handy when you open the exported .sqlite in a DB browser.
        CREATE VIEW IF NOT EXISTS restaurant_stats AS
          SELECT r.id, r.name, r.emoji,
            COUNT(f.id) AS dishes,
            COUNT(DISTINCT f.eaten_on) AS visits,
            ROUND(AVG(f.rating), 2) AS avg_rating,
            MAX(f.rating) AS best_rating,
            MIN(f.eaten_on) AS first_visit,
            MAX(f.eaten_on) AS last_visit
          FROM restaurants r LEFT JOIN foods f ON f.restaurant_id = r.id
          GROUP BY r.id;

        PRAGMA user_version = ${SCHEMA_VERSION};
      `);
      return db;
    })();
  }
  return dbPromise;
}

/* ---------- Load everything (personal-scale data: a few thousand rows at most) ---------- */

export async function loadAll(): Promise<{ restaurants: Restaurant[]; foods: Food[] }> {
  const db = await getDb();
  const restaurants = await db.getAllAsync<Restaurant>('SELECT * FROM restaurants');
  const foods = await db.getAllAsync<Food>('SELECT * FROM foods ORDER BY eaten_on DESC, id DESC');
  return { restaurants, foods };
}

/* ---------- Restaurants ---------- */

export async function addRestaurant(r: RestaurantInput): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    'INSERT INTO restaurants (name, emoji, created_at) VALUES (?, ?, ?)',
    r.name,
    r.emoji,
    new Date().toISOString(),
  );
  return res.lastInsertRowId;
}

export async function updateRestaurant(id: number, r: RestaurantInput) {
  const db = await getDb();
  await db.runAsync('UPDATE restaurants SET name = ?, emoji = ? WHERE id = ?', r.name, r.emoji, id);
}

/** Also deletes its foods (ON DELETE CASCADE). */
export async function deleteRestaurant(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM restaurants WHERE id = ?', id);
}

/* ---------- Foods ---------- */

export async function addFood(restaurantId: number, f: FoodInput) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO foods (restaurant_id, name, rating, emoji, eaten_on, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    restaurantId,
    f.name,
    f.rating,
    f.emoji,
    f.eaten_on,
    f.note,
    new Date().toISOString(),
  );
}

export async function updateFood(id: number, f: FoodInput) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE foods SET name = ?, rating = ?, emoji = ?, eaten_on = ?, note = ? WHERE id = ?',
    f.name,
    f.rating,
    f.emoji,
    f.eaten_on,
    f.note,
    id,
  );
}

export async function deleteFood(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM foods WHERE id = ?', id);
}

/** Flush the WAL so the .db file on disk is complete before exporting it. */
export async function checkpoint() {
  const db = await getDb();
  await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
}
