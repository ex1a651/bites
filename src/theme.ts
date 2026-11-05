/** Light, date-night pastel palette: cream paper, strawberry pink, peach, butter, mint, lavender. */
export const colors = {
  bg: '#FFF7F2', // cream
  surface: '#FFFFFF',
  surfaceAlt: '#FFF0EA', // blush
  border: '#F7DDD6',
  text: '#4A2E3A', // plum ink
  textDim: '#A88C97',
  accent: '#FF7A9A', // strawberry
  accentSoft: '#FFE1E8',
  peach: '#FFB38A',
  butter: '#FFD86B',
  mint: '#8FD9B6',
  lavender: '#B9A6F2',
  danger: '#F2617A',
  shadow: '#E8B4B8',
};

export const radius = 20;
export const radiusSm = 14;

/** Fredoka (rounded, bubbly) — loaded in App.tsx. Android needs one family per weight. */
export const fonts = {
  regular: 'Fredoka-Regular',
  medium: 'Fredoka-Medium',
  semibold: 'Fredoka-SemiBold',
  bold: 'Fredoka-Bold',
};

/** Soft pink drop shadow for bubbly cards. */
export const softShadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

/** Rating → color: lavender (meh) → butter → peach → strawberry (amazing). */
export function ratingColor(r: number): string {
  if (r >= 9) return colors.accent;
  if (r >= 7.5) return colors.peach;
  if (r >= 6) return colors.butter;
  if (r >= 4) return colors.mint;
  return colors.lavender;
}

/** Same hue, light tint for pill backgrounds. */
export function ratingTint(r: number): string {
  return ratingColor(r) + '33';
}
