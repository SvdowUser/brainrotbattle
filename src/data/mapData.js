// Tile IDs:
// 0 = grass        (walkable, green)
// 1 = stone path   (walkable, gray-beige)
// 2 = tree         (BLOCKED, dark green)
// 3 = wild grass   (walkable, triggers encounter)
// 4 = building wall(BLOCKED, brick)
// 5 = door         (walkable, interactable)
// 6 = fence        (BLOCKED)
// 7 = water        (BLOCKED, blue)
// 8 = flowers      (walkable, decorative)
// 9 = sign         (walkable, interactable)

export const MAP_WIDTH  = 40;
export const MAP_HEIGHT = 30;

// MAP_DATA[row][col], row 0 = top
export const MAP_DATA = [
  // 0 trees
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  // 1 trees
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  // 2 wild grass north
  [2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2],
  // 3 wild grass north
  [2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2],
  // 4 wild grass with main path
  [2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,1,1,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2],
  // 5 grass (town entrance)
  [2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 6 grass
  [2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 7 house tops row 1 (left cols 9-12, right cols 26-29)
  [2,2,2,2,2,2,2,0,0,4,4,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,4,4,4,4,0,0,0,2,2,2,2,2,2,2],
  // 8 house walls
  [2,2,2,2,2,2,2,0,0,4,4,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,4,4,4,4,0,0,0,2,2,2,2,2,2,2],
  // 9 house doors (front facing south)
  [2,2,2,2,2,2,2,0,0,4,5,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,4,5,4,4,0,0,0,2,2,2,2,2,2,2],
  // 10 flowers between houses
  [2,2,2,2,2,2,2,0,8,8,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,8,8,0,0,2,2,2,2,2,2,2],
  // 11 tree in town
  [2,2,2,2,2,2,2,0,0,0,0,0,0,2,0,0,0,0,0,1,1,0,0,0,0,2,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 12 east-west crossroad
  [2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2],
  // 13 tree in town
  [2,2,2,2,2,2,2,0,0,0,0,0,0,2,0,0,0,0,0,1,1,0,0,0,0,2,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 14 house tops row 2
  [2,2,2,2,2,2,2,0,0,4,4,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,4,4,4,4,0,0,0,2,2,2,2,2,2,2],
  // 15 house walls row 2
  [2,2,2,2,2,2,2,0,0,4,4,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,4,4,4,4,0,0,0,2,2,2,2,2,2,2],
  // 16 house doors row 2
  [2,2,2,2,2,2,2,0,0,4,5,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,4,5,4,4,0,0,0,2,2,2,2,2,2,2],
  // 17 flowers + spawn area
  [2,2,2,2,2,2,2,0,8,8,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,8,8,0,0,2,2,2,2,2,2,2],
  // 18 sign row
  [2,2,2,2,2,2,2,0,9,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,9,0,0,2,2,2,2,2,2,2],
  // 19 second east-west path
  [2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2],
  // 20 grass
  [2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 21 market building top (wider, cols 8-14)
  [2,2,2,2,2,2,2,0,4,4,4,4,4,4,4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 22 market middle
  [2,2,2,2,2,2,2,0,4,4,4,4,4,4,4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 23 market doors (two doors)
  [2,2,2,2,2,2,2,0,4,4,5,4,4,5,4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 24 south town edge
  [2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2],
  // 25 wild grass south
  [2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,1,1,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2],
  // 26 wild grass south
  [2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2],
  // 27 wild grass south
  [2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2],
  // 28 trees
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  // 29 trees
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

// Tiles that block movement
export const BLOCKED_TILES = new Set([2, 4, 6, 7]);

// Named interactable points {tileX, tileY, type, data}
export const INTERACTABLES = [
  { x: 10, y: 9,  type: 'door', name: "Trainer's House",
    text: "A cozy home belonging to the local trainer.\n\"Train your Brainrods every day!\"\n— Old Trainer Bill" },
  { x: 27, y: 9,  type: 'door', name: 'Orb Shop',
    text: "Welcome to the Orb Shop!\nBrain Orbs: 10 $BRACK\nGlitch Orbs: 25 $BRACK\nRare Orbs: 100 $BRACK" },
  { x: 10, y: 16, type: 'door', name: "Dr. Brain's Lab",
    text: "Dr. Brain's Research Lab.\n\"Fascinating! Your Brainrods exhibit\nabnormal neural patterns.\"\n— Dr. Brain" },
  { x: 27, y: 16, type: 'door', name: 'Trading Post',
    text: "The Trading Post is under construction.\nMarket trading coming soon!\nConnect wallet to reserve your slot." },
  { x: 10, y: 23, type: 'door', name: 'Brainrod Market',
    text: "The Brainrod Market.\nBuy, sell, and trade your Brainrods.\nWallet connection required." },
  { x: 13, y: 23, type: 'door', name: 'Brainrod Market',
    text: "The Brainrod Market.\nBuy, sell, and trade your Brainrods.\nWallet connection required." },
  { x:  8, y: 18, type: 'sign',
    text: "Braincrest Town\n\"Where minds and myths collide.\"\n\n→ Rustling Route (North)\n← Glitch Meadow (South)" },
  { x: 30, y: 18, type: 'sign',
    text: "Danger: Wild Brainrods ahead!\nEquip Brain Orbs before entering the grass.\nFree hunt resets every 24 hours." },
  // Zone triggers — player enters these tiles to open zone modal
  { x: 19, y: 2,  type: 'zone', zoneId: 'rustling-route' },
  { x: 19, y: 3,  type: 'zone', zoneId: 'rustling-route' },
  { x: 20, y: 2,  type: 'zone', zoneId: 'rustling-route' },
  { x: 20, y: 3,  type: 'zone', zoneId: 'rustling-route' },
  { x: 19, y: 26, type: 'zone', zoneId: 'glitch-meadow' },
  { x: 19, y: 27, type: 'zone', zoneId: 'glitch-meadow' },
  { x: 20, y: 26, type: 'zone', zoneId: 'glitch-meadow' },
  { x: 20, y: 27, type: 'zone', zoneId: 'glitch-meadow' },
];

// Player default spawn
export const PLAYER_START = { x: 19, y: 17 };
