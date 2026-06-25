// Tile IDs:
// 0 = grass       (walkable)
// 1 = stone path  (walkable)
// 2 = tree        (BLOCKED)
// 3 = tall grass  (walkable, triggers wild encounters)
// 4 = building wall (BLOCKED)
// 5 = door        (walkable, interactable)
// 6 = fence       (BLOCKED)
// 7 = water       (BLOCKED)
// 8 = flowers     (walkable, decorative)
// 9 = sign        (walkable, interactable)

export const MAP_WIDTH  = 32;
export const MAP_HEIGHT = 24;

export const BLOCKED_TILES = new Set([2, 4, 6, 7]);

function buildMap() {
  const W = MAP_WIDTH, H = MAP_HEIGHT;
  const m = Array.from({ length: H }, () => new Array(W).fill(0));

  const set  = (r, c, v) => { if (r >= 0 && r < H && c >= 0 && c < W) m[r][c] = v; };
  const fill = (r0, c0, r1, c1, v) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(r, c, v);
  };

  // ── Border trees ─────────────────────────────────────────────────────────────
  fill(0,  0,  0,  W-1, 2);
  fill(H-1,0,  H-1,W-1, 2);
  fill(0,  0,  H-1, 0,  2);
  fill(0,  W-1,H-1,W-1, 2);

  // ── Wild grass north (rows 1–3) ──────────────────────────────────────────────
  fill(1, 1, 3, W-2, 3);
  // Path through north grass
  fill(1, 13, 3, 14, 1);

  // ── Transition rows 4–5 (grass + path) ──────────────────────────────────────
  fill(4, 1, 5, W-2, 0);
  fill(4, 13, 5, 14, 1);

  // ── N-S main path (cols 13–14) ───────────────────────────────────────────────
  fill(0, 13, H-1, 14, 1);

  // ── E-W main path (row 11) ───────────────────────────────────────────────────
  fill(11, 1, 11, W-2, 1);

  // ── BUILDING A — Trainer's House (rows 6-10, cols 2-7) ──────────────────────
  fill(6, 2, 9, 7, 4);
  set(10, 4, 5); set(10, 5, 5); // door
  fill(10, 2, 10, 3, 0);
  fill(10, 6, 10, 7, 0);
  fill(11, 2, 11, 7, 1); // path row = main path

  // ── BUILDING B — Orb Shop (rows 6-10, cols 9-12) ────────────────────────────
  fill(6, 9, 9, 12, 4);
  set(10, 10, 5); set(10, 11, 5); // door
  fill(10, 9, 10, 9, 0);
  fill(10, 12, 10, 12, 0);

  // ── BUILDING C — Dr. Brain's Lab (rows 6-10, cols 16-26, requiresDex:5) ─────
  fill(6, 16, 9, 26, 4);
  set(10, 20, 5); set(10, 21, 5); // door
  fill(10, 16, 10, 19, 0);
  fill(10, 22, 10, 26, 0);

  // ── BUILDING D — Market (rows 12-17, cols 16-26, requiresDex:10) ────────────
  fill(12, 16, 16, 26, 4);
  set(12, 20, 5); set(12, 21, 5); // door at top (faces north toward path)
  fill(12, 16, 12, 19, 0);
  fill(12, 22, 12, 26, 0);

  // ── BUILDING E — Battle Arena (rows 12-17, cols 2-9, requiresDex:3) ─────────
  fill(12, 2, 16, 9, 4);
  set(12, 5, 5); set(12, 6, 5); // door
  fill(12, 2, 12, 4, 0);
  fill(12, 7, 12, 9, 0);

  // ── Water pond (rows 13-17, cols 10-15) ─────────────────────────────────────
  fill(13, 10, 17, 15, 7);
  // Grass around pond
  fill(12, 10, 12, 15, 8); // flowers north of pond
  fill(18, 10, 18, 15, 8); // flowers south of pond

  // ── Signs ────────────────────────────────────────────────────────────────────
  set(5,  3, 9); // sign near Building A
  set(5, 22, 9); // sign near Building C

  // ── Flowers scattered in town ────────────────────────────────────────────────
  fill(4,  2, 4,  4,  8);
  fill(4, 16, 4, 18,  8);
  fill(4, 27, 4, 29,  8);
  fill(18, 2, 18, 4,  8);
  fill(18,27, 18, 29, 8);
  fill(7, 14, 9, 15, 0);  // small grass patch between buildings

  // ── Wild grass south (rows 20–22) ────────────────────────────────────────────
  fill(20, 1, 22, W-2, 3);
  // Path through south grass
  fill(20, 13, 22, 14, 1);

  // ── South transition (rows 18-19) ────────────────────────────────────────────
  fill(18, 1, 19, W-2, 0);
  fill(18, 13, 19, 14, 1);

  return m;
}

export const MAP_DATA = buildMap();

// ── Player spawn ──────────────────────────────────────────────────────────────
export const PLAYER_START = { x: 13, y: 11 };

// ── Interactables ─────────────────────────────────────────────────────────────
export const INTERACTABLES = [
  // Building A doors
  { x:4,  y:10, name: "Trainer's House",
    text: "Professor Brainwod lives here.\nHe'll help you on your journey!" },
  { x:5,  y:10, name: "Trainer's House",
    text: "Professor Brainwod lives here.\nHe'll help you on your journey!" },

  // Building B doors
  { x:10, y:10, name: 'Orb Shop',
    text: 'Stock up on Brain Orbs here.\nBetter orbs = better catch chance!' },
  { x:11, y:10, name: 'Orb Shop',
    text: 'Stock up on Brain Orbs here.\nBetter orbs = better catch chance!' },

  // Building C doors (locked)
  { x:20, y:10, name: "Dr. Brain's Lab", locked: true, requiresDex: 5,
    text: "Dr. Brain's research lab.\nUnlock: catch 5 Brainwods." },
  { x:21, y:10, name: "Dr. Brain's Lab", locked: true, requiresDex: 5,
    text: "Dr. Brain's research lab.\nUnlock: catch 5 Brainwods." },

  // Building D doors (locked)
  { x:20, y:12, name: 'Market', locked: true, requiresDex: 10,
    text: 'The Brainwod Market.\nUnlock: catch 10 Brainwods.' },
  { x:21, y:12, name: 'Market', locked: true, requiresDex: 10,
    text: 'The Brainwod Market.\nUnlock: catch 10 Brainwods.' },

  // Building E doors (locked)
  { x:5,  y:12, name: 'Battle Arena', locked: true, requiresDex: 3,
    text: 'The Battle Arena.\nUnlock: catch 3 Brainwods.' },
  { x:6,  y:12, name: 'Battle Arena', locked: true, requiresDex: 3,
    text: 'The Battle Arena.\nUnlock: catch 3 Brainwods.' },

  // Signs
  { x:3,  y:5,  name: 'Town Sign',
    text: 'Welcome to BRAINCREST TOWN!\nBeware of the tall grass.' },
  { x:22, y:5,  name: 'Lab Sign',
    text: "Dr. Brain's Lab\nCatch 5 Brainwods to enter." },
];
