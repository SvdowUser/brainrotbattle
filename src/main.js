import './styles/main.css';
import { showLanding, updateNavWalletButton } from './ui/landing.js';
import { showCharacterCreation }              from './ui/characterCreation.js';
import { showLeaderboard }                    from './ui/leaderboard.js';
import { showShop }                           from './ui/shop.js';
import { showDialogModal, showBrainDex,
         showOrbInventory }                   from './ui/modals.js';
import { showBattleScreen }                   from './ui/battleScreen.js';
import { GameEngine }                         from './game/engine.js';
import { rollEncounter }                      from './data/zones.js';
import { getBrainrodById }                    from './data/brainrods.js';
import { connectWallet, getConnectedWallet,
         getPlayerByWallet, savePlayerState,
         addCaughtBrainrod, loadPlayer }      from './playerService.js';

const state = {
  screen: 'landing',
  wallet: null,
  player: null,
  engine: null,
};

const root           = document.getElementById('root');
const gameCanvas     = document.getElementById('game-canvas');
const hudEl          = document.getElementById('hud');
const dpadEl         = document.getElementById('dpad');
const dpadActionWrap = document.getElementById('dpad-action-wrap');

// ── Boot ───────────────────────────────────────────────────────────────────────
function boot() {
  state.wallet = getConnectedWallet();
  state.player = state.wallet ? getPlayerByWallet(state.wallet) : null;
  goLanding();
}

// ── Screen helpers ─────────────────────────────────────────────────────────────
function hideGame() {
  gameCanvas.style.display     = 'none';
  hudEl.style.display          = 'none';
  dpadEl.style.display         = 'none';
  if (dpadActionWrap) dpadActionWrap.style.display = 'none';
  root.style.display           = 'block';
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
  stopGame(); state.screen = 'leaderboard'; hideGame();
  showLeaderboard(root, goLanding);
}

function goShop() {
  stopGame(); state.screen = 'shop'; hideGame();
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
    onInteract(inter) {
      const dexCount = state.player?.brainDex?.length ?? 0;
      if (inter.locked && dexCount < (inter.requiresDex ?? 0)) {
        const needed = inter.requiresDex ?? 1;
        showDialogModal('Locked', `${inter.name} requires BrainDex ${needed}+.\nYou have ${dexCount}/${needed}.`);
        return;
      }
      showDialogModal(inter.name || null, inter.text || '…');
    },
    onGrassEncounter(zone) {
      const wildId   = rollEncounter(zone);
      const wild     = getBrainrodById(wildId);
      if (!wild) return;

      // Determine player's starter for battle
      const starterId = state.player?.starterId ?? 1;
      const starter   = getBrainrodById(starterId) ?? getBrainrodById(1);

      state.engine?.stop();

      showBattleScreen(wild, starter, state.player, result => {
        if (result.caught && state.wallet && state.player) {
          addCaughtBrainrod(state.wallet, result.wildId);
          state.player = getPlayerByWallet(state.wallet);
          updateHUD();
          // Brief catch toast
          showToast(`🧠 ${wild.name} caught!`);
        }
        // Restart engine after battle
        if (state.screen === 'game') {
          state.engine = new GameEngine(gameCanvas, state.player, state.engine?.callbacks ?? {});
          // Re-create engine (avoids stale callbacks)
          goGame();
        }
      });
    },
    onSavePos(pos) {
      if (state.wallet && state.player) {
        savePlayerState(state.wallet, { position: pos });
      }
    },
  });
  state.engine.start();

  // Wire D-pad
  const input = state.engine.getInput();
  dpadEl.querySelectorAll('.dpad-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); input.setDpad(dir, true);  });
    btn.addEventListener('pointerup',   e => { e.preventDefault(); input.setDpad(dir, false); });
    btn.addEventListener('pointerleave',e => { input.setDpad(dir, false); });
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

// ── Connect + Play ─────────────────────────────────────────────────────────────
function handleConnect() {
  state.wallet = connectWallet();
  state.player = getPlayerByWallet(state.wallet);
  updateNavWalletButton(root, state.player, state.wallet);
  if (!state.player) {
    showCharacterCreation(root, state.wallet, player => {
      state.player = player;
      goGame();
    });
  } else {
    goGame();
  }
}

function handlePlay() {
  if (!state.wallet) { goGame(); return; } // demo mode
  if (!state.player) {
    showCharacterCreation(root, state.wallet, player => {
      state.player = player;
      goGame();
    });
    return;
  }
  goGame();
}

// ── HUD ────────────────────────────────────────────────────────────────────────
function updateHUD() {
  const p = state.player;
  const get = id => document.getElementById(id);
  if (get('hud-name')) get('hud-name').textContent = p ? p.username : 'Demo';
  if (get('hud-gold')) get('hud-gold').textContent = p ? `${p.brainGold} $BRACK` : '—';
  if (get('hud-dex'))  get('hud-dex').textContent  = p ? `${p.brainDex.length}/20` : '0/20';
  if (get('hud-orbs')) get('hud-orbs').textContent = p ? `🧠 ${p.orbs.brain}` : '🧠 0';
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'catch-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-show'));
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 400); }, 2000);
}

// ── HUD listeners ──────────────────────────────────────────────────────────────
document.getElementById('hud-home-btn')?.addEventListener('click', goLanding);
document.getElementById('hud-dex-btn')?.addEventListener('click',  () => showBrainDex(state.player, () => {}));
document.getElementById('hud-orb-btn')?.addEventListener('click',  () => showOrbInventory(state.player, () => {}));
document.getElementById('hud-shop-btn')?.addEventListener('click', goShop);

document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code) && state.screen === 'game') {
    e.preventDefault();
  }
}, { passive: false });

boot();
