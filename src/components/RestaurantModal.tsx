import { useEffect, useState } from 'react';
import { RESTAURANT_EMOJIS } from '../emoji';
import type { Restaurant, RestaurantInput } from '../db';
import { Button, Field, Label, Sheet } from '../ui';
import EmojiRow from './EmojiRow';

type Props = {
  visible: boolean;
  restaurant: Restaurant | null; // null = add
  onCancel: () => void;
  onSave: (r: RestaurantInput) => void;
};

export default function RestaurantModal({ visible, restaurant, onCancel, onSave }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(RESTAURANT_EMOJIS[0]);

  useEffect(() => {
    if (!visible) return;
    setName(restaurant?.name ?? '');
    setEmoji(restaurant?.emoji ?? RESTAURANT_EMOJIS[Math.floor(Math.random() * 12)]);
  }, [visible, restaurant]);

  const trimmed = name.trim();
  const save = () => trimmed && onSave({ name: trimmed, emoji });

  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      title={restaurant ? 'Edit restaurant' : 'New restaurant 🍽️'}
      footer={
        <>
          <Button title="Cancel" kind="ghost" onPress={onCancel} />
          <Button title={restaurant ? 'Save' : 'Add & rate foods'} onPress={save} disabled={!trimmed} />
        </>
      }
    >
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Ramen Nagi" autoFocus={!restaurant} returnKeyType="done" onSubmitEditing={save} maxLength={60} />
      <Label>Icon</Label>
      <EmojiRow options={RESTAURANT_EMOJIS} value={emoji} onChange={setEmoji} />
    </Sheet>
  );
}
