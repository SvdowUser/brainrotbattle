import { ZONES, getZoneById, getHuntCooldownRemaining, markHuntUsed, rollEncounter } from '../data/zones.js';
import { BRAINRODS, RARITY_COLORS, getBrainrodById }                                  from '../data/brainrods.js';

// ─── Generic modal wrapper ───────────────────────────────────────────────────
export function createModal(content, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal-box">${content}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); onClose?.(); } });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  return overlay;
}

function closeModal(overlay, onClose) {
  overlay.classList.remove('visible');
  setTimeout(() => { overlay.remove(); onClose?.(); }, 200);
}

// ─── NPC / Sign dialog ───────────────────────────────────────────────────────
export function showDialogModal(title, text, onClose) {
  const html = `
    <div class="modal-dialog">
      ${title ? `<div class="modal-dialog-title">${title}</div>` : ''}
      <div class="modal-dialog-text">${text.replace(/\n/g, '<br>')}</div>
      <button class="btn-modal-close">Close</button>
    </div>`;
  const overlay = createModal(html, onClose);
  overlay.querySelector('.btn-modal-close').addEventListener('click', () => closeModal(overlay, onClose));
}

// ─── Zone hunt modal ─────────────────────────────────────────────────────────
export function showZoneModal(zoneId, playerData, onHunt, onClose) {
  const zone = getZoneById(zoneId);
  if (!zone) return;

  const cooldown  = getHuntCooldownRemaining(zoneId);
  const freeReady = cooldown <= 0;
  const cdText    = freeReady ? 'Ready!' : formatCountdown(cooldown);

  const rarRows = Object.entries(zone.rarityBreakdown).map(([r, pct]) => `
    <div class="rarity-row">
      <span class="rarity-badge" style="background:${RARITY_COLORS[r]}">${r}</span>
      <div class="rarity-bar-wrap"><div class="rarity-bar-fill" style="width:${pct};background:${RARITY_COLORS[r]}"></div></div>
      <span class="rarity-pct">${pct}</span>
    </div>`).join('');

  const html = `
    <div class="zone-modal">
      <div class="zone-modal-name">${zone.name}</div>
      <div class="zone-modal-desc">${zone.description}</div>
      <div class="zone-rarity-list">${rarRows}</div>
      <div class="zone-cd">Free hunt: <strong class="${freeReady ? 'cd-ready' : 'cd-wait'}">${cdText}</strong></div>
      <div class="zone-actions">
        <button class="btn-hunt-free ${freeReady ? '' : 'disabled'}" ${freeReady ? '' : 'disabled'}>
          Hunt (Free)
        </button>
        <button class="btn-hunt-extra">
          Extra Hunt &nbsp;·&nbsp; ${zone.extraHuntCost} $BRACK
        </button>
      </div>
      <button class="btn-zone-close">✕ Leave</button>
    </div>`;

  const overlay = createModal(html, onClose);

  overlay.querySelector('.btn-hunt-free').addEventListener('click', () => {
    if (!freeReady) return;
    markHuntUsed(zoneId);
    closeModal(overlay);
    const encounterId = rollEncounter(zone);
    showEncounterModal(encounterId, playerData, onHunt, onClose);
  });

  overlay.querySelector('.btn-hunt-extra').addEventListener('click', () => {
    closeModal(overlay);
    const encounterId = rollEncounter(zone);
    showEncounterModal(encounterId, playerData, onHunt, onClose);
  });

  overlay.querySelector('.btn-zone-close').addEventListener('click', () => closeModal(overlay, onClose));
}

// ─── Encounter modal ─────────────────────────────────────────────────────────
function showEncounterModal(brainrodId, playerData, onCatch, onClose) {
  const b = getBrainrodById(brainrodId);
  if (!b) return;

  const rc = RARITY_COLORS[b.rarity];
  const orbsAvail = playerData?.orbs?.brain ?? 0;

  const html = `
    <div class="encounter-modal">
      <div class="encounter-title">Wild <span style="color:${b.color}">${b.name}</span> appeared!</div>
      <div class="encounter-sprite-wrap">
        <canvas id="encounter-canvas" width="120" height="120"></canvas>
      </div>
      <div class="encounter-rarity" style="color:${rc}">${b.rarity.toUpperCase()}</div>
      <div class="encounter-type">Type: ${b.type}</div>
      <div class="encounter-desc">${b.desc}</div>
      <div class="encounter-orbs">Brain Orbs: <strong>${orbsAvail}</strong></div>
      <div class="encounter-actions">
        <button class="btn-catch" ${orbsAvail <= 0 ? 'disabled' : ''}>
          Throw Brain Orb 🧠
        </button>
        <button class="btn-flee">Flee</button>
      </div>
    </div>`;

  const overlay = createModal(html, onClose);

  // Animate brainrod in canvas
  const ec = overlay.querySelector('#encounter-canvas');
  if (ec) {
    const ectx = ec.getContext('2d');
    let ef = 0;
    const anim = () => {
      if (!document.body.contains(ec)) return;
      ectx.clearRect(0, 0, 120, 120);
      const pulse = Math.sin(ef * 0.08) * 5;
      const r = 35 + pulse;
      ectx.shadowColor = b.color; ectx.shadowBlur = 20;
      ectx.fillStyle = b.color;
      ectx.beginPath(); ectx.arc(60, 60, r, 0, Math.PI * 2); ectx.fill();
      ectx.fillStyle = b.color2;
      ectx.beginPath(); ectx.arc(60 - r * 0.2, 60 - r * 0.2, r * 0.4, 0, Math.PI * 2); ectx.fill();
      ectx.fillStyle = '#fff'; ectx.globalAlpha = 0.5;
      ectx.beginPath(); ectx.arc(60 - r * 0.3, 60 - r * 0.35, r * 0.25, 0, Math.PI * 2); ectx.fill();
      ectx.globalAlpha = 1;
      ef++;
      requestAnimationFrame(anim);
    };
    anim();
  }

  overlay.querySelector('.btn-catch').addEventListener('click', () => {
    const success = Math.random() < (b.rarity === 'legendary' ? 0.15 : b.rarity === 'epic' ? 0.35 : b.rarity === 'rare' ? 0.6 : 0.85);
    closeModal(overlay);
    showCatchResultModal(b, success, onCatch, onClose);
  });

  overlay.querySelector('.btn-flee').addEventListener('click', () => closeModal(overlay, onClose));
}

// ─── Catch result ─────────────────────────────────────────────────────────────
function showCatchResultModal(brainrod, success, onCatch, onClose) {
  const html = `
    <div class="catch-result ${success ? 'success' : 'fail'}">
      <div class="catch-result-icon">${success ? '✓' : '✗'}</div>
      <div class="catch-result-title">${success ? 'Caught!' : 'It escaped!'}</div>
      <div class="catch-result-name" style="color:${brainrod.color}">${brainrod.name}</div>
      ${success ? `<div class="catch-result-msg">${brainrod.name} has been added to your BrainDex!</div>` : '<div class="catch-result-msg">Better luck next time. Try a Glitch Orb for better odds.</div>'}
      <button class="btn-modal-close">Continue</button>
    </div>`;
  const overlay = createModal(html, onClose);
  if (success) onCatch?.(brainrod.id);
  overlay.querySelector('.btn-modal-close').addEventListener('click', () => closeModal(overlay, onClose));
}

// ─── Orb inventory ────────────────────────────────────────────────────────────
export function showOrbInventory(playerData, onClose) {
  const orbs = playerData?.orbs || { brain: 0, glitch: 0, rare: 0 };
  const html = `
    <div class="orb-modal">
      <div class="modal-title">Orb Inventory</div>
      <div class="orb-list">
        <div class="orb-row"><span class="orb-icon" style="background:#E91E63">🧠</span><span>Brain Orb</span><span class="orb-count">${orbs.brain}</span></div>
        <div class="orb-row"><span class="orb-icon" style="background:#9C27B0">⚡</span><span>Glitch Orb</span><span class="orb-count">${orbs.glitch}</span></div>
        <div class="orb-row"><span class="orb-icon" style="background:#FF9800">💎</span><span>Rare Orb</span><span class="orb-count">${orbs.rare}</span></div>
      </div>
      <div class="orb-note">Orbs are used to capture wild Brainrods.<br>Buy more at the Orb Shop in town.</div>
      <button class="btn-modal-close">Close</button>
    </div>`;
  const overlay = createModal(html, onClose);
  overlay.querySelector('.btn-modal-close').addEventListener('click', () => closeModal(overlay, onClose));
}

// ─── BrainDex modal ───────────────────────────────────────────────────────────
export function showBrainDex(playerData, onClose) {
  const caught = playerData?.brainDex || [];
  const total  = BRAINRODS.length;
  const rows   = BRAINRODS.map(b => {
    const have = caught.includes(b.id);
    return `<div class="dex-entry ${have ? 'caught' : 'missing'}">
      <span class="dex-num">#${String(b.id).padStart(3,'0')}</span>
      <div class="dex-color-dot" style="background:${have ? b.color : '#444'}"></div>
      <span class="dex-name">${have ? b.name : '???'}</span>
      <span class="dex-rarity" style="color:${RARITY_COLORS[b.rarity]}">${b.rarity}</span>
    </div>`;
  }).join('');

  const html = `
    <div class="dex-modal">
      <div class="modal-title">BrainDex <span class="dex-progress">${caught.length}/${total}</span></div>
      <div class="dex-bar"><div class="dex-bar-fill" style="width:${(caught.length/total*100).toFixed(1)}%"></div></div>
      <div class="dex-list">${rows}</div>
      <button class="btn-modal-close">Close</button>
    </div>`;
  const overlay = createModal(html, onClose);
  overlay.querySelector('.btn-modal-close').addEventListener('click', () => closeModal(overlay, onClose));
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatCountdown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}
