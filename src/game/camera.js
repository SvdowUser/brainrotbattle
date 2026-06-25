import { cfg } from './config.js';

export class Camera {
  constructor(viewW, viewH) {
    this.viewW  = viewW;
    this.viewH  = viewH;
    this._mapW  = 0;
    this._mapH  = 0;
    this.x      = 0;
    this.y      = 0;
  }

  // Called whenever the map changes or the window resizes.
  setMapBounds(mapPixelW, mapPixelH) {
    this._mapW = mapPixelW;
    this._mapH = mapPixelH;
  }

  resize(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
  }

  // Follow the player.
  // isCentered=true: the map is smaller than the screen — center it, no scroll.
  follow(playerPixelX, playerPixelY, isCentered = false) {
    if (isCentered) {
      // Negative camera.x/y means the map is drawn offset to the right/bottom.
      // Drawing: ctx.drawImage(img, -camera.x, -camera.y, ...)
      // So camera.x = -(offsetX) centers the map on screen.
      this.x = -Math.max(0, (this.viewW - this._mapW) / 2);
      this.y = -Math.max(0, (this.viewH - this._mapH) / 2);
      return;
    }

    const ts  = cfg.tileSize;
    this.x    = playerPixelX - this.viewW / 2 + ts / 2;
    this.y    = playerPixelY - this.viewH / 2 + ts / 2;

    const maxX = Math.max(0, this._mapW - this.viewW);
    const maxY = Math.max(0, this._mapH - this.viewH);
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  worldToScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  }
}
