// 20 original Brainrod creatures — no Pokémon names or assets used.
// color = primary canvas draw color, color2 = secondary/accent

export const BRAINRODS = [
  // ─── COMMON ────────────────────────────────────────────────────────────────
  {
    id: 1, name: 'Fizzpup',   type: 'fire',    rarity: 'common',
    color: '#FF6B35', color2: '#FFD166',
    desc: 'A tiny pup made of flickering flame. Its tail wags so fast it sparks.',
    hp: 30, atk: 8,
  },
  {
    id: 2, name: 'Bubblog',   type: 'water',   rarity: 'common',
    color: '#00B4D8', color2: '#90E0EF',
    desc: 'A wobbly water blob that bounces everywhere. Leaves puddles on your floor.',
    hp: 28, atk: 7,
  },
  {
    id: 3, name: 'Shroombit', type: 'earth',   rarity: 'common',
    color: '#8B5E3C', color2: '#C5E8A0',
    desc: 'Grows overnight. By morning it\'s already forgotten where it was going.',
    hp: 35, atk: 6,
  },
  {
    id: 4, name: 'Zapwing',   type: 'wind',    rarity: 'common',
    color: '#FFD60A', color2: '#FFFFFF',
    desc: 'A sparrow with a lightning-bolt crest. Static shocks everything nearby.',
    hp: 25, atk: 10,
  },
  {
    id: 5, name: 'Pebblunk',  type: 'earth',   rarity: 'common',
    color: '#9E9E9E', color2: '#607D8B',
    desc: 'Rolls into a perfect sphere when frightened. Very hard to unroll.',
    hp: 40, atk: 5,
  },
  // ─── UNCOMMON ──────────────────────────────────────────────────────────────
  {
    id: 6, name: 'Crystling', type: 'crystal', rarity: 'uncommon',
    color: '#00F5D4', color2: '#CDEEFF',
    desc: 'A lizard sheathed in grown crystal. Its scales refract light into rainbows.',
    hp: 38, atk: 12,
  },
  {
    id: 7, name: 'Smoghorn',  type: 'shadow',  rarity: 'uncommon',
    color: '#546E7A', color2: '#37474F',
    desc: 'Exhales purple smoke when stressed. Navigates entirely by smell.',
    hp: 42, atk: 11,
  },
  {
    id: 8, name: 'Thornvine', type: 'earth',   rarity: 'uncommon',
    color: '#2E7D32', color2: '#A5D6A7',
    desc: 'A serpent made of living bramble. Its thorns grow back within seconds.',
    hp: 36, atk: 13,
  },
  {
    id: 9, name: 'Frostbyte', type: 'water',   rarity: 'uncommon',
    color: '#90CAF9', color2: '#E3F2FD',
    desc: 'An ice-cold fox. Leaves frosty paw prints. Loves cold storage devices.',
    hp: 33, atk: 14,
  },
  {
    id: 10, name: 'Blazetail', type: 'fire',   rarity: 'uncommon',
    color: '#FF5252', color2: '#FF8A65',
    desc: 'A fox-like creature whose tail is an eternal torch. It never burns out.',
    hp: 30, atk: 16,
  },
  // ─── RARE ──────────────────────────────────────────────────────────────────
  {
    id: 11, name: 'Infernak',  type: 'fire',   rarity: 'rare',
    color: '#B71C1C', color2: '#FF6D00',
    desc: 'An ancient fire drake that once scorched entire circuits. Mostly calm now.',
    hp: 55, atk: 22,
  },
  {
    id: 12, name: 'Aquatide',  type: 'water',  rarity: 'rare',
    color: '#0D47A1', color2: '#40C4FF',
    desc: 'A sea-serpent that surfaced from a corrupted data ocean. Still dripping.',
    hp: 60, atk: 20,
  },
  {
    id: 13, name: 'Terravore', type: 'earth',  rarity: 'rare',
    color: '#4E342E', color2: '#A1887F',
    desc: 'A golem assembled from crushed hard drives and compressed soil.',
    hp: 70, atk: 18,
  },
  {
    id: 14, name: 'Voltspike', type: 'wind',   rarity: 'rare',
    color: '#F9A825', color2: '#76FF03',
    desc: 'A boar whose tusks conduct megawatts. Do not headbutt a server rack.',
    hp: 50, atk: 25,
  },
  // ─── EPIC ──────────────────────────────────────────────────────────────────
  {
    id: 15, name: 'Mirrorshade', type: 'glitch', rarity: 'epic',
    color: '#CE93D8', color2: '#00E5FF',
    desc: 'A cat that exists between frames. Its reflections don\'t match its pose.',
    hp: 75, atk: 30,
  },
  {
    id: 16, name: 'Cryptclaw',  type: 'shadow',  rarity: 'epic',
    color: '#4A148C', color2: '#7B1FA2',
    desc: 'A wolf spawned from corrupted blockchain data. Leaves no hash trail.',
    hp: 80, atk: 28,
  },
  {
    id: 17, name: 'Neuroflux',  type: 'brain',   rarity: 'epic',
    color: '#F06292', color2: '#E040FB',
    desc: 'A pulsing brain entity. It predicts your next move before you do.',
    hp: 70, atk: 35,
  },
  {
    id: 18, name: 'Voidmantle', type: 'shadow',  rarity: 'epic',
    color: '#212121', color2: '#616161',
    desc: 'Cloaked in absolute darkness. Scientists argue whether it\'s even there.',
    hp: 90, atk: 26,
  },
  // ─── LEGENDARY ─────────────────────────────────────────────────────────────
  {
    id: 19, name: 'Brainicus',  type: 'brain',   rarity: 'legendary',
    color: '#FFD700', color2: '#FF6B00',
    desc: 'The primordial brain. Said to have dreamed reality into existence.',
    hp: 120, atk: 50,
  },
  {
    id: 20, name: 'Glitchzero', type: 'glitch',  rarity: 'legendary',
    color: '#00FFFF', color2: '#FF00FF',
    desc: 'Error code 0x00000000. The first and last glitch. Cannot be explained.',
    hp: 110, atk: 55,
  },
];

export const RARITY_COLORS = {
  common:    '#9E9E9E',
  uncommon:  '#4CAF50',
  rare:      '#2196F3',
  epic:      '#9C27B0',
  legendary: '#FF9800',
};

export function getBrainrodById(id) {
  return BRAINRODS.find(b => b.id === id) || null;
}
