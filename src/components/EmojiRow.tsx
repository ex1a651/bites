import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

/** Horizontal strip of emoji choices; selected one gets a pink ring. */
export default function EmojiRow({ options, value, onChange }: { options: string[]; value: string; onChange: (e: string) => void }) {
  // Make sure the current value is visible even if it's not in the preset list.
  const list = options.includes(value) ? options : [value, ...options];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} keyboardShouldPersistTaps="handled">
      {list.map((e) => (
        <Pressable key={e} onPress={() => onChange(e)} style={[s.item, e === value && s.itemOn]} accessibilityLabel={`Icon ${e}`}>
          <Text style={s.emoji}>{e}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 6, paddingVertical: 2 },
  item: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: 'transparent' },
  itemOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  emoji: { fontSize: 22 },
});
