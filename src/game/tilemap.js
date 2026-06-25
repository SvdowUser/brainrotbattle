import { MAP_DATA, MAP_WIDTH, MAP_HEIGHT, BLOCKED_TILES, INTERACTABLES } from '../data/mapData.js';

export class Tilemap {
  constructor() {
    this.data   = MAP_DATA;
    this.width  = MAP_WIDTH;
    this.height = MAP_HEIGHT;
  }

  getTile(col, row) {
    if (col < 0 || row < 0 || col >= this.width || row >= this.height) return 2; // treat OOB as tree
    return this.data[row][col];
  }

  isBlocked(col, row) {
    return BLOCKED_TILES.has(this.getTile(col, row));
  }

  getInteractable(col, row) {
    return INTERACTABLES.find(i => i.x === col && i.y === row) || null;
  }

  // Returns any zone-type interactable at (col, row)
  getZoneTrigger(col, row) {
    return INTERACTABLES.find(i => i.type === 'zone' && i.x === col && i.y === row) || null;
  }
}
