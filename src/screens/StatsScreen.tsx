import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, ratingColor } from '../theme';
import { plural, rating as fmt, shortDate } from '../format';
import type { Food, Restaurant } from '../db';
import { computeStats } from '../stats';
import { Bubbly, card, EmojiBubble, Empty, RatingPill, Txt } from '../ui';

type Props = {
  restaurants: Restaurant[];
  foods: Food[];
  onOpenRestaurant: (id: number) => void;
};

const MEDALS = ['🥇', '🥈', '🥉'];
const MIN_OPTIONS = [1, 2, 3, 5];

export default function StatsScreen({ restaurants, foods, onOpenRestaurant }: Props) {
  const [minDishes, setMinDishes] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const st = useMemo(() => computeStats(restaurants, foods, minDishes), [restaurants, foods, minDishes]);

  if (!foods.length) {
    return <Empty emoji="📊" title="No stats yet" hint="Rate a few dishes and your rankings will show up here." />;
  }

  const best = showAll ? st.bestRestaurants : st.bestRestaurants.slice(0, 5);
  const maxBucket = Math.max(1, ...st.distribution);
  const f = st.facts;

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Summary tiles */}
      <View style={s.tiles}>
        <Tile emoji="🍽️" value={String(st.totals.restaurants)} label="restaurants" bg={colors.accentSoft} />
        <Tile emoji="😋" value={String(st.totals.dishes)} label="dishes rated" bg={colors.peach + '33'} />
        <Tile emoji="⭐" value={st.totals.avg === null ? '–' : fmt(st.totals.avg)} label="avg rating" bg={colors.butter + '40'} />
        <Tile emoji="🤩" value={String(st.totals.perfectTens)} label="perfect 10s" bg={colors.lavender + '33'} />
      </View>

      {/* Best restaurants */}
      <View style={s.card}>
        <Txt w="bold" style={s.h}>
          🏆 Best restaurants
        </Txt>
        <View style={s.chips}>
          <Txt style={s.chipLabel}>min dishes</Txt>
          {MIN_OPTIONS.map((n) => (
            <Pressable key={n} onPress={() => setMinDishes(n)} style={[s.chip, minDishes === n && s.chipOn]}>
              <Txt w="semibold" style={[s.chipText, minDishes === n && { color: '#fff' }]}>
                {n}+
              </Txt>
            </Pressable>
          ))}
        </View>
        {best.length === 0 && <Txt style={s.dim}>No restaurant has {minDishes}+ rated dishes yet.</Txt>}
        {best.map((r, i) => (
          <Bubbly key={r.restaurant.id} onPress={() => onOpenRestaurant(r.restaurant.id)} style={s.rankRow}>
            <Txt w="bold" style={s.rank}>
              {MEDALS[i] ?? `${i + 1}`}
            </Txt>
            <EmojiBubble emoji={r.restaurant.emoji} size={36} />
            <View style={s.rankMain}>
              <View style={s.rankTop}>
                <Txt w="medium" style={s.rankName} numberOfLines={1}>
                  {r.restaurant.name}
                </Txt>
                <Txt w="bold" style={s.rankAvg}>
                  {fmt(r.avg!)}
                </Txt>
              </View>
              <View style={s.track}>
                <View style={[s.fill, { width: `${(r.avg! / 10) * 100}%` as const, backgroundColor: ratingColor(r.avg!) }]} />
              </View>
              <Txt style={s.small}>
                {plural(r.dishes, 'dish', 'dishes')} · {plural(r.visits, 'visit')}
              </Txt>
            </View>
          </Bubbly>
        ))}
        {st.bestRestaurants.length > 5 && (
          <Pressable onPress={() => setShowAll((v) => !v)} style={s.more}>
            <Txt w="semibold" style={{ color: colors.accent }}>
              {showAll ? 'Show less' : `Show all ${st.bestRestaurants.length}`}
            </Txt>
          </Pressable>
        )}
      </View>

      {/* Top dishes */}
      <View style={s.card}>
        <Txt w="bold" style={s.h}>
          ⭐ Top dishes
        </Txt>
        {st.topFoods.map((d, i) => (
          <Bubbly key={d.id} onPress={() => onOpenRestaurant(d.restaurant_id)} style={s.dishRow}>
            <Txt w="bold" style={s.rank}>
              {MEDALS[i] ?? `${i + 1}`}
            </Txt>
            <EmojiBubble emoji={d.emoji} size={36} />
            <View style={s.rankMain}>
              <Txt w="medium" numberOfLines={1}>
                {d.name}
              </Txt>
              <Txt style={s.small} numberOfLines={1}>
                {d.restaurantName} · {shortDate(d.eaten_on)}
              </Txt>
            </View>
            <RatingPill value={d.rating} />
          </Bubbly>
        ))}
      </View>

      {/* Distribution */}
      <View style={s.card}>
        <Txt w="bold" style={s.h}>
          🎀 How you rate
        </Txt>
        <View style={s.bars}>
          {st.distribution.map((count, i) => (
            <View key={i} style={s.barCol}>
              <Txt style={s.barCount}>{count || ''}</Txt>
              <View style={[s.bar, { height: 6 + (count / maxBucket) * 90, backgroundColor: count ? ratingColor(i + 1) : colors.surfaceAlt }]} />
              <Txt w="medium" style={s.barLabel}>
                {i + 1}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      {/* Fun facts */}
      <Txt w="bold" style={[s.h, { marginLeft: 4, marginTop: 4 }]}>
        ✨ Fun facts
      </Txt>
      <View style={s.facts}>
        {f.mostVisited && (
          <Fact emoji="🏠" title="Most visited" value={f.mostVisited.restaurant.name} sub={plural(f.mostVisited.visits, 'visit')} bg={colors.accentSoft} />
        )}
        {f.favKind && (
          <Fact emoji={f.favKind.emoji} title="Favorite kind" value={`avg ${fmt(f.favKind.avg)}`} sub={`across ${plural(f.favKind.count, 'dish', 'dishes')}`} bg={colors.butter + '40'} />
        )}
        {f.bestDay && (
          <Fact emoji="💕" title="Best food day" value={shortDate(f.bestDay.date)} sub={`avg ${fmt(f.bestDay.avg)} · ${plural(f.bestDay.count, 'dish', 'dishes')}`} bg={colors.peach + '33'} />
        )}
        {f.mostConsistent && (
          <Fact emoji="🎯" title="Most consistent" value={f.mostConsistent.restaurant.name} sub={`always ~${fmt(f.mostConsistent.avg!)}`} bg={colors.mint + '40'} />
        )}
        <Fact
          emoji="🗓️"
          title="This month"
          value={plural(f.thisMonth.dishes, 'dish', 'dishes')}
          sub={f.thisMonth.avg === null ? 'go eat something!' : `avg ${fmt(f.thisMonth.avg)}`}
          bg={colors.lavender + '33'}
        />
        {f.letdown && foods.length > 1 && (
          <Fact emoji="🥲" title="Biggest letdown" value={f.letdown.name} sub={`${fmt(f.letdown.rating)} at ${f.letdown.restaurantName}`} bg={colors.surfaceAlt} />
        )}
      </View>
    </ScrollView>
  );
}

function Tile({ emoji, value, label, bg }: { emoji: string; value: string; label: string; bg: string }) {
  return (
    <View style={[s.tile, { backgroundColor: bg }]}>
      <Txt style={{ fontSize: 22 }}>{emoji}</Txt>
      <Txt w="bold" style={s.tileValue}>
        {value}
      </Txt>
      <Txt style={s.small}>{label}</Txt>
    </View>
  );
}

function Fact({ emoji, title, value, sub, bg }: { emoji: string; title: string; value: string; sub: string; bg: string }) {
  return (
    <View style={[s.fact, { backgroundColor: bg }]}>
      <Txt style={{ fontSize: 26 }}>{emoji}</Txt>
      <Txt w="medium" style={s.small}>
        {title}
      </Txt>
      <Txt w="bold" style={s.factValue} numberOfLines={2}>
        {value}
      </Txt>
      <Txt style={s.small} numberOfLines={2}>
        {sub}
      </Txt>
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 14 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexGrow: 1, flexBasis: '45%', borderRadius: 22, padding: 14 },
  tileValue: { fontSize: 28, marginTop: 4 },
  card: { ...card, padding: 16 },
  h: { fontSize: 18, marginBottom: 6 },
  dim: { color: colors.textDim, marginTop: 6 },
  small: { color: colors.textDim, fontSize: 12 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  chipLabel: { color: colors.textDim, fontSize: 12, marginRight: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surfaceAlt },
  chipOn: { backgroundColor: colors.accent },
  chipText: { fontSize: 13 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  dishRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  rank: { width: 26, textAlign: 'center', fontSize: 16, color: colors.textDim },
  rankMain: { flex: 1 },
  rankTop: { flexDirection: 'row', alignItems: 'baseline' },
  rankName: { flex: 1, fontSize: 15 },
  rankAvg: { fontSize: 16 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceAlt, marginVertical: 4, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  more: { alignSelf: 'center', marginTop: 6, padding: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  barCol: { alignItems: 'center', flex: 1 },
  barCount: { fontSize: 11, color: colors.textDim, marginBottom: 2 },
  bar: { width: 18, borderRadius: 9 },
  barLabel: { fontSize: 12, marginTop: 4, color: colors.textDim },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: { flexGrow: 1, flexBasis: '45%', borderRadius: 22, padding: 14, gap: 2 },
  factValue: { fontSize: 16 },
});
