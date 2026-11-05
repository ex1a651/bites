import { Pressable, StyleSheet, View } from 'react-native';
import { colors, ratingColor } from '../theme';
import { ratingFace } from '../emoji';
import { rating as fmt } from '../format';
import { Txt } from '../ui';

/**
 * Tap a bubble 1–10, then optionally "+½".
 * `value` is null until the user picks, so nothing gets an accidental default score.
 */
export default function RatingPicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const whole = value === null ? null : Math.floor(value);
  const half = value !== null && value % 1 >= 0.5;

  const pick = (n: number) => onChange(half && n < 10 ? n + 0.5 : n);
  const toggleHalf = () => {
    if (whole === null || whole >= 10) return;
    onChange(half ? whole : whole + 0.5);
  };

  return (
    <View>
      <View style={s.display}>
        <Txt style={s.face}>{value === null ? '🤔' : ratingFace(value)}</Txt>
        <Txt w="bold" style={[s.big, value !== null && { color: colors.text }]}>
          {value === null ? '–' : fmt(value)}
          <Txt w="medium" style={s.outOf}>
            {' '}
            / 10
          </Txt>
        </Txt>
      </View>
      {[0, 1].map((row) => (
        <View key={row} style={s.row}>
          {[1, 2, 3, 4, 5].map((i) => {
            const n = row * 5 + i;
            const on = whole === n;
            return (
              <Pressable
                key={n}
                onPress={() => pick(n)}
                accessibilityLabel={`Rate ${n}`}
                style={({ pressed }) => [s.bubble, on && { backgroundColor: ratingColor(n), borderColor: ratingColor(n) }, pressed && { transform: [{ scale: 0.9 }] }]}
              >
                <Txt w="semibold" style={[s.num, on && { color: '#fff' }]}>
                  {n}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      ))}
      <Pressable onPress={toggleHalf} disabled={whole === null || whole >= 10} style={[s.half, half && s.halfOn, (whole === null || whole >= 10) && { opacity: 0.35 }]}>
        <Txt w="semibold" style={[s.halfText, half && { color: '#fff' }]}>
          +½
        </Txt>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  display: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  face: { fontSize: 34 },
  big: { fontSize: 34, color: colors.textDim },
  outOf: { fontSize: 16, color: colors.textDim },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  bubble: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 18 },
  half: { alignSelf: 'center', marginTop: 10, paddingHorizontal: 18, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surfaceAlt },
  halfOn: { backgroundColor: colors.lavender },
  halfText: { fontSize: 15, color: colors.text },
});
