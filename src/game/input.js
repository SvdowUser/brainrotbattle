export class InputHandler {
  constructor() {
    this.keys = {};
    this._actionFired = false;
    this._dpad = { up: false, down: false, left: false, right: false };
    this._action = false;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp   = this._onKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }

  _onKeyDown(e) {
    this.keys[e.code] = true;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
      this._actionFired = true;
    }
    // Prevent page scroll with arrow keys in game
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) { this.keys[e.code] = false; }

  getMovement() {
    const up    = this.keys['ArrowUp']    || this.keys['KeyW'] || this._dpad.up;
    const down  = this.keys['ArrowDown']  || this.keys['KeyS'] || this._dpad.down;
    const left  = this.keys['ArrowLeft']  || this.keys['KeyA'] || this._dpad.left;
    const right = this.keys['ArrowRight'] || this.keys['KeyD'] || this._dpad.right;
    return { up, down, left, right };
  }

  isActionPressed() {
    if (this._actionFired) { this._actionFired = false; return true; }
    return false;
  }

  setDpad(dir, pressed) { this._dpad[dir] = pressed; }
  setAction(pressed)    { if (pressed && !this._action) this._actionFired = true; this._action = pressed; }
}
