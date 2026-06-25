import { isUsernameAvailable, createPlayer } from '../playerService.js';
import { BRAINRODS }                         from '../data/brainrods.js';

// The 3 iconic starters — each is a brainrot meme character
const STARTERS = [
  { id:1, label:'Tung Tung Tung Sahur', type:'Rhythm', desc:'The loudest dawn creature. Hits things with drumsticks. Never stops.' },
  { id:6, label:'Bombardiro Crocodilo', type:'Chaos',  desc:'Half crocodile, half biplane. Flies erratically. Drops bombs sometimes.' },
  { id:2, label:'Tralalero Tralala',    type:'Water',  desc:'A shark that grew legs. Sings off-key. Has very nice shoes.' },
];

export function showCharacterCreation(container, wallet, onComplete) {
  container.innerHTML = '';
  let selectedStarter = STARTERS[0].id;

  const el = document.createElement('div');
  el.className = 'char-creation-screen';
  el.innerHTML = `
    <div class="char-creation-box">
      <div class="char-creation-logo">BRAINWOD<br><span>BATTLE</span></div>
      <div class="char-creation-step">Choose Your Trainer Identity</div>

      <div class="char-field-wrap">
        <label class="char-label">Trainer Name</label>
        <input id="cc-username" class="char-input" type="text" placeholder="3–16 characters" maxlength="16" autocomplete="off" />
        <div id="cc-username-msg" class="char-field-msg"></div>
      </div>

      <div class="char-label" style="margin-top:20px;margin-bottom:10px">Choose Your Starter Brainwod</div>
      <div class="starter-grid" id="cc-starters">
        ${STARTERS.map(s => `
          <div class="starter-card ${s.id === selectedStarter ? 'selected' : ''}" data-id="${s.id}">
            <canvas class="starter-canvas" data-id="${s.id}" width="110" height="110"></canvas>
            <div class="starter-name">${s.label}</div>
            <div class="starter-type-badge">${s.type}</div>
            <div class="starter-desc">${s.desc}</div>
          </div>`).join('')}
      </div>

      <button id="cc-save-btn" class="btn-primary cc-save" disabled>Start Adventure</button>
      <div class="char-wallet-note">Wallet: ${wallet.slice(0,8)}…${wallet.slice(-4)}</div>
    </div>`;

  container.appendChild(el);

  // Draw starter sprites with actual brainrod draw functions
  const animFrames = {};
  STARTERS.forEach(s => {
    const brainrod = BRAINRODS.find(b => b.id === s.id);
    const canvas   = el.querySelector(`.starter-canvas[data-id="${s.id}"]`);
    if (!canvas || !brainrod) return;
    const ctx = canvas.getContext('2d');
    animFrames[s.id] = 0;
    const anim = () => {
      if (!document.body.contains(canvas)) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      brainrod.draw(ctx, canvas.width/2, canvas.height/2, canvas.width * .82, animFrames[s.id]);
      animFrames[s.id]++;
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

  // Username validation (debounced 400ms)
  const input   = el.querySelector('#cc-username');
  const msgEl   = el.querySelector('#cc-username-msg');
  const saveBtn = el.querySelector('#cc-save-btn');
  let debounce  = null;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const val = input.value.trim();
    saveBtn.disabled = true;
    if (val.length < 3) { msgEl.textContent = 'Min. 3 characters.'; msgEl.className = 'char-field-msg error'; return; }
    if (!/^[a-zA-Z0-9 _]+$/.test(val)) { msgEl.textContent = 'Letters, numbers, spaces, _ only.'; msgEl.className = 'char-field-msg error'; return; }
    msgEl.textContent = 'Checking…'; msgEl.className = 'char-field-msg';
    debounce = setTimeout(() => {
      if (isUsernameAvailable(val)) {
        msgEl.textContent = '✓ Available!'; msgEl.className = 'char-field-msg ok';
        saveBtn.disabled = false;
      } else {
        msgEl.textContent = '✗ Username taken.'; msgEl.className = 'char-field-msg error';
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
