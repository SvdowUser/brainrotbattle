// Shared mutable config — import the object, read cfg.tileSize wherever TILE_SIZE was used.
// All files share the same reference so recalcTileSize() updates every consumer instantly.

export const cfg = { tileSize: 48 };

let _tileCache = null; // set by renderer to allow clearing on resize

export function setTileCache(cache) { _tileCache = cache; }

export function recalcTileSize() {
  const raw = Math.floor(window.innerWidth / 20);
  const next = Math.max(36, Math.min(raw, 52));
  if (next !== cfg.tileSize) {
    cfg.tileSize = next;
    if (_tileCache) {
      for (const k of Object.keys(_tileCache)) delete _tileCache[k];
    }
  }
  return next;
}
