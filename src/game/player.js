import { TILE_SIZE } from './camera.js';

const MOVE_SPEED = 3; // pixels per frame

export class Player {
  constructor(startX, startY) {
    this.tileX = startX;
    this.tileY = startY;
    this.pixelX = startX * TILE_SIZE;
    this.pixelY = startY * TILE_SIZE;
    this.targetX = this.pixelX;
    this.targetY = this.pixelY;
    this.direction = 'down'; // up down left right
    this.moving    = false;
    this._blocked  = false;
    this._moveRequest = null;
  }

  update(input, tilemap) {
    const arrived = this._moveTowardTarget();

    if (arrived) {
      this.moving = false;
      const mov = input.getMovement();
      let nx = this.tileX;
      let ny = this.tileY;

      if      (mov.up)    { ny--; this.direction = 'up';    }
      else if (mov.down)  { ny++; this.direction = 'down';  }
      else if (mov.left)  { nx--; this.direction = 'left';  }
      else if (mov.right) { nx++; this.direction = 'right'; }
      else                { return; }

      if (!tilemap.isBlocked(nx, ny)) {
        this.tileX  = nx;
        this.tileY  = ny;
        this.targetX = nx * TILE_SIZE;
        this.targetY = ny * TILE_SIZE;
        this.moving  = true;
        this._blocked = false;
      } else {
        this._blocked = true;
      }
    }
  }

  _moveTowardTarget() {
    const dx = this.targetX - this.pixelX;
    const dy = this.targetY - this.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= MOVE_SPEED) {
      this.pixelX = this.targetX;
      this.pixelY = this.targetY;
      return true;
    }
    this.pixelX += (dx / dist) * MOVE_SPEED;
    this.pixelY += (dy / dist) * MOVE_SPEED;
    return false;
  }

  // Returns tile in front of the player (for interaction)
  getFacingTile() {
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dx, dy] = dirs[this.direction];
    return { x: this.tileX + dx, y: this.tileY + dy };
  }

  setPosition(tileX, tileY) {
    this.tileX   = tileX;
    this.tileY   = tileY;
    this.pixelX  = tileX * TILE_SIZE;
    this.pixelY  = tileY * TILE_SIZE;
    this.targetX = this.pixelX;
    this.targetY = this.pixelY;
  }
}
