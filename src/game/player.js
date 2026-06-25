import { cfg } from './config.js';

const BASE_MOVE_SPEED = 4; // pixels per frame at tileSize=48

export class Player {
  constructor(startX, startY) {
    this.tileX = startX;
    this.tileY = startY;
    this.pixelX = startX * cfg.tileSize;
    this.pixelY = startY * cfg.tileSize;
    this.targetX = this.pixelX;
    this.targetY = this.pixelY;
    this.direction = 'down';
    this.moving    = false;
    this._justMoved = false; // fires once per tile step
  }

  update(input, tilemap) {
    const ts = cfg.tileSize;
    const moveSpeed = BASE_MOVE_SPEED * (ts / 48);
    const arrived = this._moveTowardTarget(moveSpeed);
    this._justMoved = false;

    if (arrived) {
      this.moving = false;
      const mov = input.getMovement();
      let nx = this.tileX, ny = this.tileY;

      if      (mov.up)    { ny--; this.direction = 'up';    }
      else if (mov.down)  { ny++; this.direction = 'down';  }
      else if (mov.left)  { nx--; this.direction = 'left';  }
      else if (mov.right) { nx++; this.direction = 'right'; }
      else return;

      if (!tilemap.isBlocked(nx, ny)) {
        this.tileX  = nx;
        this.tileY  = ny;
        this.targetX = nx * ts;
        this.targetY = ny * ts;
        this.moving  = true;
        this._justMoved = true;
      }
    }
  }

  _moveTowardTarget(speed) {
    const dx = this.targetX - this.pixelX;
    const dy = this.targetY - this.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= speed) {
      this.pixelX = this.targetX;
      this.pixelY = this.targetY;
      return true;
    }
    this.pixelX += (dx / dist) * speed;
    this.pixelY += (dy / dist) * speed;
    return false;
  }

  getFacingTile() {
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dx, dy] = dirs[this.direction];
    return { x: this.tileX + dx, y: this.tileY + dy };
  }

  setPosition(tileX, tileY) {
    this.tileX   = tileX;
    this.tileY   = tileY;
    this.pixelX  = tileX * cfg.tileSize;
    this.pixelY  = tileY * cfg.tileSize;
    this.targetX = this.pixelX;
    this.targetY = this.pixelY;
  }
}
