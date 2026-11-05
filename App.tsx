import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, softShadow } from './src/theme';
import {
  addFood,
  addRestaurant,
  deleteFood,
  deleteRestaurant,
  Food,
  FoodInput,
  loadAll,
  Restaurant,
  RestaurantInput,
  updateFood,
  updateRestaurant,
} from './src/db';
import { summarize } from './src/stats';
import { todayLabel, toKey } from './src/format';
import { Txt } from './src/ui';
import RestaurantsScreen, { confirmDeleteRestaurant } from './src/screens/RestaurantsScreen';
import StatsScreen from './src/screens/StatsScreen';
import ExportScreen from './src/screens/ExportScreen';
import RestaurantSheet from './src/components/RestaurantSheet';
import RestaurantModal from './src/components/RestaurantModal';
import FoodModal from './src/components/FoodModal';

type Tab = 'restaurants' | 'stats' | 'export';
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'restaurants', label: 'Restaurants', icon: '🍜' },
  { key: 'stats', label: 'Stats', icon: '🏆' },
  { key: 'export', label: 'Export', icon: '📦' },
];

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    [fonts.regular]: require('./assets/fonts/Fredoka-Regular.ttf'),
    [fonts.medium]: require('./assets/fonts/Fredoka-Medium.ttf'),
    [fonts.semibold]: require('./assets/fonts/Fredoka-SemiBold.ttf'),
    [fonts.bold]: require('./assets/fonts/Fredoka-Bold.ttf'),
  });

  const [tab, setTab] = useState<Tab>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);

  const [openId, setOpenId] = useState<number | null>(null); // restaurant sheet
  const [restModal, setRestModal] = useState<{ restaurant: Restaurant | null } | null>(null);
  const [foodModal, setFoodModal] = useState<{ food: Food | null } | null>(null);
  const [lastDate, setLastDate] = useState(toKey(new Date())); // so a whole meal shares one date

  const refresh = useCallback(async () => {
    const data = await loadAll();
    setRestaurants(data.restaurants);
    setFoods(data.foods);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const summaries = useMemo(() => summarize(restaurants, foods), [restaurants, foods]);
  const openSummary = summaries.find((s) => s.restaurant.id === openId) ?? null;
  const openFoods = useMemo(() => foods.filter((f) => f.restaurant_id === openId), [foods, openId]);

  const openRestaurant = (id: number) => {
    setLastDate(toKey(new Date()));
    setOpenId(id);
  };

  /* ----- Restaurants ----- */
  const saveRestaurant = async (input: RestaurantInput) => {
    const editing = restModal?.restaurant;
    if (editing) {
      await updateRestaurant(editing.id, input);
      setRestModal(null);
      await refresh();
    } else {
      const id = await addRestaurant(input);
      setRestModal(null);
      await refresh();
      // Straight into the food list, then the add-food popup once the sheet has slid in
      // (opening both in one frame can stack them in the wrong order on Android).
      openRestaurant(id);
      setTimeout(() => setFoodModal({ food: null }), 350);
    }
  };

  const removeRestaurant = async (id: number) => {
    await deleteRestaurant(id);
    if (openId === id) setOpenId(null);
    await refresh();
  };

  /* ----- Foods ----- */
  const saveFood = async (input: FoodInput, keepOpen: boolean) => {
    if (foodModal?.food) await updateFood(foodModal.food.id, input);
    else if (openId !== null) await addFood(openId, input);
    setLastDate(input.eaten_on);
    if (!keepOpen) setFoodModal(null);
    await refresh();
  };

  const removeFood = async (f: Food) => {
    await deleteFood(f.id);
    await refresh();
  };

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={s.header}>
          <Txt w="medium" style={s.date}>
            {todayLabel()}
          </Txt>
          <Txt w="bold" style={s.title}>
            {tab === 'restaurants' ? 'Bites 🍓' : tab === 'stats' ? 'Stats ✨' : 'Export 💌'}
          </Txt>
        </View>

        <View style={s.body}>
          {tab === 'restaurants' && (
            <RestaurantsScreen
              summaries={summaries}
              onAdd={() => setRestModal({ restaurant: null })}
              onOpen={(x) => openRestaurant(x.restaurant.id)}
              onEdit={(x) => setRestModal({ restaurant: x.restaurant })}
              onDelete={(x) => removeRestaurant(x.restaurant.id)}
            />
          )}
          {tab === 'stats' && <StatsScreen restaurants={restaurants} foods={foods} onOpenRestaurant={openRestaurant} />}
          {tab === 'export' && <ExportScreen restaurants={restaurants} foods={foods} />}
        </View>

        <View style={s.tabBar}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={[s.tab, on && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={s.tabIcon}>{t.icon}</Text>
                <Txt w={on ? 'semibold' : 'medium'} style={[s.tabText, on && { color: colors.accent }]}>
                  {t.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>

        {/* Order matters: later modals stack on top of earlier ones. */}
        <RestaurantSheet
          summary={openSummary}
          foods={openFoods}
          onClose={() => setOpenId(null)}
          onAddFood={() => setFoodModal({ food: null })}
          onEditFood={(f) => setFoodModal({ food: f })}
          onDeleteFood={removeFood}
          onEditRestaurant={() => openSummary && setRestModal({ restaurant: openSummary.restaurant })}
          onDeleteRestaurant={() => openSummary && confirmDeleteRestaurant(openSummary, () => removeRestaurant(openSummary.restaurant.id))}
        />
        <RestaurantModal visible={restModal !== null} restaurant={restModal?.restaurant ?? null} onCancel={() => setRestModal(null)} onSave={saveRestaurant} />
        <FoodModal
          visible={foodModal !== null}
          restaurantName={openSummary?.restaurant.name ?? ''}
          food={foodModal?.food ?? null}
          defaultDate={lastDate}
          onCancel={() => setFoodModal(null)}
          onSave={saveFood}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 4 },
  date: { color: colors.textDim, fontSize: 13 },
  title: { fontSize: 30 },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    padding: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    ...softShadow,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999 },
  tabOn: { backgroundColor: colors.accentSoft },
  tabIcon: { fontSize: 17 },
  tabText: { fontSize: 14, color: colors.textDim },
});
