export const ZONES = [
  {
    id: 'rustling-route',
    name: 'Rustling Route',
    description: 'North of Braincrest Town. Common and uncommon Brainwods lurk in the tall grass.',
    tier: 1,
    rarityBreakdown: { common: '55%', uncommon: '35%', rare: '10%' },
    encounterPool: [
      { id: 1,  weight: 20 }, { id: 2, weight: 18 }, { id: 3, weight: 18 },
      { id: 4,  weight: 16 }, { id: 5, weight: 14 }, { id: 6, weight: 10 },
      { id: 7,  weight: 8  }, { id: 8, weight: 7  }, { id: 9, weight: 7  },
      { id: 11, weight: 2  },
    ],
    extraHuntCost: 15,
    stakeRequired: false,
  },
  {
    id: 'glitch-meadow',
    name: 'Glitch Meadow',
    description: 'Southern wilds buzzing with chaos. Stronger Brainwods and rare finds.',
    tier: 2,
    rarityBreakdown: { uncommon: '45%', rare: '40%', epic: '15%' },
    encounterPool: [
      { id: 6,  weight: 18 }, { id: 7,  weight: 16 }, { id: 8,  weight: 16 },
      { id: 9,  weight: 14 }, { id: 10, weight: 14 }, { id: 11, weight: 10 },
      { id: 12, weight: 8  }, { id: 13, weight: 6  }, { id: 14, weight: 4  },
      { id: 15, weight: 2  }, { id: 16, weight: 2  },
    ],
    extraHuntCost: 30,
    stakeRequired: true,
  },
];

export function getZoneById(id) { return ZONES.find(z => z.id === id) || null; }

export function rollEncounter(zone) {
  const pool = zone.encounterPool;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of pool) { r -= entry.weight; if (r <= 0) return entry.id; }
  return pool[pool.length - 1].id;
}

export function getHuntCooldownRemaining(zoneId) {
  const key = `brainwod_hunt_${zoneId}`;
  const last = parseInt(localStorage.getItem(key) || '0', 10);
  return Math.max(0, last + 24 * 3600_000 - Date.now());
}

export function markHuntUsed(zoneId) {
  localStorage.setItem(`brainwod_hunt_${zoneId}`, String(Date.now()));
}

// Which zone a tile belongs to based on map row
export function getZoneForTile(tileY) {
  if (tileY >= 2  && tileY <= 7)  return ZONES[0];
  if (tileY >= 49 && tileY <= 52) return ZONES[1];
  return null;
}
