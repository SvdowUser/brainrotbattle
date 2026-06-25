import { TILE_SIZE } from './camera.js';

// Offscreen tile cache — draw each tile type once, reuse
const tileCache = {};

function buildTile(tileId) {
  const c = document.createElement('canvas');
  c.width = c.height = TILE_SIZE;
  const ctx = c.getContext('2d');
  drawTileFn[tileId]?.(ctx, TILE_SIZE);
  return c;
}

function getTileCached(tileId) {
  if (!tileCache[tileId]) tileCache[tileId] = buildTile(tileId);
  return tileCache[tileId];
}

// ─── Tile drawing functions ──────────────────────────────────────────────────
const drawTileFn = {
  // 0 grass
  0(ctx, s) {
    ctx.fillStyle = '#3A8C3F';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#2E7D32';
    for (let i = 0; i < 6; i++) {
      const px = (i * 7 + 3) % s; const py = (i * 11 + 5) % s;
      ctx.fillRect(px, py, 2, 2);
    }
  },
  // 1 stone path
  1(ctx, s) {
    ctx.fillStyle = '#9E8B6B';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#7A6A50';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, s - 2, s - 2);
    ctx.fillStyle = '#AE9B7B';
    ctx.fillRect(2, 2, s / 2 - 2, s / 2 - 2);
    ctx.fillRect(s / 2 + 1, s / 2 + 1, s / 2 - 3, s / 2 - 3);
  },
  // 2 tree
  2(ctx, s) {
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(0, 0, s, s);
    // trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(s / 2 - 3, s / 2 + 2, 6, s / 2 - 2);
    // canopy blobs
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath(); ctx.arc(s / 2, s / 2 - 2, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#388E3C';
    ctx.beginPath(); ctx.arc(s / 2 - 4, s / 2 - 4, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s / 2 + 4, s / 2 - 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#43A047';
    ctx.beginPath(); ctx.arc(s / 2, s / 2 - 6, 5, 0, Math.PI * 2); ctx.fill();
  },
  // 3 wild grass
  3(ctx, s) {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#66BB6A';
    for (let i = 0; i < 8; i++) {
      const px = (i * 5 + 2) % (s - 2);
      ctx.fillRect(px, s - 8 - (i % 3) * 3, 2, 6 + (i % 3) * 3);
    }
    ctx.fillStyle = '#81C784';
    for (let i = 0; i < 5; i++) {
      const px = (i * 8 + 4) % (s - 2);
      ctx.fillRect(px, 2, 2, 5 + i % 3);
    }
  },
  // 4 building wall
  4(ctx, s) {
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#6D4C41';
    for (let row = 0; row < 4; row++) {
      const offset = row % 2 === 0 ? 0 : 8;
      for (let col = 0; col < 3; col++) {
        ctx.fillRect(offset + col * 16 + 1, row * 8 + 1, 14, 6);
      }
    }
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 1;
    for (let row = 0; row < 4; row++) {
      ctx.beginPath(); ctx.moveTo(0, row * 8); ctx.lineTo(s, row * 8); ctx.stroke();
    }
  },
  // 5 door
  5(ctx, s) {
    // floor under door
    ctx.fillStyle = '#9E8B6B';
    ctx.fillRect(0, 0, s, s);
    // door frame
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(s / 2 - 7, 4, 14, s - 4);
    // door panel
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(s / 2 - 5, 7, 10, s - 8);
    // door knob
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(s / 2 + 3, s / 2 + 4, 2, 0, Math.PI * 2); ctx.fill();
  },
  // 6 fence
  6(ctx, s) {
    ctx.fillStyle = '#3A8C3F';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(4, 0, 4, s);
    ctx.fillRect(s - 8, 0, 4, s);
    ctx.fillRect(0, 8, s, 4);
    ctx.fillRect(0, s - 12, s, 4);
  },
  // 7 water
  7(ctx, s) {
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#1976D2';
    ctx.fillRect(0, s / 3, s, 3);
    ctx.fillRect(0, 2 * s / 3, s, 3);
    ctx.fillStyle = '#42A5F5';
    ctx.fillRect(4, s / 3 + 1, 10, 1);
    ctx.fillRect(s - 14, 2 * s / 3 + 1, 10, 1);
  },
  // 8 flowers
  8(ctx, s) {
    ctx.fillStyle = '#3A8C3F';
    ctx.fillRect(0, 0, s, s);
    const flowers = [
      { x: 5,  y: 6,  c: '#FF5252' },
      { x: 14, y: 14, c: '#FFEB3B' },
      { x: 22, y: 5,  c: '#E040FB' },
      { x: 8,  y: 22, c: '#FF9800' },
      { x: 26, y: 20, c: '#FFFFFF' },
    ];
    ctx.fillStyle = '#43A047';
    flowers.forEach(f => {
      ctx.fillRect(f.x - 1, f.y + 2, 2, 4);
      ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#43A047';
    });
  },
  // 9 sign
  9(ctx, s) {
    ctx.fillStyle = '#3A8C3F';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(s / 2 - 2, s / 2, 4, s / 2 - 2);
    ctx.fillStyle = '#795548';
    ctx.fillRect(s / 2 - 9, s / 4, 18, 12);
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(s / 2 - 7, s / 4 + 2, 14, 8);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(s / 2 - 5, s / 4 + 4, 10, 2);
    ctx.fillRect(s / 2 - 4, s / 4 + 7, 7, 1);
  },
};

// ─── Brainrod sprite renderer ────────────────────────────────────────────────
function drawBrainrodSprite(ctx, brainrod, cx, cy, size, frame) {
  const pulse = Math.sin(frame * 0.1) * 2;
  const r = size / 2 + pulse;
  ctx.save();
  ctx.shadowColor = brainrod.color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = brainrod.color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = brainrod.color2;
  ctx.beginPath(); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ─── Main Renderer ───────────────────────────────────────────────────────────
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.frame  = 0;
    // Pixel-art sharp rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  resize(w, h) {
    this.canvas.width  = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTilemap(tilemap, camera) {
    const ctx = this.ctx;
    const { startCol, startRow, endCol, endRow } = camera.getVisibleTiles();

    for (let row = startRow; row <= endRow && row < tilemap.height; row++) {
      for (let col = startCol; col <= endCol && col < tilemap.width; col++) {
        const tileId = tilemap.getTile(col, row);
        const cached = getTileCached(tileId);
        const sx = col * TILE_SIZE - camera.x;
        const sy = row * TILE_SIZE - camera.y;
        ctx.drawImage(cached, sx, sy);
      }
    }
  }

  drawPlayer(px, py, camera, direction, moving, starterId) {
    const ctx = this.ctx;
    const { x: sx, y: sy } = camera.worldToScreen(px, py);
    const t = TILE_SIZE;
    const bobY = moving ? Math.sin(this.frame * 0.3) * 2 : 0;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sx + t / 2, sy + t - 3, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = sx + t / 2;
    const cy = sy + t / 2 + bobY;

    // Colors per starter
    const configs = [
      { hat: '#E53935', shirt: '#1565C0', skin: '#FFCC80' },
      { hat: '#1565C0', shirt: '#E53935', skin: '#FFCC80' },
      { hat: '#F9A825', shirt: '#2E7D32', skin: '#FFCC80' },
    ];
    const cfg = configs[(starterId - 1) % 3] || configs[0];

    // Legs (animated when moving)
    const legPhase = moving ? Math.sin(this.frame * 0.4) * 3 : 0;
    ctx.fillStyle = '#263238';
    ctx.fillRect(cx - 5, cy + 5, 4, 7 + legPhase);
    ctx.fillRect(cx + 1, cy + 5, 4, 7 - legPhase);

    // Body
    ctx.fillStyle = cfg.shirt;
    ctx.fillRect(cx - 6, cy - 3, 12, 10);

    // Arms
    const armPhase = moving ? -legPhase : 0;
    ctx.fillStyle = cfg.shirt;
    ctx.fillRect(cx - 10, cy - 2 + armPhase, 4, 7);
    ctx.fillRect(cx + 6, cy - 2 - armPhase, 4, 7);
    ctx.fillStyle = cfg.skin;
    ctx.fillRect(cx - 10, cy + 4 + armPhase, 4, 3);
    ctx.fillRect(cx + 6, cy + 4 - armPhase, 4, 3);

    // Head
    ctx.fillStyle = cfg.skin;
    ctx.fillRect(cx - 5, cy - 12, 10, 10);

    // Hat
    ctx.fillStyle = cfg.hat;
    ctx.fillRect(cx - 7, cy - 15, 14, 5);
    ctx.fillRect(cx - 4, cy - 19, 8, 5);

    // Eyes (direction-aware)
    ctx.fillStyle = '#1A237E';
    if (direction !== 'up') {
      ctx.fillRect(cx - 3, cy - 9, 2, 2);
      ctx.fillRect(cx + 1, cy - 9, 2, 2);
    }

    ctx.restore();
    this.frame++;
  }

  drawBrainrod(brainrod, cx, cy) {
    drawBrainrodSprite(this.ctx, brainrod, cx, cy, 20, this.frame);
  }

  // Draw a name tag above a point
  drawNameTag(text, wx, wy, camera) {
    const { x: sx, y: sy } = camera.worldToScreen(wx, wy);
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(sx - w / 2, sy - 18, w, 12);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, sx, sy - 8);
    ctx.restore();
  }
}
