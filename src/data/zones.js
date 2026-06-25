// Zone definitions for wild encounters.
// Each zone has a pool of Brainrod IDs with weighted rarities.

export const ZONES = [
  {
    id: 'rustling-route',
    name: 'Rustling Route',
    description: 'A misty path north of Braincrest Town. Strange energies pulse through the tall grass.',
    tileType: 3, // wild grass tile
    direction: 'north',
    encounterPool: [
      { id: 1, weight: 30 }, // Fizzpup common
      { id: 2, weight: 28 }, // Bubblog common
      { id: 3, weight: 25 }, // Shroombit common
      { id: 4, weight: 20 }, // Zapwing common
      { id: 6, weight: 12 }, // Crystling uncommon
      { id: 9, weight: 10 }, // Frostbyte uncommon
      { id: 11, weight: 4  }, // Infernak rare
      { id: 15, weight: 1  }, // Mirrorshade epic
    ],
    rarityBreakdown: {
      common: '65%',
      uncommon: '27%',
      rare: '7%',
      epic: '1%',
    },
    cooldownMs: 24 * 60 * 60 * 1000, // 24 hours
    extraHuntCost: 5,
  },
  {
    id: 'glitch-meadow',
    name: 'Glitch Meadow',
    description: 'Corrupted terrain south of town. Digital rifts open and close at random.',
    tileType: 3,
    direction: 'south',
    encounterPool: [
      { id: 2, weight: 25 }, // Bubblog
      { id: 5, weight: 22 }, // Pebblunk
      { id: 7, weight: 18 }, // Smoghorn uncommon
      { id: 8, weight: 15 }, // Thornvine uncommon
      { id: 10, weight: 12 }, // Blazetail uncommon
      { id: 12, weight: 5  }, // Aquatide rare
      { id: 16, weight: 2  }, // Cryptclaw epic
      { id: 20, weight: 1  }, // Glitchzero legendary
    ],
    rarityBreakdown: {
      common: '55%',
      uncommon: '33%',
      rare: '9%',
      epic: '2%',
      legendary: '1%',
    },
    cooldownMs: 24 * 60 * 60 * 1000,
    extraHuntCost: 8,
  },
];

export function getZoneById(id) {
  return ZONES.find(z => z.id === id) || null;
}

export function rollEncounter(zone) {
  const pool = zone.encounterPool;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of pool) {
    r -= entry.weight;
    if (r <= 0) return entry.id;
  }
  return pool[0].id;
}

export function getHuntCooldownRemaining(zoneId) {
  const key = `brainrock_hunt_${zoneId}`;
  const last = parseInt(localStorage.getItem(key) || '0', 10);
  const zone = getZoneById(zoneId);
  if (!zone) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, zone.cooldownMs - elapsed);
}

export function markHuntUsed(zoneId) {
  localStorage.setItem(`brainrock_hunt_${zoneId}`, String(Date.now()));
}
