import { InputHandler }   from './input.js';
import { Camera }         from './camera.js';
import { cfg, recalcTileSize } from './config.js';
import { Renderer }       from './renderer.js';
import { Player }         from './player.js';
import { MapManager }     from './mapManager.js';
import { MAP_DEFS }       from '../data/mapsConfig.js';

const GRASS_ENCOUNTER_CHANCE = 0.18;

export class GameEngine {
  constructor(canvas, playerData, callbacks) {
    this.canvas     = canvas;
    this.callbacks  = callbacks || {};
    this.starterId  = playerData?.starterId ?? 1;
    this.username   = playerData?.username  ?? 'Trainer';

    this.mapManager = new MapManager();

    // Use saved position or default overworld spawn
    const spawn = MAP_DEFS.overworld.entries.spawn;
    this.player = new Player(
      playerData?.position?.x ?? spawn.tileX,
      playerData?.position?.y ?? spawn.tileY
    );

    this.renderer = new Renderer(canvas);
    this.input    = new InputHandler();
    this.camera   = new Camera(canvas.width, canvas.height);

    this._raf       = null;
    this._running   = false;
    this._saveTimer = 0;

    this._handleResize = this._handleResize.bind(this);
    this._loop         = this._loop.bind(this);
  }

  start() {
    this.input.init();
    window.addEventListener('resize', this._handleResize);
    this._handleResize();
    this._running = true;
    this._raf = requestAnimationFrame(this._loop);
  }

  stop() {
    this._running = false;
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    this.input.destroy();
    window.removeEventListener('resize', this._handleResize);
  }

  _handleResize() {
    recalcTileSize();
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.resize(w, h);
    this.camera.resize(w, h);
    this._syncCameraBounds();
  }

  _syncCameraBounds() {
    this.camera.setMapBounds(this.mapManager.mapPixelW, this.mapManager.mapPixelH);
  }

  _loop() {
    if (!this._running) return;
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(this._loop);
  }

  _update() {
    // Player movement + collision via mapManager.isBlocked()
    this.player.update(this.input, this.mapManager);

    // Keep camera bounds current (tileSize may have changed on resize)
    this._syncCameraBounds();
    this.camera.follow(
      this.player.pixelX,
      this.player.pixelY,
      this.mapManager.isCentered
    );

    if (!this.player._justMoved) return;

    const tx = this.player.tileX;
    const ty = this.player.tileY;

    // ── Map exit transition ────────────────────────────────────────────────────
    const exit = this.mapManager.checkExit(tx, ty);
    if (exit) {
      const entry = this.mapManager.transition(exit);
      if (entry) {
        this.player.setPosition(entry.tileX, entry.tileY);
        this._syncCameraBounds();
        // Force camera update for new map
        this.camera.follow(this.player.pixelX, this.player.pixelY, this.mapManager.isCentered);
      }
      return;
    }

    // ── Grass encounter (tile type 2 in collision grid) ───────────────────────
    const grid = this.mapManager.currentDef.collision;
    if (grid.length && grid[ty]?.[tx] === 2) {
      if (Math.random() < GRASS_ENCOUNTER_CHANCE && this.callbacks.onGrassEncounter) {
        this.callbacks.onGrassEncounter({ name: 'Route', creatures: [] });
        return;
      }
    }

    // ── Interaction (A/Space) ─────────────────────────────────────────────────
    if (this.input.isActionPressed()) {
      // Future: check facing tile for NPC / sign interactions
    }

    // ── Auto-save position ────────────────────────────────────────────────────
    this._saveTimer++;
    if (this._saveTimer >= 180) {
      this._saveTimer = 0;
      if (this.callbacks.onSavePos) {
        this.callbacks.onSavePos({ x: this.player.tileX, y: this.player.tileY });
      }
    }
  }

  _draw() {
    const mm  = this.mapManager;
    const ts  = cfg.tileSize;

    this.renderer.clear(); // black background (shows as border for small rooms)
    this.renderer.drawMapImage(
      mm.currentImage, mm.mapPixelW, mm.mapPixelH, this.camera
    );
    this.renderer.drawPlayer(
      this.player.pixelX, this.player.pixelY,
      this.camera,
      this.player.direction,
      this.player.moving,
      this.starterId
    );
    this.renderer.drawNameTag(
      this.username,
      this.player.pixelX + ts / 2,
      this.player.pixelY,
      this.camera
    );
  }

  getInput() { return this.input; }
}
