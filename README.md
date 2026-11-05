# Bites 🍓

A light, cute food-rating diary for Android, built with React Native (Expo).
Log the restaurant, rate every dish out of 10, and find out where you *actually* eat best.
Sister app to [calories](https://github.com/ex1a651/calories) and [sleeping](https://github.com/ex1a651/sleeping).

## Tabs

**🍜 Restaurants**
- `＋ Add restaurant` → type the name, pick an icon → the restaurant's food list pops up with the add-food popup already open
- `＋ Add food` → food name, rating (tap 1–10, optional `+½`), date eaten, optional note
- **Save & add more** keeps the popup open (same date) so you can rate a whole meal in one go
- Each food gets a cute icon guessed from its name (ramen → 🍜, milk tea → 🧋, sisig → 🍳, halo-halo → 🍧 …); tap another to change it
- ✏️ / 🗑️ on the side of every restaurant and food to edit or delete (deleting a restaurant deletes its foods)
- Restaurant cards show average rating, dish count, last visit and their best dish; foods inside are grouped by date
- Search bar appears once you have 5+ restaurants

**🏆 Stats**
- Totals: restaurants, dishes rated, overall average, perfect 10s
- **Best restaurants** by average rating, with a *min dishes* filter (1+ / 2+ / 3+ / 5+) so one lucky 10 doesn't top the chart
- **Top dishes**: your 10 highest-rated foods
- **How you rate**: rating distribution 1–10
- **Fun facts**: most visited, favorite kind of food (by icon), best food day, most consistent restaurant, this month, biggest letdown
- Tap any restaurant or dish in Stats to jump to it

**📦 Export** (opens the share sheet)
- **Dishes CSV** — `date, restaurant, food, rating, emoji, note`
- **Restaurants CSV** — `restaurant, avg_rating, dishes, visits, best_dish, best_rating, last_visit`
- **SQLite database** — full backup; includes a `restaurant_stats` view for quick queries

CSV files start with a UTF-8 BOM so Excel / Google Sheets show emoji correctly.

A *visit* = one restaurant on one date.

## Get the APK

Every push to `main` builds an APK with GitHub Actions:
**Releases → "Latest build" → `bites.apk`**, or **Actions → latest run → Artifacts**.

Signed with the default debug key — fine for personal sideloading.

## Run locally

```bash
npm install
npx expo install --fix   # align native module versions with the Expo SDK
npx expo run:android     # needs Android Studio / a device with USB debugging
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm test            # stats / emoji / CSV logic tests (Node 22+, no extra deps)
```

## Stack

Expo SDK 54 · React Native 0.81 · TypeScript · `expo-sqlite` (local storage) · `expo-file-system` + `expo-sharing` (export) · `@react-native-community/datetimepicker` · Fredoka font (bundled).

No navigation library, no state library, no network — everything stays on the phone.
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it fits together.

## Credits

Fredoka font © The Fredoka Project Authors, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
