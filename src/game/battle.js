// Battle state machine — pure logic, no DOM.

export class BattleState {
  constructor(wildBrainwod, playerStarter) {
    this.wild = { ...wildBrainwod, currentHP: wildBrainwod.hp };
    this.mine = { ...playerStarter, currentHP: playerStarter.hp };
    this.phase = 'playerTurn'; // playerTurn | animating | caught | fled | escaped | fainted
    this.log   = []; // latest messages, oldest first
    this.orbsThrown = 0;
    this.turn = 0;
    this.lastAction = null;
  }

  pushLog(msg) {
    this.log.push(msg);
    if (this.log.length > 4) this.log.shift();
  }

  // ── Player actions ────────────────────────────────────────────────────────────
  attack() {
    if (this.phase !== 'playerTurn') return;
    this.lastAction = 'attack';
    this.phase = 'animating';

    const dmg = this._calcDmg(this.mine.atk, this.wild.hp);
    this.wild.currentHP = Math.max(0, this.wild.currentHP - dmg);
    this.pushLog(`${this.mine.name} attacks for ${dmg} damage!`);

    if (this.wild.currentHP <= 0) {
      this.pushLog(`${this.wild.name} fainted!`);
      this.phase = 'fainted'; // wild fainted — no catch possible
      return;
    }
    this._wildCounterAttack();
  }

  throwOrb() {
    if (this.phase !== 'playerTurn') return;
    this.lastAction = 'catch';
    this.phase = 'animating';
    this.orbsThrown++;

    const hpRatio = this.wild.currentHP / this.wild.hp;
    const base    = this.wild.catchRate ?? 0.35;
    // Catching is easier when HP is lower; hard when healthy
    const chance  = base * (2 - hpRatio) * 0.6;

    if (Math.random() < chance) {
      this.pushLog(`Gotcha! ${this.wild.name} was caught!`);
      this.phase = 'caught';
      return;
    }

    this.pushLog(`${this.wild.name} broke free!`);

    // Flee chance after failed catch — higher HP = higher flee chance
    const fleeChance = 0.20 + hpRatio * 0.45;
    if (Math.random() < fleeChance) {
      this.pushLog(`${this.wild.name} fled!`);
      this.phase = 'fled';
      return;
    }
    this._wildCounterAttack();
  }

  flee() {
    if (this.phase !== 'playerTurn') return;
    this.lastAction = 'flee';
    this.phase = 'escaped';
    this.pushLog('Got away safely!');
  }

  // Call this after the animation frame to let the player act again
  resumePlayerTurn() {
    if (this.phase === 'animating') this.phase = 'playerTurn';
  }

  // ── Internal ──────────────────────────────────────────────────────────────────
  _calcDmg(atk, opponentMaxHP) {
    // Damage scaled to feel meaningful but not instant-kill
    const base = Math.max(1, Math.floor(atk * 0.55 * (0.85 + Math.random() * 0.3)));
    return base;
  }

  _wildCounterAttack() {
    this.turn++;
    const dmg = this._calcDmg(this.wild.atk * 0.45, this.mine.hp);
    this.mine.currentHP = Math.max(0, this.mine.currentHP - dmg);
    this.pushLog(`${this.wild.name} attacks back for ${dmg}!`);

    if (this.mine.currentHP <= 0) {
      this.pushLog(`${this.mine.name} fainted...`);
      this.mine.currentHP = 1; // revive at 1 HP for UX (no game-over state)
      this.phase = 'escaped';
    } else {
      this.phase = 'playerTurn';
    }
  }

  get isDone() {
    return ['caught','fled','escaped','fainted'].includes(this.phase);
  }
  get caught() { return this.phase === 'caught'; }
  get failed() { return this.phase === 'fled' || this.phase === 'fainted'; }
}
