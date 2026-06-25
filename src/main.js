import './styles/main.css';
import { showLanding, updateNavWalletButton }  from './ui/landing.js';
import { showCharacterCreation }               from './ui/characterCreation.js';
import { showLeaderboard }                     from './ui/leaderboard.js';
import { showShop }                            from './ui/shop.js';
import { showZoneModal, showDialogModal,
         showBrainDex, showOrbInventory }      from './ui/modals.js';
import { GameEngine }                          from './game/engine.js';
import { connectWallet, getConnectedWallet,
         getPlayerByWallet, savePlayerState,
         addCaughtBrainrod }                   from './playerService.js';

// ─── App State ────────────────────────────────────────────────────────────────
const state = {
  screen: 'landing',
  wallet: null,
  player: null,
  engine: null,
};

const root          = document.getElementById('root');
const gameCanvas    = document.getElementById('game-canvas');
const hudEl         = document.getElementById('hud');
const dpadEl        = document.getElementById('dpad');
const dpadActionWrap= document.getElementById('dpad-action-wrap');

// ─── Boot ─────────────────────────────────────────────────────────────────────
function boot() {
  state.wallet = getConnectedWallet();
  state.player = state.wallet ? getPlayerByWallet(state.wallet) : null;
  goLanding();
}

// ─── Screen transitions ───────────────────────────────────────────────────────
function hideGame() {
  gameCanvas.style.display    = 'none';
  hudEl.style.display         = 'none';
  dpadEl.style.display        = 'none';
  if (dpadActionWrap) dpadActionWrap.style.display = 'none';
  root.style.display          = 'block';
}

function goLanding() {
  stopGame();
  state.screen = 'landing';
  hideGame();

  showLanding(root, {
    onPlay:        handlePlay,
    onConnect:     handleConnect,
    onLeaderboard: goLeaderboard,
    onShop:        goShop,
    onDex:         () => showBrainDex(state.player, () => {}),
  });
  updateNavWalletButton(root, state.player, state.wallet);
}

function goLeaderboard() {
  stopGame();
  state.screen = 'leaderboard';
  hideGame();
  showLeaderboard(root, goLanding);
}

function goShop() {
  stopGame();
  state.screen = 'shop';
  hideGame();
  showShop(root, state.player, goLanding);
}

function goGame() {
  state.screen = 'game';
  root.style.display       = 'none';
  gameCanvas.style.display = 'block';
  hudEl.style.display      = 'flex';
  dpadEl.style.display     = 'block';
  if (dpadActionWrap) dpadActionWrap.style.display = 'block';
  updateHUD();

  state.engine = new GameEngine(gameCanvas, state.player, {
    onInteract(interactable) {
      if (interactable.type === 'zone') {
        openZoneModal(interactable.zoneId);
      } else {
        showDialogModal(interactable.name || null, interactable.text || '...');
      }
    },
    onZoneEnter(trigger) { openZoneModal(trigger.zoneId); },
    onSavePos(pos) {
      if (state.wallet && state.player) {
        savePlayerState(state.wallet, { position: pos });
      }
    },
  });
  state.engine.start();

  // Wire D-pad after engine is ready
  const input = state.engine.getInput();
  dpadEl.querySelectorAll('.dpad-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); input.setDpad(dir, true);  });
    btn.addEventListener('pointerup',   e => { e.preventDefault(); input.setDpad(dir, false); });
    btn.addEventListener('pointerleave',e => {                      input.setDpad(dir, false); });
  });
  const actionBtn = document.getElementById('dpad-action');
  if (actionBtn) {
    actionBtn.addEventListener('pointerdown', e => { e.preventDefault(); input.setAction(true);  });
    actionBtn.addEventListener('pointerup',   e => { e.preventDefault(); input.setAction(false); });
  }
}

function stopGame() {
  if (state.engine) { state.engine.stop(); state.engine = null; }
}

// ─── Connect + Play flow ──────────────────────────────────────────────────────
function handleConnect() {
  state.wallet = connectWallet();
  state.player = getPlayerByWallet(state.wallet);
  updateNavWalletButton(root, state.player, state.wallet);
  if (!state.player) {
    showCharacterCreation(root, state.wallet, player => {
      state.player = player;
      goGame();
    });
  }
}

function handlePlay() {
  if (!state.wallet) {
    goGame(); // demo mode
    return;
  }
  if (!state.player) {
    showCharacterCreation(root, state.wallet, player => {
      state.player = player;
      goGame();
    });
    return;
  }
  goGame();
}

// ─── Zone modal ───────────────────────────────────────────────────────────────
function openZoneModal(zoneId) {
  if (state.engine) state.engine.stop();
  showZoneModal(zoneId, state.player, brainrodId => {
    if (state.wallet && state.player) {
      addCaughtBrainrod(state.wallet, brainrodId);
      state.player = getPlayerByWallet(state.wallet);
      updateHUD();
    }
  }, () => {
    if (state.engine) state.engine.start();
  });
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  const p = state.player;
  const nameEl = document.getElementById('hud-name');
  const goldEl = document.getElementById('hud-gold');
  const dexEl  = document.getElementById('hud-dex');
  const orbEl  = document.getElementById('hud-orbs');
  if (nameEl) nameEl.textContent = p ? p.username : 'Demo';
  if (goldEl) goldEl.textContent = p ? `${p.brainGold} $BRACK` : '—';
  if (dexEl)  dexEl.textContent  = p ? `${p.brainDex.length}/20` : '0/20';
  if (orbEl)  orbEl.textContent  = p ? `🧠 ${p.orbs.brain}` : '🧠 0';
}

// ─── HUD button listeners ─────────────────────────────────────────────────────
document.getElementById('hud-home-btn')?.addEventListener('click', goLanding);
document.getElementById('hud-dex-btn')?.addEventListener('click',  () => showBrainDex(state.player, () => {}));
document.getElementById('hud-orb-btn')?.addEventListener('click',  () => showOrbInventory(state.player, () => {}));
document.getElementById('hud-shop-btn')?.addEventListener('click', goShop);

// Prevent page scroll on arrow keys globally
document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)
    && state.screen === 'game') {
    e.preventDefault();
  }
}, { passive: false });

boot();
