import { ReactNode, RefObject } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radius, radiusSm, ratingColor, ratingTint, softShadow } from './theme';
import { rating as fmtRating } from './format';

type Weight = keyof typeof fonts;

/** Text in Fredoka. Use `w` instead of fontWeight (Android needs a family per weight). */
export function Txt({ w = 'regular', style, ...props }: TextProps & { w?: Weight }) {
  return <Text {...props} style={[{ fontFamily: fonts[w], color: colors.text, fontSize: 15 }, style]} />;
}

/** Pressable that squishes a little when tapped. */
export function Bubbly({
  onPress,
  style,
  children,
  disabled,
  label,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }, disabled && { opacity: 0.4 }]}
    >
      {children}
    </Pressable>
  );
}

/** Floating pill button, bottom-right. */
export function Fab({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Bubbly onPress={onPress} style={s.fab} label={label}>
      <Txt w="semibold" style={s.fabText}>
        ＋ {label}
      </Txt>
    </Bubbly>
  );
}

/** Small round icon button for edit / delete on the side of list items. */
export function IconBtn({ icon, onPress, label, tint }: { icon: string; onPress: () => void; label: string; tint?: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={label}
      style={({ pressed }) => [s.icon, { backgroundColor: tint ?? colors.surfaceAlt }, pressed && { transform: [{ scale: 0.9 }] }]}
    >
      <Text style={s.iconText}>{icon}</Text>
    </Pressable>
  );
}

type BtnKind = 'primary' | 'soft' | 'ghost' | 'danger';
export function Button({ title, onPress, kind = 'primary', disabled, style }: { title: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Bubbly onPress={onPress} disabled={disabled} style={[s.btn, kind === 'primary' && s.btnPrimary, kind === 'soft' && s.btnSoft, style]}>
      <Txt
        w="semibold"
        style={[
          s.btnText,
          kind === 'soft' && { color: colors.accent },
          kind === 'ghost' && { color: colors.textDim },
          kind === 'danger' && { color: colors.danger },
        ]}
      >
        {title}
      </Txt>
    </Bubbly>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Txt w="medium" style={s.label}>
      {children}
    </Txt>
  );
}

export function Field({ label, style, inputRef, ...props }: TextInputProps & { label: string; inputRef?: RefObject<TextInput | null> }) {
  return (
    <View>
      <Label>{label}</Label>
      <TextInput ref={inputRef} placeholderTextColor={colors.textDim} selectionColor={colors.accent} style={[s.input, style]} {...props} />
    </View>
  );
}

/** Colored rating bubble, e.g. 8.5 */
export function RatingPill({ value, big }: { value: number; big?: boolean }) {
  return (
    <View style={[s.pill, big && s.pillBig, { backgroundColor: ratingTint(value), borderColor: ratingColor(value) }]}>
      <Txt w="bold" style={[s.pillText, big && { fontSize: 18 }]}>
        {fmtRating(value)}
      </Txt>
    </View>
  );
}

/** Emoji in a soft circle. */
export function EmojiBubble({ emoji, size = 44, bg = colors.surfaceAlt }: { emoji: string; size?: number; bg?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.52 }}>{emoji}</Text>
    </View>
  );
}

export function Empty({ emoji, title, hint }: { emoji: string; title: string; hint?: string }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 56 }}>{emoji}</Text>
      <Txt w="semibold" style={{ fontSize: 18, marginTop: 10 }}>
        {title}
      </Txt>
      {hint ? <Txt style={s.emptyHint}>{hint}</Txt> : null}
    </View>
  );
}

/** Centered bubbly card modal. */
export function Sheet({ visible, onClose, title, children, footer }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.backdrop} onPress={onClose}>
          <Pressable style={s.card} onPress={() => {}}>
            {title ? (
              <Txt w="bold" style={s.title}>
                {title}
              </Txt>
            ) : null}
            {children}
            {footer ? <View style={s.actions}>{footer}</View> : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius,
  ...softShadow,
} as const;

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    paddingHorizontal: 22,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
    shadowOpacity: 0.6,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 17 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  iconText: { fontSize: 15 },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.accent },
  btnSoft: { backgroundColor: colors.accentSoft },
  btnText: { color: '#fff', fontSize: 15 },
  label: { color: colors.textDim, fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radiusSm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  pill: { minWidth: 44, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1.5, alignItems: 'center' },
  pillBig: { minWidth: 58, paddingVertical: 6 },
  pillText: { fontSize: 15 },
  empty: { alignItems: 'center', marginTop: 64, paddingHorizontal: 32 },
  emptyHint: { color: colors.textDim, textAlign: 'center', marginTop: 6, lineHeight: 21 },
  backdrop: { flex: 1, backgroundColor: 'rgba(74,46,58,0.35)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 28, padding: 22, maxHeight: '90%', ...softShadow },
  title: { fontSize: 21, marginBottom: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, marginTop: 18 },
});
