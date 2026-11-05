const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Local date → 'YYYY-MM-DD' */
export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 'YYYY-MM-DD' → local Date (no timezone shift) */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'YYYY-MM-DD' → 'Nov 5' (adds year if not current year) */
export function shortDate(key: string): string {
  const d = fromKey(key);
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} '${String(d.getFullYear()).slice(2)}`;
}

/** 'YYYY-MM-DD' → 'Thu, Nov 5 2026' */
export function longDate(key: string): string {
  const d = fromKey(key);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

/** Today → 'Thursday · Nov 5' for the header. */
export function todayLabel(): string {
  const d = new Date();
  const full = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
  return `${full} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** 8 → '8', 8.5 → '8.5', 8.333 → '8.3' */
export function rating(n: number): string {
  return String(Math.round(n * 10) / 10);
}

export function plural(n: number, word: string, many = `${word}s`) {
  return `${n} ${n === 1 ? word : many}`;
}
