import { useMemo } from 'react';
import { Alert, Modal, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, softShadow } from '../theme';
import { longDate, plural, rating as fmt } from '../format';
import type { Food } from '../db';
import type { RestaurantSummary } from '../stats';
import { Bubbly, card, EmojiBubble, Empty, Fab, IconBtn, RatingPill, Txt } from '../ui';

type Props = {
  summary: RestaurantSummary | null; // null = closed
  foods: Food[]; // this restaurant's foods
  onClose: () => void;
  onAddFood: () => void;
  onEditFood: (f: Food) => void;
  onDeleteFood: (f: Food) => void;
  onEditRestaurant: () => void;
  onDeleteRestaurant: () => void;
};

/** Full-screen popup listing a restaurant's foods, grouped by the date you ate them. */
export default function RestaurantSheet({ summary, foods, onClose, onAddFood, onEditFood, onDeleteFood, onEditRestaurant, onDeleteRestaurant }: Props) {
  const sections = useMemo(() => {
    const byDate = new Map<string, Food[]>();
    for (const f of foods) byDate.set(f.eaten_on, [...(byDate.get(f.eaten_on) ?? []), f]);
    return [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({ date, data: data.sort((a, b) => a.id - b.id) }));
  }, [foods]);

  const confirmDelete = (f: Food) =>
    Alert.alert('Delete food?', `${f.emoji} ${f.name} · ${fmt(f.rating)}/10`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteFood(f) },
    ]);

  const r = summary?.restaurant;
  return (
    <Modal visible={!!summary} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        {summary && r && (
          <>
            <View style={s.topBar}>
              <Bubbly onPress={onClose} style={s.back} label="Back">
                <Txt w="bold" style={{ fontSize: 22 }}>
                  ‹
                </Txt>
              </Bubbly>
              <View style={{ flex: 1 }} />
              <IconBtn icon="✏️" label="Edit restaurant" onPress={onEditRestaurant} />
              <IconBtn icon="🗑️" label="Delete restaurant" onPress={onDeleteRestaurant} />
            </View>

            <View style={s.hero}>
              <EmojiBubble emoji={r.emoji} size={72} bg={colors.accentSoft} />
              <Txt w="bold" style={s.name} numberOfLines={2}>
                {r.name}
              </Txt>
              <Txt style={s.meta}>
                {plural(summary.dishes, 'dish', 'dishes')} · {plural(summary.visits, 'visit')}
              </Txt>
              {summary.avg !== null && (
                <View style={s.avgRow}>
                  <Txt w="medium" style={s.meta}>
                    avg
                  </Txt>
                  <RatingPill value={summary.avg} big />
                </View>
              )}
            </View>

            <SectionList
              sections={sections}
              keyExtractor={(f) => String(f.id)}
              contentContainerStyle={s.list}
              stickySectionHeadersEnabled={false}
              ListEmptyComponent={<Empty emoji="🥢" title="No foods yet" hint="Tap ＋ Add food to rate what you ordered." />}
              renderSectionHeader={({ section }) => (
                <Txt w="semibold" style={s.dateHeader}>
                  📅 {longDate(section.date)}
                </Txt>
              )}
              renderItem={({ item }) => (
                <Bubbly onPress={() => onEditFood(item)} style={s.row}>
                  <EmojiBubble emoji={item.emoji} size={42} />
                  <View style={s.rowMain}>
                    <Txt w="medium" style={s.food} numberOfLines={1}>
                      {item.name}
                    </Txt>
                    {item.note ? (
                      <Txt style={s.note} numberOfLines={1}>
                        {item.note}
                      </Txt>
                    ) : null}
                  </View>
                  <RatingPill value={item.rating} />
                  <IconBtn icon="✏️" label={`Edit ${item.name}`} onPress={() => onEditFood(item)} />
                  <IconBtn icon="🗑️" label={`Delete ${item.name}`} onPress={() => confirmDelete(item)} />
                </Bubbly>
              )}
            />
            <Fab onPress={onAddFood} label="Add food" />
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...softShadow },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 },
  name: { fontSize: 26, textAlign: 'center', marginTop: 10 },
  meta: { color: colors.textDim, marginTop: 2 },
  avgRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 110, gap: 8 },
  dateHeader: { color: colors.textDim, fontSize: 13, marginTop: 14, marginBottom: 2, marginLeft: 4 },
  row: { ...card, flexDirection: 'row', alignItems: 'center', padding: 10, paddingRight: 10 },
  rowMain: { flex: 1, marginHorizontal: 12 },
  food: { fontSize: 16 },
  note: { color: colors.textDim, fontSize: 13, marginTop: 1 },
});
