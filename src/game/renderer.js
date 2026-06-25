import { cfg, setTileCache } from './config.js';

// ── Building sprite images ─────────────────────────────────────────────────────
const _bldImgs = {};
let   _bldLoaded = false;

function ensureBuildingsLoaded() {
  if (_bldLoaded) return;
  _bldLoaded = true;
  for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `/buildings/building_${String(i).padStart(2, '0')}.png`;
    _bldImgs[i] = img;
  }
}

// ── Tile cache ─────────────────────────────────────────────────────────────────
const tileCache = {};
setTileCache(tileCache);

function getTile(id) {
  const key = `${id}_${cfg.tileSize}`;
  if (!tileCache[key]) tileCache[key] = buildTile(id, cfg.tileSize);
  return tileCache[key];
}

function buildTile(id, s) {
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  (tileFns[id] || tileFns[0])(ctx, s);
  return c;
}

// ── Tile drawing — pokequest.world-inspired aesthetic ─────────────────────────
const tileFns = {
  // 0: regular grass — bright mint green with subtle dither
  0(ctx, s) {
    ctx.fillStyle = '#90C848';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#88BC42';
    for (let i = 0; i < s; i += 4)
      for (let j = (i / 4 % 2) * 2; j < s; j += 4)
        ctx.fillRect(i, j, 2, 2);
    ctx.fillStyle = '#98D050';
    ctx.fillRect(0, 0, 2, 2);
    ctx.fillRect(s - 3, s - 3, 2, 2);
  },

  // 1: stone path — warm cream/sand with clear grid
  1(ctx, s) {
    ctx.fillStyle = '#D4BC8A';
    ctx.fillRect(0, 0, s, s);
    const h = Math.max(4, Math.floor(s / 2));
    ctx.fillStyle = '#C8B07E';
    ctx.fillRect(0, 0, s, 1);
    ctx.fillRect(0, h, s, 1);
    ctx.fillRect(0, 0, 1, s);
    ctx.fillRect(h, 0, 1, s);
    ctx.fillStyle = '#BCA476';
    ctx.fillRect(1, 1, h - 2, h - 2);
    ctx.fillRect(h + 1, h + 1, s - h - 2, s - h - 2);
    ctx.fillStyle = '#C8B07E';
    ctx.fillRect(h + 1, 1, s - h - 2, h - 2);
    ctx.fillRect(1, h + 1, h - 2, s - h - 2);
  },

  // 2: tree — full round canopy (BLOCKED)
  2(ctx, s) {
    ctx.fillStyle = '#2A5C1E';
    ctx.fillRect(0, 0, s, s);
    // Shadow
    ctx.fillStyle = '#1E4416';
    ctx.beginPath(); ctx.ellipse(s/2+2, s/2+4, s*.42, s*.28, 0, 0, Math.PI*2); ctx.fill();
    // Trunk
    ctx.fillStyle = '#6B4020';
    ctx.fillRect(s*.42, s*.55, s*.16, s*.44);
    // Outer canopy
    ctx.fillStyle = '#2E7020';
    ctx.beginPath(); ctx.arc(s/2, s*.38, s*.42, 0, Math.PI*2); ctx.fill();
    // Mid canopy
    ctx.fillStyle = '#3A8A28';
    ctx.beginPath(); ctx.arc(s/2 - s*.1, s*.30, s*.28, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s/2 + s*.12, s*.32, s*.25, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s/2, s*.22, s*.25, 0, Math.PI*2); ctx.fill();
    // Light top
    ctx.fillStyle = '#4AA030';
    ctx.beginPath(); ctx.arc(s/2 - s*.08, s*.16, s*.16, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5CB840';
    ctx.beginPath(); ctx.arc(s/2 - s*.12, s*.12, s*.08, 0, Math.PI*2); ctx.fill();
  },

  // 3: tall grass — encounter zone
  3(ctx, s) {
    ctx.fillStyle = '#68B038';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#5CA030';
    ctx.fillRect(0, 0, s/2, s/2);
    ctx.fillRect(s/2, s/2, s/2, s/2);
    ctx.fillStyle = '#78C844';
    ctx.fillRect(1, 1, s/2-2, s/2-2);
    ctx.fillRect(s/2+1, s/2+1, s/2-2, s/2-2);
    // Grass blades
    ctx.fillStyle = '#8AE050';
    const blades = Math.max(5, Math.floor(s / 9));
    for (let i = 0; i < blades; i++) {
      const bx = (i * 7 + 3) % (s - 3);
      const bh = s * (.32 + (i % 3) * .09);
      ctx.fillRect(bx, s * .55 - bh, 2, bh);
      ctx.fillRect(bx + 1, s * .5 - bh, 1, bh * .6);
    }
    ctx.fillStyle = '#A0F060';
    for (let i = 0; i < 3; i++) {
      const bx = (i * 11 + 5) % (s - 2);
      ctx.fillRect(bx, 3, 2, s * .2);
    }
    // Yellow sparkle hint
    ctx.fillStyle = 'rgba(255,240,80,0.5)';
    ctx.fillRect(s - 5, 3, 2, 3);
    ctx.fillRect(s - 4, 2, 1, 1);
  },

  // 4: building wall — cream/white GBA Pokémon style
  4(ctx, s) {
    ctx.fillStyle = '#D8D4C0';
    ctx.fillRect(0, 0, s, s);
    // Subtle wall shading
    ctx.fillStyle = '#C8C4B0';
    ctx.fillRect(0, 0, 2, s);
    ctx.fillRect(s - 2, 0, 2, s);
    ctx.fillRect(0, 0, s, 2);
    // Window
    const ww = Math.max(6, s * .38), wh = Math.max(5, s * .32);
    const wx = (s - ww) / 2, wy = s * .2;
    ctx.fillStyle = '#90C8E8';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = '#60A0C8';
    ctx.fillRect(wx, wy, ww, wh * .5);
    ctx.fillStyle = '#B8E8F8';
    ctx.fillRect(wx + 2, wy + 2, ww * .4, wh * .4);
    // Window frame
    ctx.fillStyle = '#8080A0';
    ctx.strokeStyle = '#8080A0';
    ctx.lineWidth = Math.max(1, s * .05);
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.fillRect(s/2 - 1, wy, 2, wh); // divider
  },

  // 5: door
  5(ctx, s) {
    ctx.fillStyle = '#D8D4C0';
    ctx.fillRect(0, 0, s, s);
    const dw = s * .55, dh = s * .78;
    const dx = (s - dw) / 2, dy = s * .08;
    ctx.fillStyle = '#4A2810';
    ctx.fillRect(dx - 2, dy - 2, dw + 4, dh + 4);
    ctx.fillStyle = '#7A4820';
    ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = '#8A5828';
    ctx.fillRect(dx + 2, dy + 2, dw - 4, dh * .45);
    ctx.fillRect(dx + 2, dy + dh * .5, dw - 4, dh * .45);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(dx + dw - dw * .22, dy + dh * .52, Math.max(2, s * .06), 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#C0B090';
    ctx.fillRect(dx - 2, dy + dh + 2, dw + 4, 3);
  },

  // 6: fence (BLOCKED)
  6(ctx, s) {
    ctx.fillStyle = '#90C848';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#D4A864';
    ctx.fillRect(1, 0, s * .14, s);
    ctx.fillRect(s - s * .14 - 1, 0, s * .14, s);
    ctx.fillRect(0, s * .22, s, s * .1);
    ctx.fillRect(0, s * .62, s, s * .1);
    ctx.fillStyle = '#BCA070';
    ctx.fillRect(1, 1, s * .14, s * .14);
    ctx.fillRect(1, s - s * .15, s * .14, s * .14);
  },

  // 7: water (BLOCKED)
  7(ctx, s) {
    ctx.fillStyle = '#2880D0';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#3090DC';
    ctx.fillRect(0, s * .25, s, s * .5);
    ctx.fillStyle = '#4098E8';
    ctx.fillRect(0, s * .45, s, s * .25);
    // Ripples
    ctx.strokeStyle = '#70B8F8';
    ctx.lineWidth = Math.max(1, s * .04);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s*.05, s*.38); ctx.quadraticCurveTo(s*.25, s*.30, s*.48, s*.38);
    ctx.quadraticCurveTo(s*.70, s*.46, s*.92, s*.38); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s*.05, s*.60); ctx.quadraticCurveTo(s*.30, s*.52, s*.50, s*.60);
    ctx.quadraticCurveTo(s*.70, s*.68, s*.92, s*.60); ctx.stroke();
    ctx.fillStyle = 'rgba(160,210,255,0.5)';
    ctx.fillRect(s*.12, s*.22, s*.1, s*.025);
    ctx.fillRect(s*.60, s*.52, s*.14, s*.025);
  },

  // 8: flowers
  8(ctx, s) {
    ctx.fillStyle = '#90C848';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#88BC42';
    for (let i = 0; i < s; i += 4)
      for (let j = (i / 4 % 2) * 2; j < s; j += 4)
        ctx.fillRect(i, j, 2, 2);
    const r = Math.max(2, s * .07);
    const fl = [
      { x: s*.14, y: s*.20, c: '#FF6080' },
      { x: s*.38, y: s*.58, c: '#FFE040' },
      { x: s*.65, y: s*.22, c: '#E060F0' },
      { x: s*.20, y: s*.70, c: '#FF9040' },
      { x: s*.72, y: s*.65, c: '#FFFFFF' },
      { x: s*.50, y: s*.40, c: '#80E0FF' },
    ];
    fl.forEach(f => {
      ctx.fillStyle = '#2A7020';
      ctx.fillRect(f.x - 1, f.y + r, 2, s * .14);
      ctx.fillStyle = f.c;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(f.x + Math.cos(a)*r*1.7, f.y + Math.sin(a)*r*1.7, r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.fillStyle = '#FFE060';
      ctx.beginPath(); ctx.arc(f.x, f.y, r * .8, 0, Math.PI*2); ctx.fill();
    });
  },

  // 9: sign
  9(ctx, s) {
    ctx.fillStyle = '#90C848';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#88BC42';
    for (let i = 0; i < s; i += 4)
      for (let j = (i / 4 % 2) * 2; j < s; j += 4)
        ctx.fillRect(i, j, 2, 2);
    const sw = s * .58, sh = s * .42;
    const sx = (s - sw) / 2, sy = s * .12;
    ctx.fillStyle = '#7A5030';
    ctx.fillRect(s/2 - 2, sy + sh, 4, s - sy - sh - 2);
    ctx.fillStyle = '#7A5030';
    ctx.fillRect(sx - 1, sy - 1, sw + 2, sh + 2);
    ctx.fillStyle = '#FFF8E0';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = '#6A3820';
    const lh = sh * .24;
    ctx.fillRect(sx + 3, sy + lh,     sw - 6, Math.max(1, lh * .5));
    ctx.fillRect(sx + 3, sy + lh*2.3, sw - 6, Math.max(1, lh * .5));
    ctx.fillRect(sx + 3, sy + lh*3.5, (sw-6)*.65, Math.max(1, lh * .5));
  },
};

// ── Character sprite — proper 4-direction with pre-rendered cache ─────────────
let _spriteCache = null;

function buildSprite(ts, starterId) {
  // Sprite sheet: 3 frames wide × 4 directions tall
  const FW = Math.round(ts * 0.9);  // frame width
  const FH = Math.round(ts * 1.1);  // frame height (taller than 1 tile)
  const key = `sprite_${ts}_${starterId}`;
  if (_spriteCache?.key === key) return _spriteCache;

  const FRAMES = 3;
  const DIRS   = ['down','up','left','right'];
  const sheet  = document.createElement('canvas');
  sheet.width  = FW * FRAMES;
  sheet.height = FH * DIRS.length;
  const ctx = sheet.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const palettes = [
    { hat: '#E53935', brim: '#C62828', shirt: '#1565C0', pants: '#37474F', shoes: '#1A1A1A' },
    { hat: '#1565C0', brim: '#0D47A1', shirt: '#E53935', pants: '#1A237E', shoes: '#1A1A1A' },
    { hat: '#F9A825', brim: '#E65100', shirt: '#2E7D32', pants: '#1B5E20', shoes: '#1A1A1A' },
  ];
  const pal = palettes[(starterId - 1) % 3] || palettes[0];

  DIRS.forEach((dir, di) => {
    for (let frame = 0; frame < FRAMES; frame++) {
      const ox = frame * FW;
      const oy = di  * FH;
      _drawCharFrame(ctx, ox, oy, FW, FH, dir, frame, pal);
    }
  });

  _spriteCache = { key, sheet, FW, FH, DIRS };
  return _spriteCache;
}

function _drawCharFrame(ctx, ox, oy, fw, fh, dir, frame, pal) {
  // Walk offsets
  const walk = frame === 0 ? 0 : frame === 1 ? 1 : -1;

  // Proportions (as fractions of fh)
  const hatH   = fh * .18;
  const headH  = fh * .18;
  const bodyH  = fh * .22;
  const legH   = fh * .22;
  const feetH  = fh * .06;
  const totalH = hatH + headH + bodyH + legH + feetH;
  const startY = oy + (fh - totalH) / 2;

  const hatY   = startY;
  const headY  = hatY  + hatH;
  const bodyY  = headY + headH;
  const legY   = bodyY + bodyH;
  const feetY  = legY  + legH;

  const cx = ox + fw / 2;  // horizontal center

  const SKIN  = '#FFCC77';
  const HAIR  = '#3D2B1F';
  const EYE   = '#1A1A7E';
  const WHITE = '#FFFFFF';

  const legSwing = walk * fh * .05;
  const armSwing = -walk * fh * .04;
  const bob      = frame === 0 ? 0 : fh * .015;

  if (dir === 'down') {
    // ─ Hat ──
    const hatW  = fw * .78;
    const brimW = fw * .92;
    ctx.fillStyle = pal.hat;
    ctx.fillRect(cx - hatW/2, hatY + bob, hatW, hatH * .8);
    ctx.fillStyle = pal.brim;
    ctx.fillRect(cx - brimW/2, hatY + hatH * .7 + bob, brimW, hatH * .3);
    // ─ Face ──
    const headW = fw * .62;
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - headW/2, headY + bob, headW, headH);
    ctx.fillStyle = HAIR;
    ctx.fillRect(cx - headW/2, headY + headH * .7 + bob, headW, headH * .25);
    // Eyes
    const eyeW = Math.max(2, fw * .12);
    const eyeH = Math.max(2, fh * .06);
    const eyeY = headY + headH * .38 + bob;
    ctx.fillStyle = EYE;
    ctx.fillRect(cx - fw*.22, eyeY, eyeW, eyeH);
    ctx.fillRect(cx + fw*.10, eyeY, eyeW, eyeH);
    ctx.fillStyle = WHITE;
    ctx.fillRect(cx - fw*.20, eyeY, eyeW*.4, eyeH*.45);
    ctx.fillRect(cx + fw*.12, eyeY, eyeW*.4, eyeH*.45);
    // ─ Body ──
    const bodyW = fw * .68;
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(cx - bodyW/2, bodyY + bob, bodyW, bodyH);
    // Arms
    const armW = fw * .18, armH = bodyH * .9;
    ctx.fillRect(cx - bodyW/2 - armW, bodyY + armSwing + bob, armW, armH);
    ctx.fillRect(cx + bodyW/2,        bodyY - armSwing + bob, armW, armH);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - bodyW/2 - armW, bodyY + armSwing + armH * .8 + bob, armW, armH * .2);
    ctx.fillRect(cx + bodyW/2,        bodyY - armSwing + armH * .8 + bob, armW, armH * .2);
    // ─ Legs ──
    const legW = fw * .24;
    ctx.fillStyle = pal.pants;
    ctx.fillRect(cx - legW - 1, legY + legSwing + bob, legW, legH * .9);
    ctx.fillRect(cx + 1,        legY - legSwing + bob, legW, legH * .9);
    // Feet
    ctx.fillStyle = pal.shoes;
    ctx.fillRect(cx - legW - 2, feetY + legSwing + bob, legW + 3, feetH);
    ctx.fillRect(cx,            feetY - legSwing + bob, legW + 3, feetH);

  } else if (dir === 'up') {
    // ─ Hat (back) ──
    const hatW  = fw * .78;
    const brimW = fw * .92;
    ctx.fillStyle = pal.hat;
    ctx.fillRect(cx - hatW/2, hatY + bob, hatW, hatH * .8);
    ctx.fillStyle = pal.brim;
    ctx.fillRect(cx - brimW/2, hatY + hatH * .7 + bob, brimW, hatH * .3);
    // ─ Back of head ── (skin + lots of hair)
    const headW = fw * .62;
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - headW/2, headY + bob, headW, headH * .45);
    ctx.fillStyle = HAIR;
    ctx.fillRect(cx - headW/2, headY + headH * .40 + bob, headW, headH * .6);
    // ─ Body (back) ──
    const bodyW = fw * .68;
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(cx - bodyW/2, bodyY + bob, bodyW, bodyH);
    const armW = fw * .18, armH = bodyH * .9;
    ctx.fillRect(cx - bodyW/2 - armW, bodyY - armSwing + bob, armW, armH);
    ctx.fillRect(cx + bodyW/2,        bodyY + armSwing + bob, armW, armH);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - bodyW/2 - armW, bodyY - armSwing + armH*.8 + bob, armW, armH*.2);
    ctx.fillRect(cx + bodyW/2,        bodyY + armSwing + armH*.8 + bob, armW, armH*.2);
    // ─ Legs ──
    const legW = fw * .24;
    ctx.fillStyle = pal.pants;
    ctx.fillRect(cx - legW - 1, legY + legSwing + bob, legW, legH * .9);
    ctx.fillRect(cx + 1,        legY - legSwing + bob, legW, legH * .9);
    ctx.fillStyle = pal.shoes;
    ctx.fillRect(cx - legW - 2, feetY + legSwing + bob, legW + 3, feetH);
    ctx.fillRect(cx,            feetY - legSwing + bob, legW + 3, feetH);

  } else {
    // ─ Side view (left / right) ──
    const flip = dir === 'right' ? 1 : -1;

    // Hat side
    const hatW = fw * .72;
    ctx.fillStyle = pal.hat;
    ctx.fillRect(cx - hatW/2, hatY + bob, hatW, hatH * .8);
    ctx.fillStyle = pal.brim;
    // Brim extends in facing direction
    ctx.fillRect(cx - hatW/2 + (flip > 0 ? 0 : -fw*.14), hatY + hatH*.7 + bob,
                 hatW + fw*.14, hatH*.3);

    // Side face (narrower)
    const headW = fw * .52;
    const headOx = flip > 0 ? cx - headW/2 + fw*.06 : cx - headW/2 - fw*.06;
    ctx.fillStyle = SKIN;
    ctx.fillRect(headOx, headY + bob, headW, headH);
    // Hair on non-face side
    ctx.fillStyle = HAIR;
    ctx.fillRect(flip > 0 ? cx - headW/2 - fw*.08 : cx + headW/2, headY + headH*.2 + bob, fw*.1, headH*.7);
    // One eye (on facing side)
    const eyeW = Math.max(2, fw*.11);
    const eyeH = Math.max(2, fh*.055);
    const eyeX = flip > 0
      ? cx + headW/2 - eyeW - fw*.08
      : cx - headW/2 + fw*.08;
    ctx.fillStyle = EYE;
    ctx.fillRect(eyeX + fw*.06, headY + headH*.38 + bob, eyeW, eyeH);
    ctx.fillStyle = WHITE;
    ctx.fillRect(eyeX + fw*.06, headY + headH*.38 + bob, eyeW*.4, eyeH*.4);

    // Body side (slimmer)
    const bodyW = fw * .52;
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(cx - bodyW/2, bodyY + bob, bodyW, bodyH);
    // One arm visible (swinging)
    const armW = fw * .18, armH = bodyH * .9;
    const armX = flip > 0 ? cx + bodyW/2 : cx - bodyW/2 - armW;
    ctx.fillRect(armX, bodyY + armSwing + bob, armW, armH);
    ctx.fillStyle = SKIN;
    ctx.fillRect(armX, bodyY + armSwing + armH*.8 + bob, armW, armH*.2);

    // Legs side (staggered)
    const legW = fw * .22;
    ctx.fillStyle = pal.pants;
    ctx.fillRect(cx - legW/2,     legY + legSwing + bob, legW, legH * .9);
    ctx.fillRect(cx - legW/2 - 3, legY - legSwing + bob, legW, legH * .9);
    // Feet pointing in facing direction
    const footOx = flip > 0 ? cx - legW/2 + legW*.2 : cx - legW/2 - fw*.12;
    ctx.fillStyle = pal.shoes;
    ctx.fillRect(footOx,              feetY + legSwing + bob, legW + fw*.2, feetH);
    ctx.fillRect(footOx - flip*fw*.1, feetY - legSwing + bob, legW + fw*.2, feetH);
  }
}

// ── Main Renderer ──────────────────────────────────────────────────────────────
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.frame  = 0;
  }

  resize(w, h) {
    this.canvas.width  = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    this.ctx.fillStyle = '#000000'; // black → shows as border for small rooms
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw a PNG map image scaled and offset by the camera.
  // For centered rooms camera.x/y are negative, so -camera.x/y gives the top-left offset.
  drawMapImage(img, mapW, mapH, camera) {
    if (!img?.complete || !img.naturalWidth) {
      // Image still loading — show a subtle loading hint
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#555';
      this.ctx.font = `${Math.floor(cfg.tileSize * 0.4)}px 'Press Start 2P', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'LOADING...',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
      return;
    }
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(img, -camera.x, -camera.y, mapW, mapH);
  }

  drawTilemap(tilemap, camera) {
    const ctx = this.ctx;
    const ts  = cfg.tileSize;
    const { startCol, startRow, endCol, endRow } = camera.getVisibleTiles();

    for (let row = startRow; row <= endRow && row < tilemap.height; row++) {
      for (let col = startCol; col <= endCol && col < tilemap.width; col++) {
        const tileId = tilemap.getTile(col, row);
        const sx = Math.round(col * ts - camera.x);
        const sy = Math.round(row * ts - camera.y);
        ctx.drawImage(getTile(tileId), sx, sy, ts, ts);
      }
    }
  }

  drawPlayer(px, py, camera, direction, moving, starterId) {
    const ts  = cfg.tileSize;
    const spr = buildSprite(ts, starterId);
    const { x: sx, y: sy } = camera.worldToScreen(px, py);

    const DIRS  = ['down','up','left','right'];
    const dirIdx = DIRS.indexOf(direction);
    const frameIdx = moving ? (Math.floor(this.frame / 6) % 2) + 1 : 0;

    // Draw shadow
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(sx + ts/2, sy + ts * .92, ts * .25, ts * .07, 0, 0, Math.PI*2);
    ctx.fill();

    // Draw sprite frame
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      spr.sheet,
      frameIdx * spr.FW, dirIdx * spr.FH, spr.FW, spr.FH,
      sx + (ts - spr.FW) / 2, sy - spr.FH * .05,
      spr.FW, spr.FH
    );

    this.frame++;
  }

  drawBuildings(buildings, camera) {
    ensureBuildingsLoaded();
    const ctx = this.ctx;
    const ts  = cfg.tileSize;
    ctx.imageSmoothingEnabled = false;

    for (const bld of buildings) {
      const img = _bldImgs[bld.spriteId];
      if (!img?.complete || !img.naturalWidth) continue;

      const sx = Math.round(bld.tileX * ts - camera.x);
      const sy = Math.round(bld.tileY * ts - camera.y);
      const sw = bld.tileW * ts;
      const sh = bld.tileH * ts;

      if (sx + sw < 0 || sy + sh < 0 ||
          sx > this.canvas.width || sy > this.canvas.height) continue;

      if (bld.flipY) {
        ctx.save();
        ctx.translate(sx, sy + sh);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0, sw, sh);
        ctx.restore();
      } else {
        ctx.drawImage(img, sx, sy, sw, sh);
      }
    }
    ctx.imageSmoothingEnabled = false;
  }

  drawNameTag(text, wx, wy, camera) {
    const { x: sx, y: sy } = camera.worldToScreen(wx, wy);
    const ctx = this.ctx;
    const ts  = cfg.tileSize;
    const fs  = Math.max(7, Math.floor(ts * .15));
    ctx.save();
    ctx.font = `bold ${fs}px 'Press Start 2P', monospace`;
    ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(sx - w / 2, sy - fs - 12, w, fs + 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, sx, sy - 8);
    ctx.restore();
  }

  drawBrainrodAt(brainrod, cx, cy, size) {
    brainrod.draw(this.ctx, cx, cy, size, this.frame);
  }
}
