/**
 * Cute food icons. Food emoji is guessed from the dish name as you type
 * (you can still tap another one). Order matters: specific dishes first,
 * then broad ingredients, so "chicken burger" → 🍔 and "milk tea" → 🧋.
 */
const FOOD_RULES: [string, string[]][] = [
  ['🧋', ['milk tea', 'milktea', 'boba', 'bubble tea', 'taro', 'matcha latte']],
  ['🍦', ['ice cream', 'soft serve', 'sundae', 'gelato', 'sorbetes', 'mcflurry']],
  ['🍧', ['halo-halo', 'halo halo', 'halohalo', 'shaved ice', 'bingsu', 'kakigori', 'mais con yelo']],
  ['🍔', ['burger', 'yumburger']],
  ['🍕', ['pizza']],
  ['🌭', ['hotdog', 'hot dog', 'sausage', 'longganisa', 'corndog']],
  ['🥪', ['sandwich', 'sub ', 'panini', 'clubhouse', 'banh mi']],
  ['🌮', ['taco', 'nacho', 'quesadilla']],
  ['🌯', ['burrito', 'shawarma', 'wrap', 'lumpia', 'kebab', 'gyro']],
  ['🍣', ['sushi', 'sashimi', 'maki', 'nigiri', 'salmon', 'tuna']],
  ['🍱', ['bento', 'donburi', 'katsudon', 'gyudon', 'teishoku']],
  ['🍜', ['ramen', 'noodle', 'pancit', 'pho', 'udon', 'soba', 'mami', 'laksa', 'lomi', 'batchoy', 'canton', 'bihon', 'jjampong']],
  ['🍝', ['pasta', 'spaghetti', 'carbonara', 'lasagna', 'lasagne', 'fettuccine', 'penne', 'alfredo', 'mac and cheese', 'aglio']],
  ['🥟', ['dumpling', 'gyoza', 'siomai', 'shumai', 'xiao long', 'xlb', 'mandu', 'wonton', 'dimsum', 'dim sum', 'siopao', 'bao']],
  ['🍛', ['curry', 'kare-kare', 'kare kare', 'biryani', 'masala', 'tikka']],
  ['🍲', ['sinigang', 'bulalo', 'tinola', 'soup', 'hotpot', 'hot pot', 'stew', 'nilaga', 'shabu', 'jjigae', 'chowder', 'pochero']],
  ['🍳', ['silog', 'sisig', 'egg', 'omelet', 'omelette', 'breakfast', 'benedict', 'tortang']],
  ['🥞', ['pancake', 'waffle', 'hotcake', 'french toast', 'crepe']],
  ['🍚', ['rice', 'chaofan', 'fried rice', 'bibimbap', 'risotto', 'paella', 'arroz', 'onigiri', 'lugaw', 'arroz caldo']],
  ['🍤', ['shrimp', 'prawn', 'tempura', 'hipon', 'camaron']],
  ['🦀', ['crab', 'lobster', 'alimango']],
  ['🦑', ['squid', 'calamari', 'octopus', 'takoyaki', 'pusit']],
  ['🐟', ['fish', 'bangus', 'tilapia', 'cod', 'dory', 'tinapa', 'daing']],
  ['🍗', ['chicken', 'wings', 'adobo', 'inasal', 'karaage', 'chickenjoy', 'fried chick']],
  ['🍖', ['lechon', 'ribs', 'pork', 'liempo', 'crispy pata', 'bbq', 'barbecue', 'tocino', 'humba', 'belly']],
  ['🥓', ['bacon']],
  ['🥩', ['steak', 'beef', 'wagyu', 'tapa', 'brisket', 'bistek', 'galbi', 'samgyup']],
  ['🍢', ['skewer', 'isaw', 'yakitori', 'kwek', 'fishball', 'kikiam', 'satay']],
  ['🍟', ['fries', 'chips', 'potato', 'hashbrown', 'hash brown']],
  ['🥗', ['salad', 'poke', 'veggie', 'vegetable', 'kangkong', 'pinakbet', 'laing', 'chopsuey', 'chop suey']],
  ['🥐', ['croissant', 'ensaymada', 'pastry', 'danish']],
  ['🍞', ['bread', 'toast', 'pandesal', 'bun', 'brioche', 'garlic bread']],
  ['🍩', ['donut', 'doughnut', 'churro']],
  ['🍪', ['cookie', 'brownie', 'polvoron']],
  ['🍰', ['cake', 'cheesecake', 'tiramisu', 'leche flan', 'flan', 'pie', 'tart', 'mochi', 'ube', 'bibingka', 'puto', 'kakanin', 'dessert']],
  ['🍫', ['chocolate', 'choco']],
  ['☕', ['coffee', 'latte', 'espresso', 'americano', 'cappuccino', 'mocha', 'macchiato', 'cold brew', 'kapeng']],
  ['🍵', ['tea', 'matcha']],
  ['🥤', ['soda', 'coke', 'shake', 'smoothie', 'juice', 'lemonade', 'frappe', 'float']],
  ['🍺', ['beer', 'san mig', ' ale', 'lager']],
  ['🍷', ['wine', 'sangria']],
  ['🍸', ['cocktail', 'margarita', 'mojito', 'martini']],
  ['🧀', ['cheese', 'fondue']],
  ['🍓', ['strawberry', 'berry', 'fruit', 'mango', 'buko']],
];

export const DEFAULT_FOOD_EMOJI = '🍽️';

export function guessFoodEmoji(name: string): string {
  const n = ` ${name.toLowerCase().trim()} `;
  if (!n.trim()) return DEFAULT_FOOD_EMOJI;
  for (const [emoji, words] of FOOD_RULES) {
    if (words.some((w) => n.includes(w))) return emoji;
  }
  return DEFAULT_FOOD_EMOJI;
}

/** Picker grids. */
export const FOOD_EMOJIS = [
  '🍽️', '🍜', '🍣', '🍔', '🍕', '🍗', '🍖', '🥩', '🍚', '🍛', '🍲', '🍳', '🥟', '🍤', '🐟', '🦀',
  '🍝', '🌮', '🌯', '🥪', '🍟', '🥗', '🍢', '🍱', '🥞', '🍞', '🥐', '🍰', '🍩', '🍪', '🍦', '🍧',
  '🍫', '🍓', '🧋', '☕', '🍵', '🥤', '🍺', '🍷',
];

export const RESTAURANT_EMOJIS = [
  '🍽️', '🏠', '🏮', '🍜', '🍣', '🍕', '🍔', '🍗', '🥢', '🍱', '☕', '🧁', '🍰', '🍦', '🌮', '🥘',
  '🍷', '🌸', '💖', '⭐', '🌙', '🎀',
];

/** Rating → little face. */
export function ratingFace(r: number): string {
  if (r >= 10) return '🤩';
  if (r >= 9) return '😍';
  if (r >= 8) return '😋';
  if (r >= 6.5) return '🙂';
  if (r >= 5) return '😐';
  if (r >= 3) return '😕';
  return '😖';
}
