import { InputHandler }    from './input.js';
import { Camera, TILE_SIZE } from './camera.js';
import { Tilemap }           from './tilemap.js';
import { Renderer }          from './renderer.js';
import { Player }            from './player.js';
import { PLAYER_START }      from '../data/mapData.js';
import { MAP_WIDTH, MAP_HEIGHT } from '../data/mapData.js';

export class GameEngine {
  constructor(canvas, playerData, callbacks) {
    this.canvas   = canvas;
    this.player   = new Player(playerData?.position?.x ?? PLAYER_START.x,
                               playerData?.position?.y ?? PLAYER_START.y);
    this.starterId = playerData?.starterId ?? 1;
    this.username  = playerData?.username  ?? 'Trainer';
    this.callbacks = callbacks || {};

    this.tilemap  = new Tilemap();
    this.renderer = new Renderer(canvas);
    this.input    = new InputHandler();
    this.camera   = new Camera(canvas.width, canvas.height, MAP_WIDTH, MAP_HEIGHT);

    this._raf     = null;
    this._running = false;
    this._lastTile = { x: -1, y: -1 };

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
    const w = window.innerWidth;
    const h = window.innerHeight;
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
    this.player.update(this.input, this.tilemap);
    this.camera.follow(this.player.pixelX, this.player.pixelY);

    // Interaction: space/enter while standing still
    if (this.input.isActionPressed()) {
      const face = this.player.getFacingTile();
      const inter = this.tilemap.getInteractable(face.x, face.y);
      if (inter && this.callbacks.onInteract) this.callbacks.onInteract(inter);
    }

    // Zone auto-trigger: stepped onto wild grass zone tile
    const tx = this.player.tileX, ty = this.player.tileY;
    if (tx !== this._lastTile.x || ty !== this._lastTile.y) {
      this._lastTile = { x: tx, y: ty };
      const zone = this.tilemap.getZoneTrigger(tx, ty);
      if (zone && this.callbacks.onZoneEnter) this.callbacks.onZoneEnter(zone);
    }

    // Save position periodically (every ~180 frames)
    if (this.renderer.frame % 180 === 0 && this.callbacks.onSavePos) {
      this.callbacks.onSavePos({ x: tx, y: ty });
    }
  }

  _draw() {
    this.renderer.clear();
    this.renderer.drawTilemap(this.tilemap, this.camera);
    this.renderer.drawPlayer(
      this.player.pixelX, this.player.pixelY,
      this.camera,
      this.player.direction,
      this.player.moving,
      this.starterId
    );
    // Player name tag
    this.renderer.drawNameTag(
      this.username,
      this.player.pixelX + TILE_SIZE / 2,
      this.player.pixelY,
      this.camera
    );
  }

  getPlayerTile() { return { x: this.player.tileX, y: this.player.tileY }; }
  getInput()      { return this.input; }
}
