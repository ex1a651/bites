import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme';
import { checkpoint, DB_NAME, Food, Restaurant } from '../db';
import { dishesCsv, restaurantsCsv } from '../csv';
import { summarize } from '../stats';
import { plural } from '../format';
import { Bubbly, card, EmojiBubble, Txt } from '../ui';

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

export default function ExportScreen({ restaurants, foods }: { restaurants: Restaurant[]; foods: Food[] }) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Export failed', String(e));
    } finally {
      setBusy(false);
    }
  };

  const share = async (uri: string, mimeType: string) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing not available on this device');
      return;
    }
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Export food ratings' });
  };

  const writeCsv = async (name: string, text: string) => {
    const uri = `${FileSystem.cacheDirectory}${name}-${stamp()}.csv`;
    await FileSystem.writeAsStringAsync(uri, text);
    await share(uri, 'text/csv');
  };

  const exportDishes = () => run(() => writeCsv('bites-dishes', dishesCsv(restaurants, foods)));
  const exportRestaurants = () => run(() => writeCsv('bites-restaurants', restaurantsCsv(summarize(restaurants, foods))));

  const exportSqlite = () =>
    run(async () => {
      await checkpoint();
      const src = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
      const dest = `${FileSystem.cacheDirectory}bites-${stamp()}.sqlite`;
      await FileSystem.deleteAsync(dest, { idempotent: true });
      await FileSystem.copyAsync({ from: src, to: dest });
      await share(dest, 'application/vnd.sqlite3');
    });

  const none = !foods.length;
  return (
    <ScrollView contentContainerStyle={s.container}>
      <Txt style={s.count}>
        {plural(restaurants.length, 'restaurant')} · {plural(foods.length, 'dish', 'dishes')} rated
      </Txt>
      <ExportButton emoji="🧾" bg={colors.accentSoft} title="Dishes CSV" subtitle="Every food: date, restaurant, food, rating, note" onPress={exportDishes} disabled={busy || none} />
      <ExportButton emoji="🏪" bg={colors.peach + '33'} title="Restaurants CSV" subtitle="Average rating, dishes, visits, best dish per place" onPress={exportRestaurants} disabled={busy || !restaurants.length} />
      <ExportButton emoji="🗄️" bg={colors.lavender + '33'} title="SQLite database" subtitle="Full backup (.sqlite) — includes a restaurant_stats view" onPress={exportSqlite} disabled={busy} />
      <Txt style={s.hint}>Exports open the share sheet — save to Files, Drive, or send it anywhere 💌</Txt>
    </ScrollView>
  );
}

function ExportButton({ emoji, bg, title, subtitle, onPress, disabled }: { emoji: string; bg: string; title: string; subtitle: string; onPress: () => void; disabled: boolean }) {
  return (
    <Bubbly onPress={onPress} disabled={disabled} style={s.btn}>
      <EmojiBubble emoji={emoji} size={52} bg={bg} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Txt w="semibold" style={s.btnTitle}>
          {title}
        </Txt>
        <Txt style={s.btnSub}>{subtitle}</Txt>
      </View>
    </Bubbly>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  count: { color: colors.textDim, fontSize: 13, marginLeft: 4, marginBottom: 2 },
  btn: { ...card, padding: 16, flexDirection: 'row', alignItems: 'center' },
  btnTitle: { fontSize: 17 },
  btnSub: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  hint: { color: colors.textDim, fontSize: 13, textAlign: 'center', marginTop: 8 },
});
