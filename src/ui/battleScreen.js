import { BattleState }       from '../game/battle.js';
import { getBrainrodById }   from '../data/brainrods.js';

// Pokémon-style fullscreen battle overlay.
// Renders creature sprites on two small canvases, HP bars, and action menu.

let _el      = null; // current overlay element
let _animId  = null; // rAF for sprite animation
let _frame   = 0;

export function showBattleScreen(wildBrainwod, playerStarter, playerData, onResult) {
  if (_el) _el.remove();

  const battle = new BattleState(wildBrainwod, playerStarter);
  _frame = 0;

  _el = document.createElement('div');
  _el.id = 'battle-screen';
  _el.innerHTML = `
    <div class="bs-bg">
      <div class="bs-platform bs-platform-enemy"></div>
      <div class="bs-platform bs-platform-player"></div>
    </div>

    <div class="bs-enemy-info">
      <div class="bs-name" id="bs-ename"></div>
      <div class="bs-rarity" id="bs-erarity"></div>
      <div class="bs-hpbar-wrap">
        <div class="bs-hpbar-fill" id="bs-ehp-fill"></div>
      </div>
      <div class="bs-hptext" id="bs-ehp-text"></div>
    </div>

    <canvas id="bs-enemy-canvas" class="bs-canvas bs-canvas-enemy"></canvas>

    <canvas id="bs-player-canvas" class="bs-canvas bs-canvas-player"></canvas>

    <div class="bs-player-info">
      <div class="bs-name" id="bs-pname"></div>
      <div class="bs-hpbar-wrap">
        <div class="bs-hpbar-fill bs-hpbar-green" id="bs-php-fill"></div>
      </div>
      <div class="bs-hptext" id="bs-php-text"></div>
    </div>

    <div class="bs-bottom">
      <div class="bs-msg" id="bs-msg"></div>
      <div class="bs-actions" id="bs-actions">
        <button class="bs-btn bs-btn-fight"  data-act="fight">⚔ FIGHT</button>
        <button class="bs-btn bs-btn-catch"  data-act="catch">🧠 CATCH</button>
        <button class="bs-btn bs-btn-flee"   data-act="flee" >🏃 RUN</button>
      </div>
    </div>`;

  document.body.appendChild(_el);
  requestAnimationFrame(() => _el.classList.add('bs-visible'));

  // Wire action buttons
  _el.querySelectorAll('.bs-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAction(btn.dataset.act));
  });

  // Initial render
  updateUI(battle);
  startAnimation(battle, wildBrainwod, playerStarter);

  // Open message
  showMsg(`A wild ${wildBrainwod.name} appeared!`);

  function handleAction(act) {
    if (battle.isDone) return;
    if (battle.phase !== 'playerTurn') return;

    if (act === 'fight') battle.attack();
    else if (act === 'catch') battle.throwOrb();
    else if (act === 'flee') battle.flee();

    updateUI(battle);
    showMsg(battle.log[battle.log.length - 1] || '');

    if (battle.isDone) {
      setTimeout(() => close(battle, onResult), 1400);
    }
  }
}

function updateUI(battle) {
  if (!_el) return;

  // Enemy HP
  const ePct = Math.max(0, battle.wild.currentHP / battle.wild.hp * 100);
  const eFill = _el.querySelector('#bs-ehp-fill');
  if (eFill) {
    eFill.style.width = ePct + '%';
    eFill.style.background = ePct > 50 ? '#4caf50' : ePct > 25 ? '#ff9800' : '#f44336';
  }
  setText('bs-ename',    battle.wild.name);
  setText('bs-erarity',  battle.wild.rarity.toUpperCase());
  setText('bs-ehp-text', `${battle.wild.currentHP}/${battle.wild.hp}`);
  setText('bs-erarity',  battle.wild.rarity.toUpperCase());

  // Player HP
  const pPct = Math.max(0, battle.mine.currentHP / battle.mine.hp * 100);
  const pFill = _el.querySelector('#bs-php-fill');
  if (pFill) {
    pFill.style.width = pPct + '%';
    pFill.style.background = pPct > 50 ? '#4caf50' : pPct > 25 ? '#ff9800' : '#f44336';
  }
  setText('bs-pname',    battle.mine.name);
  setText('bs-php-text', `${battle.mine.currentHP}/${battle.mine.hp} HP`);

  // Rarity color badge
  const rarityEl = _el.querySelector('#bs-erarity');
  if (rarityEl) {
    const colors = { common:'#78909c', uncommon:'#2e7d32', rare:'#1565c0', epic:'#6a1b9a', legendary:'#e65100' };
    rarityEl.style.color = colors[battle.wild.rarity] || '#fff';
  }

  // Disable buttons when not player's turn or done
  const btns = _el.querySelectorAll('.bs-btn');
  const disabled = battle.phase !== 'playerTurn';
  btns.forEach(b => { b.disabled = disabled; b.style.opacity = disabled ? '0.5' : '1'; });
}

function showMsg(text) {
  const el = document.getElementById('bs-msg');
  if (el) el.textContent = text;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function startAnimation(battle, wildBrainwod, playerStarter) {
  const eCanvas = document.getElementById('bs-enemy-canvas');
  const pCanvas = document.getElementById('bs-player-canvas');
  if (!eCanvas || !pCanvas) return;

  function loop() {
    if (!_el) return;
    _frame++;

    // Enemy canvas
    const eCtx = eCanvas.getContext('2d');
    eCtx.clearRect(0, 0, eCanvas.width, eCanvas.height);

    // Shake animation on hit
    const shakeX = (battle.lastAction === 'fight' && battle.phase === 'animating') ? Math.sin(_frame * 1.5) * 4 : 0;

    wildBrainwod.draw(eCtx, eCanvas.width/2 + shakeX, eCanvas.height/2, Math.min(eCanvas.width, eCanvas.height) * .88, _frame);

    // Caught flash
    if (battle.phase === 'caught') {
      eCtx.fillStyle = `rgba(255,220,50,${Math.abs(Math.sin(_frame * .3)) * .6})`;
      eCtx.beginPath(); eCtx.arc(eCanvas.width/2, eCanvas.height/2, eCanvas.width*.48, 0, Math.PI*2); eCtx.fill();
    }

    // Player canvas — draw starter brainwod from back (slightly tinted)
    const pCtx = pCanvas.getContext('2d');
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    // Draw a "back view" silhouette of the starter (simplified)
    drawPlayerSide(pCtx, playerStarter, pCanvas.width/2, pCanvas.height/2, Math.min(pCanvas.width, pCanvas.height) * .80, _frame);

    _animId = requestAnimationFrame(loop);
  }

  loop();
}

function drawPlayerSide(ctx, starter, cx, cy, sz, f) {
  // Draw starter from "back" with blue tint to indicate it's yours
  ctx.save();
  ctx.scale(-0.75, 0.75); // flip and shrink for "back view"
  const tx = -cx * (1/0.75) - cx * 0.25 / 0.75;
  ctx.translate(tx, 0);
  starter.draw(ctx, cx, cy, sz, f);
  ctx.restore();
  // "Your Brainwod" indicator
  ctx.fillStyle = 'rgba(0,200,255,0.15)';
  ctx.beginPath(); ctx.ellipse(cx, cy + sz*.42, sz*.32, sz*.10, 0, 0, Math.PI*2); ctx.fill();
}

function close(battle, onResult) {
  if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
  if (_el) {
    _el.classList.remove('bs-visible');
    setTimeout(() => { _el?.remove(); _el = null; }, 300);
  }
  onResult?.({
    caught:  battle.caught,
    fled:    battle.failed,
    escaped: battle.phase === 'escaped',
    wildId:  battle.wild.id,
  });
}
