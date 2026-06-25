import { BRAINRODS } from '../data/brainrods.js';

// TODO: Replace MOCK_DATA with API call: GET /api/leaderboard?limit=50
const MOCK_DATA = [
  { rank: 1,  username: 'NeuralNick',   wallet: 'NkP1...Ry2T', dexCount: 18, brainGold: 4800, badge: '🥇' },
  { rank: 2,  username: 'GlitchQueen',  wallet: 'GQ7x...mW3D', dexCount: 16, brainGold: 3200, badge: '🥈' },
  { rank: 3,  username: 'Arcwave',      wallet: 'Aw9z...Kp5J', dexCount: 15, brainGold: 2700, badge: '🥉' },
  { rank: 4,  username: '7Pulsars',     wallet: '7Pu2...Rd1F', dexCount: 12, brainGold: 1900 },
  { rank: 5,  username: 'xX_Synapse_Xx',wallet: 'xXs4...Qt8G', dexCount: 11, brainGold: 1400 },
  { rank: 6,  username: 'BrainHunter',  wallet: 'BHu6...Lv0C', dexCount: 10, brainGold: 1200 },
  { rank: 7,  username: 'CryptoMind',   wallet: 'CM3r...Uw7B', dexCount:  9, brainGold:  980 },
  { rank: 8,  username: 'Dendrite42',   wallet: 'Dn1t...Po2S', dexCount:  8, brainGold:  750 },
];

export function showLeaderboard(container, onBack) {
  container.innerHTML = '';
  const total = BRAINRODS.length;

  const el = document.createElement('div');
  el.className = 'page-screen leaderboard-screen';
  el.innerHTML = `
    <div class="page-header">
      <button class="btn-back" id="lb-back">← Back</button>
      <div class="page-title">Leaderboard</div>
      <div class="page-subtitle">Trainers with the most Brainrods in their BrainDex</div>
    </div>

    <div class="lb-list">
      ${MOCK_DATA.map(p => `
        <div class="lb-row ${p.rank <= 3 ? 'lb-top' : ''}">
          <div class="lb-rank">${p.badge || p.rank}</div>
          <div class="lb-info">
            <div class="lb-username">${p.username}</div>
            <div class="lb-wallet">${p.wallet}</div>
          </div>
          <div class="lb-dex">
            <div class="lb-dex-count">${p.dexCount}/${total}</div>
            <div class="lb-dex-bar-wrap">
              <div class="lb-dex-bar-fill" style="width:${(p.dexCount/total*100).toFixed(1)}%"></div>
            </div>
          </div>
          <div class="lb-gold">🧠 ${p.brainGold.toLocaleString()}</div>
          <button class="lb-view-btn">View</button>
        </div>`).join('')}
    </div>

    <div class="lb-disclaimer">
      Leaderboard uses demo data. Live wallet-based ranking will be enabled after mainnet launch.
    </div>`;

  container.appendChild(el);
  el.querySelector('#lb-back').addEventListener('click', onBack);
}
