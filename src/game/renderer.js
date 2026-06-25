import { cfg, setTileCache } from './config.js';

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

// ── Tile drawing functions (s = tileSize) ─────────────────────────────────────
const tileFns = {
  // 0 regular grass
  0(ctx, s) {
    ctx.fillStyle = '#3d9b40';
    ctx.fillRect(0, 0, s, s);
    // Subtle grass texture
    ctx.fillStyle = '#358838';
    for (let i = 0; i < 5; i++) {
      const x = (i * 13 + 3) % (s - 3), y = (i * 17 + 2) % (s - 4);
      ctx.fillRect(x, y, 1, 3);
      ctx.fillRect(x + 2, y + 1, 1, 2);
    }
    ctx.fillStyle = '#45aa48';
    for (let i = 0; i < 4; i++) {
      const x = (i * 19 + 7) % (s - 3), y = (i * 11 + 6) % (s - 3);
      ctx.fillRect(x, y, 2, 1);
    }
  },
  // 1 stone path
  1(ctx, s) {
    ctx.fillStyle = '#b0a080';
    ctx.fillRect(0, 0, s, s);
    // Stone tiles
    const half = Math.floor(s / 2);
    ctx.fillStyle = '#c0b090';
    ctx.fillRect(1, 1, half - 2, half - 2);
    ctx.fillRect(half + 1, half + 1, s - half - 2, s - half - 2);
    ctx.fillStyle = '#a89070';
    ctx.fillRect(half + 1, 1, s - half - 2, half - 2);
    ctx.fillRect(1, half + 1, half - 2, s - half - 2);
    // Mortar lines
    ctx.strokeStyle = '#88704A';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, half); ctx.lineTo(s, half); ctx.stroke();
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
  },
  // 2 tree
  2(ctx, s) {
    // Forest floor
    ctx.fillStyle = '#1a5c1e';
    ctx.fillRect(0, 0, s, s);
    // Shadow underneath canopy
    ctx.fillStyle = '#16481a';
    ctx.beginPath();
    ctx.ellipse(s/2 + 2, s/2 + 3, s*.44, s*.28, 0, 0, Math.PI*2);
    ctx.fill();
    // Trunk
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(s/2 - Math.max(2, s*.07), s/2, Math.max(4, s*.14), s/2 - 2);
    // Back canopy (dark)
    ctx.fillStyle = '#1e6822';
    ctx.beginPath(); ctx.arc(s/2, s/2 - s*.05, s*.36, 0, Math.PI*2); ctx.fill();
    // Main canopy
    ctx.fillStyle = '#28882c';
    ctx.beginPath(); ctx.arc(s/2, s/2 - s*.1, s*.32, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s/2 - s*.14, s/2 - s*.04, s*.22, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s/2 + s*.14, s/2 - s*.02, s*.20, 0, Math.PI*2); ctx.fill();
    // Highlight
    ctx.fillStyle = '#36a83a';
    ctx.beginPath(); ctx.arc(s/2 - s*.08, s/2 - s*.18, s*.14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#44c048';
    ctx.beginPath(); ctx.arc(s/2 - s*.1, s/2 - s*.22, s*.07, 0, Math.PI*2); ctx.fill();
  },
  // 3 tall grass (encounter zone)
  3(ctx, s) {
    ctx.fillStyle = '#4ab84e';
    ctx.fillRect(0, 0, s, s);
    // Darker patches
    ctx.fillStyle = '#3a9840';
    ctx.fillRect(0, 0, s/2, s/2);
    ctx.fillRect(s/2, s/2, s/2, s/2);
    ctx.fillStyle = '#4ab84e';
    ctx.fillRect(2, 2, s/2 - 4, s/2 - 4);
    ctx.fillRect(s/2 + 2, s/2 + 2, s/2 - 4, s/2 - 4);
    // Tall grass blades (many)
    ctx.fillStyle = '#60d864';
    const blades = Math.max(6, Math.floor(s / 8));
    for (let i = 0; i < blades; i++) {
      const bx = (i * 7 + 2) % (s - 3);
      const bh = Math.max(4, s * (.25 + (i % 3) * .08));
      const by = s - 2;
      ctx.fillRect(bx, by - bh, 2, bh);
      ctx.fillRect(bx + 1, by - bh - 2, 1, 3);
    }
    ctx.fillStyle = '#7aee7e';
    for (let i = 0; i < 4; i++) {
      const bx = (i * 11 + 5) % (s - 3);
      ctx.fillRect(bx, 2, 2, Math.max(3, s * .18));
    }
    // Subtle "!" hint — tiny sparkle to hint encounters
    ctx.fillStyle = 'rgba(255,255,100,0.35)';
    ctx.fillRect(s - 6, 2, 2, 4);
  },
  // 4 building wall (brick)
  4(ctx, s) {
    ctx.fillStyle = '#7a4030';
    ctx.fillRect(0, 0, s, s);
    const brickH = Math.max(5, Math.floor(s / 5));
    const brickW = Math.max(10, Math.floor(s / 2.5));
    ctx.fillStyle = '#8a5040';
    for (let row = 0; row < Math.ceil(s / brickH); row++) {
      const offset = row % 2 === 0 ? 0 : brickW / 2;
      for (let col = 0; col < 4; col++) {
        const bx = Math.floor(offset + col * brickW) + 1;
        const by = row * brickH + 1;
        ctx.fillRect(bx, by, brickW - 2, brickH - 2);
      }
    }
    // Mortar
    ctx.fillStyle = '#5a2818';
    for (let row = 0; row <= Math.ceil(s / brickH); row++) {
      ctx.fillRect(0, row * brickH, s, 1);
    }
  },
  // 5 door
  5(ctx, s) {
    ctx.fillStyle = '#b0a080';
    ctx.fillRect(0, 0, s, s);
    const dw = Math.floor(s * .55), dh = Math.floor(s * .75);
    const dx = Math.floor((s - dw) / 2), dy = Math.floor(s * .12);
    // Door frame
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(dx - 2, dy - 2, dw + 4, dh + 4);
    // Door panel
    ctx.fillStyle = '#6b3c1c';
    ctx.fillRect(dx, dy, dw, dh);
    // Panel details
    ctx.fillStyle = '#7a4822';
    const ph = Math.floor(dh * .45);
    ctx.fillRect(dx + 2, dy + 2, dw - 4, ph - 2);
    ctx.fillRect(dx + 2, dy + ph + 2, dw - 4, dh - ph - 4);
    // Door knob
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(dx + dw - Math.floor(dw * .22), dy + Math.floor(dh * .55), Math.max(2, Math.floor(s * .06)), 0, Math.PI*2);
    ctx.fill();
    // Step
    ctx.fillStyle = '#c0b090';
    ctx.fillRect(dx - 2, dy + dh + 2, dw + 4, 3);
  },
  // 6 fence
  6(ctx, s) {
    ctx.fillStyle = '#3d9b40';
    ctx.fillRect(0, 0, s, s);
    const postW = Math.max(3, Math.floor(s * .12));
    ctx.fillStyle = '#c88040';
    ctx.fillRect(1, 0, postW, s);
    ctx.fillRect(s - postW - 1, 0, postW, s);
    const railY1 = Math.floor(s * .25), railY2 = Math.floor(s * .65);
    ctx.fillRect(0, railY1, s, Math.max(2, Math.floor(s * .08)));
    ctx.fillRect(0, railY2, s, Math.max(2, Math.floor(s * .08)));
    ctx.fillStyle = '#a86830';
    ctx.fillRect(1, 1, postW, postW);
    ctx.fillRect(1, s - postW - 1, postW, postW);
    ctx.fillRect(s - postW - 1, 1, postW, postW);
    ctx.fillRect(s - postW - 1, s - postW - 1, postW, postW);
  },
  // 7 water
  7(ctx, s) {
    ctx.fillStyle = '#1560c0';
    ctx.fillRect(0, 0, s, s);
    // Depth gradient illusion
    ctx.fillStyle = '#1a70d0';
    ctx.fillRect(0, s * .3, s, s * .4);
    ctx.fillStyle = '#2080d8';
    ctx.fillRect(0, s * .5, s, s * .2);
    // Ripple waves
    ctx.strokeStyle = '#48a8f0';
    ctx.lineWidth = Math.max(1, s * .03);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s * .1, s * .38); ctx.quadraticCurveTo(s * .3, s * .32, s * .5, s * .38); ctx.quadraticCurveTo(s * .7, s * .44, s * .9, s * .38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * .05, s * .62); ctx.quadraticCurveTo(s * .25, s * .56, s * .45, s * .62); ctx.quadraticCurveTo(s * .65, s * .68, s * .85, s * .62); ctx.stroke();
    // Sparkles
    ctx.fillStyle = 'rgba(150,200,255,0.6)';
    ctx.fillRect(s * .15, s * .25, s * .08, s * .02);
    ctx.fillRect(s * .65, s * .55, s * .12, s * .02);
  },
  // 8 flowers
  8(ctx, s) {
    ctx.fillStyle = '#3d9b40';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#45aa48';
    ctx.fillRect(1, 1, s/2 - 2, s/2 - 2);
    ctx.fillRect(s/2 + 1, s/2 + 1, s/2 - 2, s/2 - 2);
    const r = Math.max(2, Math.floor(s * .08));
    const fl = [
      { x: s*.12, y: s*.18, c:'#ff5252' },
      { x: s*.35, y: s*.55, c:'#ffeb3b' },
      { x: s*.62, y: s*.20, c:'#e040fb' },
      { x: s*.18, y: s*.72, c:'#ff9800' },
      { x: s*.72, y: s*.65, c:'#ffffff' },
      { x: s*.50, y: s*.38, c:'#f06292' },
    ];
    fl.forEach(f => {
      // Stem
      ctx.fillStyle = '#2a7a2e';
      ctx.fillRect(f.x - 1, f.y + r, 2, Math.max(3, s * .12));
      // Petals
      ctx.fillStyle = f.c;
      for (let i = 0; i < 5; i++) {
        const a = (i/5)*Math.PI*2;
        ctx.beginPath(); ctx.arc(f.x + Math.cos(a)*r*1.6, f.y + Math.sin(a)*r*1.6, r, 0, Math.PI*2); ctx.fill();
      }
      // Center
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI*2); ctx.fill();
    });
  },
  // 9 sign
  9(ctx, s) {
    ctx.fillStyle = '#3d9b40';
    ctx.fillRect(0, 0, s, s);
    const sw = Math.floor(s * .55), sh = Math.floor(s * .40);
    const sx = Math.floor((s - sw) / 2), sy = Math.floor(s * .15);
    // Post
    ctx.fillStyle = '#7a5030';
    ctx.fillRect(s/2 - 2, sy + sh, 4, s - sy - sh - 2);
    // Sign board
    ctx.fillStyle = '#6b4020';
    ctx.fillRect(sx - 1, sy - 1, sw + 2, sh + 2);
    ctx.fillStyle = '#fff8e1';
    ctx.fillRect(sx, sy, sw, sh);
    // Lines on sign (text representation)
    ctx.fillStyle = '#5a3010';
    const lh = Math.max(2, Math.floor(sh * .22));
    ctx.fillRect(sx + 3, sy + lh, sw - 6, Math.max(1, lh * .6));
    ctx.fillRect(sx + 3, sy + lh * 2.2, sw - 6, Math.max(1, lh * .6));
    ctx.fillRect(sx + 3, sy + lh * 3.4, Math.floor((sw - 6) * .7), Math.max(1, lh * .6));
  },
};

// ── Player sprite ──────────────────────────────────────────────────────────────
function drawTrainer(ctx, cx, cy, s, direction, moving, frame, starterId) {
  const configs = [
    { hat:'#e53935', shirt:'#1565c0', pants:'#263238' },
    { hat:'#1565c0', shirt:'#e53935', pants:'#1a237e' },
    { hat:'#f9a825', shirt:'#2e7d32', pants:'#1b5e20' },
  ];
  const c = configs[(starterId - 1) % 3] || configs[0];
  const bobY = moving ? Math.sin(frame * 0.35) * (s * .04) : 0;
  const legPhase = moving ? Math.sin(frame * 0.4) * (s * .08) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx + s*.5, cy + s - s*.04, s*.22, s*.06, 0, 0, Math.PI*2);
  ctx.fill();

  const bx = cx + s*.5, by = cy + s*.5 + bobY;

  // Legs
  ctx.fillStyle = c.pants;
  ctx.fillRect(bx - s*.12, by + s*.10, s*.10, s*.28 + legPhase);
  ctx.fillRect(bx + s*.02, by + s*.10, s*.10, s*.28 - legPhase);
  // Shoes
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(bx - s*.14, by + s*.36 + legPhase, s*.13, s*.07);
  ctx.fillRect(bx + s*.01, by + s*.36 - legPhase, s*.13, s*.07);

  // Body
  ctx.fillStyle = c.shirt;
  ctx.fillRect(bx - s*.16, by - s*.15, s*.32, s*.28);

  // Arms
  const armPhase = moving ? -legPhase : 0;
  ctx.fillStyle = c.shirt;
  ctx.fillRect(bx - s*.28, by - s*.12 + armPhase, s*.12, s*.24);
  ctx.fillRect(bx + s*.16, by - s*.12 - armPhase, s*.12, s*.24);
  // Hands
  ctx.fillStyle = '#ffcc80';
  ctx.fillRect(bx - s*.28, by + s*.10 + armPhase, s*.12, s*.08);
  ctx.fillRect(bx + s*.16, by + s*.10 - armPhase, s*.12, s*.08);

  // Neck
  ctx.fillStyle = '#ffcc80';
  ctx.fillRect(bx - s*.06, by - s*.22, s*.12, s*.08);

  // Head
  ctx.fillStyle = '#ffcc80';
  ctx.fillRect(bx - s*.16, by - s*.42, s*.32, s*.24);

  // Hair under hat
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(bx - s*.16, by - s*.30, s*.32, s*.06);

  // Hat brim
  ctx.fillStyle = c.hat;
  ctx.fillRect(bx - s*.22, by - s*.44, s*.44, s*.07);
  // Hat top
  ctx.fillRect(bx - s*.16, by - s*.60, s*.32, s*.18);
  // Hat band
  ctx.fillStyle = '#ffffff22';
  ctx.fillRect(bx - s*.16, by - s*.46, s*.32, s*.04);

  // Eyes (direction-aware)
  if (direction !== 'up') {
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(bx - s*.10, by - s*.32, s*.06, s*.06);
    ctx.fillRect(bx + s*.04, by - s*.32, s*.06, s*.06);
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx - s*.10, by - s*.34, s*.02, s*.02);
    ctx.fillRect(bx + s*.04, by - s*.34, s*.02, s*.02);
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
    // Fill with grass color so no black borders ever appear
    this.ctx.fillStyle = '#3d9b40';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
    const ts = cfg.tileSize;
    const { x: sx, y: sy } = camera.worldToScreen(px, py);
    drawTrainer(this.ctx, sx, sy, ts, direction, moving, this.frame, starterId);
    this.frame++;
  }

  drawNameTag(text, wx, wy, camera) {
    const { x: sx, y: sy } = camera.worldToScreen(wx, wy);
    const ctx = this.ctx;
    const fs  = Math.max(8, Math.floor(cfg.tileSize * .18));
    ctx.save();
    ctx.font = `bold ${fs}px monospace`;
    ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(sx - w / 2, sy - fs - 10, w, fs + 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, sx, sy - 6);
    ctx.restore();
  }

  // Used by landing page and encounter previews
  drawBrainrodAt(brainrod, cx, cy, size) {
    brainrod.draw(this.ctx, cx, cy, size, this.frame);
  }
}
