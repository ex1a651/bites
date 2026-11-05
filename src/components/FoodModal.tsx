import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../theme';
import { DEFAULT_FOOD_EMOJI, FOOD_EMOJIS, guessFoodEmoji } from '../emoji';
import { fromKey, longDate, toKey } from '../format';
import type { Food, FoodInput } from '../db';
import { Button, Field, Label, Sheet, Txt } from '../ui';
import EmojiRow from './EmojiRow';
import RatingPicker from './RatingPicker';

type Props = {
  visible: boolean;
  restaurantName: string;
  food: Food | null; // null = add
  /** Date to start on when adding (last date used, so a whole meal shares one date). */
  defaultDate: string;
  onCancel: () => void;
  /** keepOpen = "Save & add another" */
  onSave: (f: FoodInput, keepOpen: boolean) => Promise<void>;
};

export default function FoodModal({ visible, restaurantName, food, defaultDate, onCancel, onSave }: Props) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [emoji, setEmoji] = useState(DEFAULT_FOOD_EMOJI);
  const [emojiTouched, setEmojiTouched] = useState(false);
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [added, setAdded] = useState<string[]>([]); // names added in this session
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    setName(food?.name ?? '');
    setRating(food?.rating ?? null);
    setEmoji(food?.emoji ?? DEFAULT_FOOD_EMOJI);
    setEmojiTouched(!!food);
    setDate(food?.eaten_on ?? defaultDate);
    setNote(food?.note ?? '');
    setAdded([]);
    setShowDate(false);
    // Only reset when the popup opens / target changes — not when defaultDate
    // updates after "Save & add more" (that would wipe the "Added …" list).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, food]);

  const onName = (t: string) => {
    setName(t);
    if (!emojiTouched) setEmoji(guessFoodEmoji(t));
  };

  const onPickDate = (e: DateTimePickerEvent, d?: Date) => {
    setShowDate(Platform.OS === 'ios');
    if (e.type === 'set' && d) setDate(toKey(d));
  };

  const trimmed = name.trim();
  const valid = !!trimmed && rating !== null;

  const save = async (keepOpen: boolean) => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onSave({ name: trimmed, rating: rating!, emoji, eaten_on: date, note: note.trim() }, keepOpen);
      if (keepOpen) {
        // Reset for the next dish, keep the date.
        setAdded((a) => [...a, `${emoji} ${trimmed}`]);
        setName('');
        setRating(null);
        setEmoji(DEFAULT_FOOD_EMOJI);
        setEmojiTouched(false);
        setNote('');
        nameRef.current?.focus();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      title={food ? 'Edit food' : `Add food`}
      footer={
        <>
          <Button title={added.length ? 'Done' : 'Cancel'} kind="ghost" onPress={onCancel} />
          {!food && <Button title="Save & add more" kind="soft" onPress={() => save(true)} disabled={!valid || busy} />}
          <Button title="Save" onPress={() => save(false)} disabled={!valid || busy} />
        </>
      }
    >
      <Txt style={s.sub} numberOfLines={1}>
        at {restaurantName}
      </Txt>
      {added.length > 0 && (
        <View style={s.added}>
          <Txt w="medium" style={s.addedText} numberOfLines={2}>
            ✓ Added {added.join(' · ')}
          </Txt>
        </View>
      )}
      <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Field label="Food" value={name} onChangeText={onName} placeholder="e.g. Tonkotsu ramen" autoFocus={!food} maxLength={60} inputRef={nameRef} />

        <Label>Icon</Label>
        <EmojiRow
          options={FOOD_EMOJIS}
          value={emoji}
          onChange={(e) => {
            setEmoji(e);
            setEmojiTouched(true);
          }}
        />

        <Label>Rating</Label>
        <RatingPicker value={rating} onChange={setRating} />

        <Label>Date eaten</Label>
        <Pressable onPress={() => setShowDate(true)} style={s.dateChip}>
          <Txt w="medium">📅 {longDate(date)}</Txt>
        </Pressable>
        {showDate && <DateTimePicker value={fromKey(date)} mode="date" maximumDate={new Date()} onChange={onPickDate} />}

        <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="extra spicy, share next time…" maxLength={200} />
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  sub: { color: colors.textDim, marginBottom: 4 },
  added: { backgroundColor: colors.mint + '40', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6 },
  addedText: { color: colors.text, fontSize: 13 },
  dateChip: { alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
});
