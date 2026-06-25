import { cfg } from './config.js';

export class Camera {
  constructor(viewW, viewH, mapTilesW, mapTilesH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this._mapTilesW = mapTilesW;
    this._mapTilesH = mapTilesH;
    this.x = 0;
    this.y = 0;
  }

  get mapW() { return this._mapTilesW * cfg.tileSize; }
  get mapH() { return this._mapTilesH * cfg.tileSize; }

  resize(viewW, viewH) { this.viewW = viewW; this.viewH = viewH; }

  follow(playerPixelX, playerPixelY) {
    const ts = cfg.tileSize;
    this.x = playerPixelX - this.viewW / 2 + ts / 2;
    this.y = playerPixelY - this.viewH / 2 + ts / 2;
    const maxX = this.mapW - this.viewW;
    const maxY = this.mapH - this.viewH;
    this.x = Math.max(0, Math.min(this.x, maxX > 0 ? maxX : 0));
    this.y = Math.max(0, Math.min(this.y, maxY > 0 ? maxY : 0));
  }

  getVisibleTiles() {
    const ts = cfg.tileSize;
    const startCol = Math.max(0, Math.floor(this.x / ts) - 1);
    const startRow = Math.max(0, Math.floor(this.y / ts) - 1);
    const endCol   = startCol + Math.ceil(this.viewW / ts) + 2;
    const endRow   = startRow + Math.ceil(this.viewH / ts) + 2;
    return { startCol, startRow, endCol, endRow };
  }

  worldToScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  }
}
