import { isUsernameAvailable, createPlayer } from '../playerService.js';
import { BRAINRODS } from '../data/brainrods.js';

const STARTERS = [
  { id: 1, name: 'Fizzpup',   type: 'Fire',  color: '#FF6B35', desc: 'Energetic and bold. Perfect for trainers who love speed.' },
  { id: 4, name: 'Zapwing',   type: 'Wind',  color: '#FFD60A', desc: 'Quick and sharp. Loves to dart ahead and scout new paths.' },
  { id: 2, name: 'Bubblog',   type: 'Water', color: '#00B4D8', desc: 'Calm and steady. A loyal partner who never gives up.' },
];

export function showCharacterCreation(container, wallet, onComplete) {
  container.innerHTML = '';
  let selectedStarter = STARTERS[0].id;

  const el = document.createElement('div');
  el.className = 'char-creation-screen';
  el.innerHTML = `
    <div class="char-creation-box">
      <div class="char-creation-logo">BRAINROCK<br><span>BATTLE</span></div>
      <div class="char-creation-step">Choose Your Trainer Identity</div>

      <div class="char-field-wrap">
        <label class="char-label">Trainer Name</label>
        <input id="cc-username" class="char-input" type="text" placeholder="3–16 characters" maxlength="16" autocomplete="off" />
        <div id="cc-username-msg" class="char-field-msg"></div>
      </div>

      <div class="char-label" style="margin-top:20px">Choose Your Starter</div>
      <div class="starter-grid" id="cc-starters">
        ${STARTERS.map(s => `
          <div class="starter-card ${s.id === selectedStarter ? 'selected' : ''}" data-id="${s.id}">
            <canvas class="starter-canvas" data-id="${s.id}" width="80" height="80"></canvas>
            <div class="starter-name" style="color:${s.color}">${s.name}</div>
            <div class="starter-type">${s.type}</div>
            <div class="starter-desc">${s.desc}</div>
          </div>`).join('')}
      </div>

      <button id="cc-save-btn" class="btn-primary" disabled>Create Trainer</button>
      <div class="char-wallet-note">Wallet: ${wallet.slice(0,8)}...${wallet.slice(-4)}</div>
    </div>`;

  container.appendChild(el);

  // Draw starter sprites
  STARTERS.forEach(s => {
    const brainrod = BRAINRODS.find(b => b.id === s.id);
    const canvas   = el.querySelector(`.starter-canvas[data-id="${s.id}"]`);
    if (!canvas || !brainrod) return;
    const ctx = canvas.getContext('2d');
    let f = 0;
    const anim = () => {
      if (!document.body.contains(canvas)) return;
      ctx.clearRect(0, 0, 80, 80);
      const pulse = Math.sin(f * 0.08) * 3;
      const r = 25 + pulse;
      ctx.shadowColor = brainrod.color; ctx.shadowBlur = 12;
      ctx.fillStyle = brainrod.color;
      ctx.beginPath(); ctx.arc(40, 40, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = brainrod.color2;
      ctx.beginPath(); ctx.arc(40 - r * 0.2, 40 - r * 0.2, r * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(40 - r * 0.3, 40 - r * 0.35, r * 0.25, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      f++;
      requestAnimationFrame(anim);
    };
    anim();
  });

  // Starter selection
  el.querySelector('#cc-starters').addEventListener('click', e => {
    const card = e.target.closest('.starter-card');
    if (!card) return;
    selectedStarter = parseInt(card.dataset.id, 10);
    el.querySelectorAll('.starter-card').forEach(c =>
      c.classList.toggle('selected', parseInt(c.dataset.id, 10) === selectedStarter));
  });

  // Username validation (debounced)
  const input  = el.querySelector('#cc-username');
  const msg    = el.querySelector('#cc-username-msg');
  const saveBtn= el.querySelector('#cc-save-btn');
  let debounce = null;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const val = input.value.trim();
    saveBtn.disabled = true;
    if (val.length < 3) { msg.textContent = 'Min. 3 characters.'; msg.className = 'char-field-msg error'; return; }
    if (!/^[a-zA-Z0-9 _]+$/.test(val)) { msg.textContent = 'Letters, numbers, spaces and _ only.'; msg.className = 'char-field-msg error'; return; }
    msg.textContent = 'Checking...'; msg.className = 'char-field-msg';
    debounce = setTimeout(() => {
      // TODO: Replace with async API call — isUsernameAvailable returns a Promise in backend version
      if (isUsernameAvailable(val)) {
        msg.textContent = '✓ Available!'; msg.className = 'char-field-msg ok';
        saveBtn.disabled = false;
      } else {
        msg.textContent = '✗ Username taken. Try another.'; msg.className = 'char-field-msg error';
      }
    }, 400);
  });

  saveBtn.addEventListener('click', () => {
    const username = input.value.trim();
    if (!isUsernameAvailable(username)) return;
    const player = createPlayer(wallet, username, selectedStarter);
    onComplete(player);
  });
}
