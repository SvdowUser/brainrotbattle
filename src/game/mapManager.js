import { MAP_DEFS, ORIG_TILE } from '../data/mapsConfig.js';
import { cfg } from './config.js';

export class MapManager {
  constructor() {
    this._images     = {};
    this._imgSizes   = {};
    this.currentDef  = MAP_DEFS.overworld;
    this._preloadAll();
  }

  _preloadAll() {
    for (const def of Object.values(MAP_DEFS)) {
      const img = new Image();
      img.onload = () => {
        this._imgSizes[def.id] = { w: img.naturalWidth, h: img.naturalHeight };
      };
      img.src = def.imageSrc;
      this._images[def.id] = img;
    }
  }

  // ── Read-only properties ────────────────────────────────────────────────────
  get scale()        { return cfg.tileSize / ORIG_TILE; }
  get currentImage() { return this._images[this.currentDef.id]; }
  get isCentered()   { return this.currentDef.centered === true; }

  get mapPixelW() {
    const s = this._imgSizes[this.currentDef.id];
    return s ? s.w * this.scale : 0;
  }
  get mapPixelH() {
    const s = this._imgSizes[this.currentDef.id];
    return s ? s.h * this.scale : 0;
  }

  // ── Collision ────────────────────────────────────────────────────────────────
  // Returns true if the tile at (tileX, tileY) is blocked.
  // Matches the interface expected by Player.update().
  isBlocked(tileX, tileY) {
    const grid = this.currentDef.collision;
    if (!grid || !grid.length) return false; // no data yet (before extraction)
    if (tileY < 0 || tileY >= grid.length)   return true;
    if (tileX < 0 || tileX >= grid[tileY].length) return true;
    return grid[tileY][tileX] !== 0;
  }

  // ── Transitions ─────────────────────────────────────────────────────────────
  // Returns the matching exit definition if the tile triggers a transition.
  checkExit(tileX, tileY) {
    return (this.currentDef.exits || [])
      .find(e => e.tileX === tileX && e.tileY === tileY) || null;
  }

  // Switches the active map and returns the entry tile position.
  transition(exit) {
    const targetDef = MAP_DEFS[exit.mapId];
    if (!targetDef) { console.warn(`Unknown map: ${exit.mapId}`); return null; }
    this.currentDef = targetDef;
    const entry = targetDef.entries?.[exit.entryId]
               ?? targetDef.entries?.door
               ?? { tileX: 2, tileY: 2 };
    return entry;
  }

  // Returns the default spawn for the current map (or a fallback).
  getSpawn(entryId = 'spawn') {
    return this.currentDef.entries?.[entryId]
        ?? this.currentDef.entries?.spawn
        ?? { tileX: 2, tileY: 2 };
  }
}
