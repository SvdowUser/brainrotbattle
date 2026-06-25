// Tile IDs:
// 0 = grass       (walkable, base green)
// 1 = stone path  (walkable, stone-paved)
// 2 = tree        (BLOCKED, forest canopy)
// 3 = tall grass  (walkable, triggers wild encounters)
// 4 = building wall (BLOCKED, brick)
// 5 = door        (walkable, interactable)
// 6 = fence       (BLOCKED)
// 7 = water       (BLOCKED, pond/river)
// 8 = flowers     (walkable, decorative)
// 9 = sign        (walkable, interactable)
// 10 = special tall grass (BLOCKED — locked zone, rare encounters)

export const MAP_WIDTH  = 80;
export const MAP_HEIGHT = 55;

// ── Map builder ────────────────────────────────────────────────────────────────
function buildMap() {
  const W = MAP_WIDTH, H = MAP_HEIGHT;
  const m = Array.from({ length: H }, () => new Array(W).fill(0));

  const set = (r, c, v) => { if (r >= 0 && r < H && c >= 0 && c < W) m[r][c] = v; };
  const fill = (r0, c0, r1, c1, v) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(r, c, v);
  };
  const isPath = (r, c) => m[r]?.[c] === 1;

  // ── Border forest ─────────────────────────────────────────────────────────────
  fill(0, 0, H-1, 4, 2);
  fill(0, W-5, H-1, W-1, 2);
  fill(0, 0, 1, W-1, 2);
  fill(H-2, 0, H-1, W-1, 2);

  // ── North: Rustling Route (rows 2-7) ─────────────────────────────────────────
  fill(2, 5, 7, W-6, 3); // all tall grass
  // Main path through grass
  fill(2, 37, 7, 41, 1);
  // Some trees scattered in grass
  const nTrees = [[2,12],[3,22],[2,30],[3,55],[4,62],[2,70],[5,18],[5,48],[6,65],[3,40]];
  for (const [r,c] of nTrees) if (m[r][c] === 3) set(r, c, 2);

  // ── Town border (rows 8-9) ────────────────────────────────────────────────────
  fill(8, 5, 9, W-6, 0);
  fill(8, 37, 9, 41, 1); // path continues
  // Tree border left/right of town entrance
  fill(8, 5, 9, 14, 2);
  fill(8, W-15, 9, W-6, 2);

  // ── Main N-S path (rows 2-52) ─────────────────────────────────────────────────
  fill(2, 37, 52, 41, 1);

  // ── BRAINCREST TOWN (rows 10-46) ─────────────────────────────────────────────
  // Town boundary trees on sides
  fill(10, 5, 46, 8, 2);
  fill(10, W-9, 46, W-6, 2);

  // ── E-W crossroads ───────────────────────────────────────────────────────────
  for (const crossR of [20, 31, 42]) {
    fill(crossR, 9, crossR, W-10, 1);
  }

  // ── Left district buildings ───────────────────────────────────────────────────
  // Trainer's House: rows 12-16, cols 10-18
  fill(12, 10, 16, 18, 4);
  set(16, 14, 5); // door
  fill(17, 10, 17, 18, 8); // flowers in front

  // Orb Shop: rows 12-16, cols 22-30
  fill(12, 22, 16, 30, 4);
  set(16, 26, 5);
  fill(17, 22, 17, 30, 8);

  // Dr. Brain's Lab: rows 22-28, cols 10-22
  fill(22, 10, 28, 22, 4);
  set(28, 16, 5);
  set(28, 17, 5);
  fill(29, 10, 29, 22, 8);

  // Market / Exchange: rows 33-41, cols 9-24
  fill(33, 9, 41, 24, 4);
  set(41, 14, 5);
  set(41, 18, 5);
  fill(42, 9, 42, 24, 8);

  // ── Right district buildings ──────────────────────────────────────────────────
  // Info Center: rows 12-16, cols 49-57
  fill(12, 49, 16, 57, 4);
  set(16, 53, 5);
  fill(17, 49, 17, 57, 8);

  // Trading Post: rows 12-16, cols 61-70
  fill(12, 61, 16, 70, 4);
  set(16, 65, 5);
  fill(17, 61, 17, 70, 8);

  // Battle Arena: rows 22-32, cols 49-68
  fill(22, 49, 32, 68, 4);
  set(32, 56, 5);
  set(32, 60, 5);
  fill(33, 49, 33, 68, 8);

  // Crypto Vault: rows 36-42, cols 55-70
  fill(36, 55, 42, 70, 4);
  set(42, 62, 5);
  set(42, 63, 5);
  fill(43, 55, 43, 70, 8);

  // ── Water pond (center-left) ──────────────────────────────────────────────────
  fill(36, 27, 41, 34, 7);
  // Pond border path
  fill(35, 26, 35, 35, 1);
  fill(42, 26, 42, 35, 1);
  set(36, 26, 1); set(37, 26, 1); set(38, 26, 1); set(39, 26, 1); set(40, 26, 1); set(41, 26, 1);
  set(36, 35, 1); set(37, 35, 1); set(38, 35, 1); set(39, 35, 1); set(40, 35, 1); set(41, 35, 1);

  // ── Town trees ────────────────────────────────────────────────────────────────
  const townTrees = [
    [11,32],[11,34],[11,44],[11,46],
    [18,32],[18,35],[18,44],[18,47],
    [21,32],[21,35],[21,44],[21,46],
    [25,25],[25,35],[25,44],[25,47],
    [30,28],[30,36],[34,26],[34,37],
    [38,37],[39,37],[40,37],[38,47],[39,47],[40,47],
    [44,28],[44,36],[44,46],[44,50],
  ];
  for (const [r,c] of townTrees) if (m[r]?.[c] === 0) set(r, c, 2);

  // ── Flowers scattered ────────────────────────────────────────────────────────
  const flowerSpots = [
    [11,9],[11,20],[11,31],[11,45],
    [18,9],[18,20],[18,31],[18,45],[18,58],[18,71],
    [21,9],[21,24],[21,31],[21,45],
    [30,9],[30,26],[30,36],[30,46],
    [35,9],[35,26],[35,36],[35,46],
    [43,9],[43,25],[43,36],[43,46],
    [44,9],[44,26],[44,37],[44,47],
  ];
  for (const [r,c] of flowerSpots) if (m[r]?.[c] === 0) set(r, c, 8);

  // ── Signs ────────────────────────────────────────────────────────────────────
  set(19, 36, 9); // sign before first crossroad
  set(30, 36, 9); // sign near lab
  set(43, 36, 9); // sign near south exit

  // ── Town gate (north, south) ──────────────────────────────────────────────────
  // North gate arch: decorative path tiles
  fill(9, 35, 9, 43, 1);
  set(8, 35, 1); set(8, 43, 1); // gate posts become path

  // South gate
  fill(46, 35, 46, 43, 1);

  // ── South: Town border (rows 47-48) ──────────────────────────────────────────
  fill(47, 5, 48, W-6, 0);
  fill(47, 5, 48, 14, 2);
  fill(47, W-15, 48, W-6, 2);
  fill(47, 37, 48, 41, 1); // path continues south

  // ── South: Glitch Meadow (rows 49-52) ────────────────────────────────────────
  fill(49, 5, 52, W-6, 3); // all tall grass
  fill(49, 37, 52, 41, 1); // path through
  const sTrees = [[49,10],[50,18],[49,28],[50,48],[49,58],[50,68],[51,22],[51,62],[52,35]];
  for (const [r,c] of sTrees) if (m[r]?.[c] === 3) set(r, c, 2);

  // ── Bottom border ─────────────────────────────────────────────────────────────
  fill(53, 0, H-1, W-1, 2);
  fill(53, 37, 53, 41, 1); // path to edge

  // ── Fix: clear path overlaps (path overwrites buildings) ─────────────────────
  // (Buildings were placed before paths, so paths on the same row might overwrite.
  //  The crossroads loops only write if there's no building, but we already set them.
  //  Re-enforce building walls over crossroad tiles.)
  const buildingRanges = [
    [12,10,16,18],[12,22,16,30],[22,10,28,22],[33,9,41,24],
    [12,49,16,57],[12,61,16,70],[22,49,32,68],[36,55,42,70],
  ];
  for (const [r0,c0,r1,c1] of buildingRanges) {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (m[r][c] === 1 && !(r === r1 && (m[r][c-1] === 4 || m[r][c+1] === 4))) {
        // Keep doors, enforce walls
        if (m[r][c] !== 5) m[r][c] = 4;
      }
    }
  }
  // Re-set doors (they might have been overwritten above)
  set(16, 14, 5); set(16, 26, 5);
  set(28, 16, 5); set(28, 17, 5);
  set(41, 14, 5); set(41, 18, 5);
  set(16, 53, 5); set(16, 65, 5);
  set(32, 56, 5); set(32, 60, 5);
  set(42, 62, 5); set(42, 63, 5);

  return m;
}

export const MAP_DATA = buildMap();

// Tiles that block movement
export const BLOCKED_TILES = new Set([2, 4, 6, 7, 10]);

// Named interactable points
export const INTERACTABLES = [
  // Left district doors
  { x:14, y:16, type:'door', name:"Trainer's House",
    text:"A cozy home.\n\"Keep training your Brainwods!\"\n— Old Trainer Marco",
    locked: false },
  { x:26, y:16, type:'door', name:'Orb Shop',
    text:"Orb Shop — Stock up on catch items!\nBrain Orbs: 10 $BRACK\nGlitch Orbs: 25 $BRACK\nRare Orbs: 100 $BRACK",
    locked: false },
  { x:16, y:28, type:'door', name:"Dr. Brain's Lab",
    text:"Dr. Brain's Research Lab.\n\"Fascinating Brainwod patterns today.\"\n— Dr. Brain",
    requiresDex: 5, locked: true },
  { x:17, y:28, type:'door', name:"Dr. Brain's Lab",
    text:"Dr. Brain's Research Lab.\n\"Come back when you've caught 5 Brainwods!\"",
    requiresDex: 5, locked: true },
  { x:14, y:41, type:'door', name:'Market Exchange',
    text:"The Brainwod Market!\nBuy, sell, and trade Brainwods.\nWallet connection required.",
    requiresDex: 10, locked: true },
  { x:18, y:41, type:'door', name:'Market Exchange',
    text:"The Brainwod Market is open!\nConnect your wallet to trade.",
    requiresDex: 10, locked: true },

  // Right district doors
  { x:53, y:16, type:'door', name:'Info Center',
    text:"Welcome to Braincrest Town!\n→ Rustling Route (North) — Tier 1 Brainwods\n← Glitch Meadow (South) — Tier 2 Brainwods\nWalk through TALL GRASS to encounter wild Brainwods!",
    locked: false },
  { x:65, y:16, type:'door', name:'Trading Post',
    text:"The Trading Post.\nP2P trading coming soon.\nConnect wallet to reserve your slot.",
    locked: false },
  { x:56, y:32, type:'door', name:'Battle Arena',
    text:"BATTLE ARENA\nChallenge other trainers!\n(PvP coming soon — prepare your team!)",
    requiresDex: 3, locked: true },
  { x:60, y:32, type:'door', name:'Battle Arena',
    text:"Battle Arena.\nCatch at least 3 Brainwods first!",
    requiresDex: 3, locked: true },
  { x:62, y:42, type:'door', name:'Crypto Vault',
    text:"Crypto Vault.\nStake $BRACK here for daily rewards.\n10,000 $BRACK minimum to activate.",
    locked: false },
  { x:63, y:42, type:'door', name:'Crypto Vault',
    text:"Your staked tokens are safe here.\nUnlock paid hunts with 10,000 $BRACK staked.",
    locked: false },

  // Signs
  { x:36, y:19, type:'sign',
    text:"Braincrest Town\n\"Where minds and myths collide.\"\n\n↑ Rustling Route — Common/Uncommon Brainwods\n↓ Glitch Meadow — Uncommon/Rare Brainwods\n\nTIP: Walk through TALL GRASS to find wild Brainwods!" },
  { x:36, y:30, type:'sign',
    text:"Dr. Brain's Lab: Requires BrainDex 5+\nBattle Arena: Requires BrainDex 3+\nMarket: Requires BrainDex 10+\n\nHunt for Brainwods in the tall grass!" },
  { x:36, y:43, type:'sign',
    text:"⚠ DANGER: Wild Brainwods ahead!\nGlitch Meadow — Southern Wilds\nBrainwods here are stronger and rarer.\n\nStake 10,000 $BRACK for extra daily hunts!" },
];

// Player default spawn — middle of town, on the main path
export const PLAYER_START = { x: 39, y: 35 };
