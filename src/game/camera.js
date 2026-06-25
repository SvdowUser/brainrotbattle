export const TILE_SIZE = 32;

export class Camera {
  constructor(viewW, viewH, mapW, mapH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.mapW  = mapW  * TILE_SIZE;
    this.mapH  = mapH  * TILE_SIZE;
    this.x = 0;
    this.y = 0;
  }

  resize(viewW, viewH) { this.viewW = viewW; this.viewH = viewH; }

  follow(playerPixelX, playerPixelY) {
    this.x = playerPixelX - this.viewW / 2 + TILE_SIZE / 2;
    this.y = playerPixelY - this.viewH / 2 + TILE_SIZE / 2;
    this.x = Math.max(0, Math.min(this.x, this.mapW - this.viewW));
    this.y = Math.max(0, Math.min(this.y, this.mapH - this.viewH));
  }

  // Returns the world-space rect that is visible
  getVisibleTiles() {
    const startCol = Math.max(0, Math.floor(this.x / TILE_SIZE) - 1);
    const startRow = Math.max(0, Math.floor(this.y / TILE_SIZE) - 1);
    const endCol   = startCol + Math.ceil(this.viewW / TILE_SIZE) + 2;
    const endRow   = startRow + Math.ceil(this.viewH / TILE_SIZE) + 2;
    return { startCol, startRow, endCol, endRow };
  }

  worldToScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  }
}
