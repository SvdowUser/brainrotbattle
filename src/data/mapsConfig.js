// Map definitions — all tile coords are 0-indexed, 16px per tile (ORIG_TILE).
// Exit positions are estimates based on visual inspection of the extracted images.
// If a transition fires at the wrong spot, adjust the tileX/tileY numbers here.

import * as C from './mapCollisions.js';

export const ORIG_TILE = 16; // original Pokemon RSE pixel size per tile

export const MAP_DEFS = {

  // ── Overworld (town.png — 25×22 tiles) ────────────────────────────────────
  overworld: {
    id:       'overworld',
    imageSrc: '/maps/town.png',
    collision: C.overworld,
    centered:  false,

    entries: {
      spawn:          { tileX: 9,  tileY: 11 }, // center of main E-W path
      from_house_a:   { tileX: 3,  tileY: 9  }, // south of NW house door
      from_shop:      { tileX: 14, tileY: 9  }, // south of Mart door
      from_center_b1: { tileX: 3,  tileY: 11 }, // path north of SW center
      from_house_b:   { tileX: 13, tileY: 18 }, // south of SE house door
    },

    exits: [
      // NW house (top-left, orange roof) — door faces south
      { tileX: 3,  tileY: 7,  mapId: 'house_a',   entryId: 'door' },
      { tileX: 4,  tileY: 7,  mapId: 'house_a',   entryId: 'door' },
      // NE Mart (top-right, blue roof) — door faces south
      { tileX: 14, tileY: 8,  mapId: 'shop',       entryId: 'door' },
      { tileX: 15, tileY: 8,  mapId: 'shop',       entryId: 'door' },
      // SW Pokemon Center (bottom-left, Pokeball) — door faces north
      { tileX: 3,  tileY: 12, mapId: 'center_b1', entryId: 'door' },
      { tileX: 4,  tileY: 12, mapId: 'center_b1', entryId: 'door' },
      // SE house (bottom-right, tan roof) — door faces south
      { tileX: 13, tileY: 17, mapId: 'house_b',   entryId: 'door' },
      { tileX: 14, tileY: 17, mapId: 'house_b',   entryId: 'door' },
    ],
  },

  // ── NW house interior (room_house_a.png — 10×9 tiles) ─────────────────────
  house_a: {
    id:       'house_a',
    imageSrc: '/maps/room_house_a.png',
    collision: C.house_a,
    centered:  true,

    entries: {
      door: { tileX: 4, tileY: 6 }, // just inside bottom door
    },
    exits: [
      // Bottom-center door mat → back to overworld
      { tileX: 4, tileY: 7, mapId: 'overworld', entryId: 'from_house_a' },
      { tileX: 5, tileY: 7, mapId: 'overworld', entryId: 'from_house_a' },
    ],
  },

  // ── NE Mart interior (room_shop.png — 11×8 tiles) ─────────────────────────
  shop: {
    id:       'shop',
    imageSrc: '/maps/room_shop.png',
    collision: C.shop,
    centered:  true,

    entries: {
      door: { tileX: 5, tileY: 5 },
    },
    exits: [
      { tileX: 5, tileY: 6, mapId: 'overworld', entryId: 'from_shop' },
      { tileX: 6, tileY: 6, mapId: 'overworld', entryId: 'from_shop' },
    ],
  },

  // ── SW Pokemon Center 1F (room_center_b1.png — 14×9 tiles) ───────────────
  center_b1: {
    id:       'center_b1',
    imageSrc: '/maps/room_center_b1.png',
    collision: C.center_b1,
    centered:  true,

    entries: {
      door:    { tileX: 6, tileY: 6 }, // inside south door
      from_b2: { tileX: 1, tileY: 5 }, // returned from 2F escalator
    },
    exits: [
      // South door → back to overworld
      { tileX: 6, tileY: 7, mapId: 'overworld',  entryId: 'from_center_b1' },
      { tileX: 7, tileY: 7, mapId: 'overworld',  entryId: 'from_center_b1' },
      // Left escalator → 2F
      { tileX: 1, tileY: 6, mapId: 'center_b2',  entryId: 'from_b1'        },
    ],
  },

  // ── SW Pokemon Center 2F (room_center_b2.png — 14×9 tiles) ───────────────
  center_b2: {
    id:       'center_b2',
    imageSrc: '/maps/room_center_b2.png',
    collision: C.center_b2,
    centered:  true,

    entries: {
      from_b1: { tileX: 1, tileY: 1 }, // appeared at top of escalator
    },
    exits: [
      // Bottom-left escalator → back to 1F (different tile from entry so no instant loop)
      { tileX: 1, tileY: 7, mapId: 'center_b1', entryId: 'from_b2' },
    ],
  },

  // ── SE house interior (room_house_b.png — 11×8 tiles) ─────────────────────
  house_b: {
    id:       'house_b',
    imageSrc: '/maps/room_house_b.png',
    collision: C.house_b,
    centered:  true,

    entries: {
      door: { tileX: 5, tileY: 5 },
    },
    exits: [
      { tileX: 5, tileY: 6, mapId: 'overworld', entryId: 'from_house_b' },
      { tileX: 6, tileY: 6, mapId: 'overworld', entryId: 'from_house_b' },
    ],
  },
};
