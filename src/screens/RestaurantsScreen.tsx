import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts } from '../theme';
import { plural, rating as fmt, shortDate } from '../format';
import type { RestaurantSummary } from '../stats';
import { Bubbly, card, EmojiBubble, Empty, Fab, IconBtn, RatingPill, Txt } from '../ui';

type Props = {
  summaries: RestaurantSummary[];
  onAdd: () => void;
  onOpen: (s: RestaurantSummary) => void;
  onEdit: (s: RestaurantSummary) => void;
  onDelete: (s: RestaurantSummary) => void;
};

export function confirmDeleteRestaurant(s: RestaurantSummary, onDelete: () => void) {
  Alert.alert(
    `Delete ${s.restaurant.name}?`,
    s.dishes ? `This also deletes its ${plural(s.dishes, 'rated dish', 'rated dishes')}.` : undefined,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ],
  );
}

export default function RestaurantsScreen({ summaries, onAdd, onOpen, onEdit, onDelete }: Props) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? summaries.filter((s) => s.restaurant.name.toLowerCase().includes(t)) : summaries;
  }, [q, summaries]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={shown}
        keyExtractor={(s) => String(s.restaurant.id)}
        contentContainerStyle={st.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          summaries.length > 4 ? (
            <TextInput value={q} onChangeText={setQ} placeholder="🔍  Search restaurants" placeholderTextColor={colors.textDim} style={st.search} selectionColor={colors.accent} />
          ) : null
        }
        ListEmptyComponent={
          q ? (
            <Empty emoji="🧐" title="No matches" />
          ) : (
            <Empty emoji="🍜" title="Where did you eat?" hint={'Tap ＋ Add restaurant, then rate\neverything you ordered.'} />
          )
        }
        renderItem={({ item }) => (
          <Bubbly onPress={() => onOpen(item)} style={st.row}>
            <EmojiBubble emoji={item.restaurant.emoji} size={50} bg={colors.accentSoft} />
            <View style={st.main}>
              <Txt w="semibold" style={st.name} numberOfLines={1}>
                {item.restaurant.name}
              </Txt>
              <Txt style={st.meta} numberOfLines={1}>
                {item.dishes ? `${plural(item.dishes, 'dish', 'dishes')} · ${shortDate(item.lastDate)}` : 'No foods yet — tap to add'}
              </Txt>
              {item.best && (
                <Txt style={st.best} numberOfLines={1}>
                  ⭐ {item.best.name} {fmt(item.best.rating)}
                </Txt>
              )}
            </View>
            {item.avg !== null && <RatingPill value={item.avg} />}
            <View style={st.actions}>
              <IconBtn icon="✏️" label={`Edit ${item.restaurant.name}`} onPress={() => onEdit(item)} />
              <IconBtn icon="🗑️" label={`Delete ${item.restaurant.name}`} onPress={() => confirmDeleteRestaurant(item, () => onDelete(item))} />
            </View>
          </Bubbly>
        )}
      />
      <Fab onPress={onAdd} label="Add restaurant" />
    </View>
  );
}

const st = StyleSheet.create({
  list: { padding: 16, paddingBottom: 110, gap: 10 },
  search: { backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, fontFamily: fonts.regular, fontSize: 15, color: colors.text, marginBottom: 4 },
  row: { ...card, flexDirection: 'row', alignItems: 'center', padding: 12 },
  main: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 17 },
  meta: { color: colors.textDim, fontSize: 13, marginTop: 1 },
  best: { color: colors.text, fontSize: 13, marginTop: 2 },
  actions: { marginLeft: 2, gap: 6 },
});
