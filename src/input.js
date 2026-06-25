export class InputController {
  constructor(element) {
    this.element = element;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.threshold = 30; // minimum swipe distance

    this.onSwipeLeft = null;
    this.onSwipeRight = null;
    this.onSwipeUp = null;
    this.onSwipeDown = null;

    // Touch events
    element.addEventListener('pointerdown', this.onStart, { passive: false });
    element.addEventListener('pointerup', this.onEnd, { passive: false });

    // Keyboard for desktop testing
    window.addEventListener('keydown', this.onKey);
  }

  onStart = (e) => {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = performance.now();
  };

  onEnd = (e) => {
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const dt = performance.now() - this.startTime;

    // Quick tap = jump
    if (Math.abs(dx) < this.threshold && Math.abs(dy) < this.threshold && dt < 200) {
      if (this.onSwipeUp) this.onSwipeUp();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > this.threshold && this.onSwipeRight) this.onSwipeRight();
      else if (dx < -this.threshold && this.onSwipeLeft) this.onSwipeLeft();
    } else {
      // Vertical swipe
      if (dy < -this.threshold && this.onSwipeUp) this.onSwipeUp();
      else if (dy > this.threshold && this.onSwipeDown) this.onSwipeDown();
    }
  };

  onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      if (this.onSwipeLeft) this.onSwipeLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      if (this.onSwipeRight) this.onSwipeRight();
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      if (this.onSwipeUp) this.onSwipeUp();
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      if (this.onSwipeDown) this.onSwipeDown();
    }
  };
}
