import { InputHandler }                      from './input.js';
import { Camera }                            from './camera.js';
import { cfg, recalcTileSize }              from './config.js';
import { Tilemap }                           from './tilemap.js';
import { Renderer }                          from './renderer.js';
import { Player }                            from './player.js';
import { PLAYER_START, MAP_WIDTH, MAP_HEIGHT } from '../data/mapData.js';
import { getZoneForTile }                    from '../data/zones.js';

const GRASS_ENCOUNTER_CHANCE = 0.18; // 18% per step in tall grass

export class GameEngine {
  constructor(canvas, playerData, callbacks) {
    this.canvas    = canvas;
    this.player    = new Player(
      playerData?.position?.x ?? PLAYER_START.x,
      playerData?.position?.y ?? PLAYER_START.y
    );
    this.starterId = playerData?.starterId ?? 1;
    this.username  = playerData?.username  ?? 'Trainer';
    this.callbacks = callbacks || {};

    this.tilemap  = new Tilemap();
    this.renderer = new Renderer(canvas);
    this.input    = new InputHandler();
    this.camera   = new Camera(canvas.width, canvas.height, MAP_WIDTH, MAP_HEIGHT);

    this._raf     = null;
    this._running = false;
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
  }

  _loop() {
    if (!this._running) return;
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(this._loop);
  }

  _update() {
    const wasOnGrass = this.tilemap.getTile(this.player.tileX, this.player.tileY) === 3;
    this.player.update(this.input, this.tilemap);
    this.camera.follow(this.player.pixelX, this.player.pixelY);

    // Interaction: space/enter while standing still
    if (this.input.isActionPressed()) {
      const face = this.player.getFacingTile();
      const inter = this.tilemap.getInteractable(face.x, face.y);
      if (inter) {
        if (this.callbacks.onInteract) this.callbacks.onInteract(inter);
        return;
      }
    }

    // Grass encounter: triggers when player steps onto a tall grass tile
    if (this.player._justMoved) {
      const tx = this.player.tileX, ty = this.player.tileY;
      const tile = this.tilemap.getTile(tx, ty);
      if (tile === 3) {
        const zone = getZoneForTile(ty);
        if (zone && Math.random() < GRASS_ENCOUNTER_CHANCE) {
          if (this.callbacks.onGrassEncounter) {
            this.callbacks.onGrassEncounter(zone);
            return;
          }
        }
      }
    }

    // Auto-save position
    this._saveTimer++;
    if (this._saveTimer >= 180) {
      this._saveTimer = 0;
      if (this.callbacks.onSavePos) {
        this.callbacks.onSavePos({ x: this.player.tileX, y: this.player.tileY });
      }
    }
  }

  _draw() {
    const ts = cfg.tileSize;
    this.renderer.clear();
    this.renderer.drawTilemap(this.tilemap, this.camera);
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
