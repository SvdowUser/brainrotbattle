export function showShop(container, playerData, onBack) {
  container.innerHTML = '';
  const gold   = playerData?.brainGold ?? 0;
  const locked = !playerData;

  const items = [
    { id: 'brain-orb',  name: 'Brain Orb',  icon: '🧠', price: 10,  desc: 'Standard capture orb. Works on all Brainrods.',         color: '#E91E63' },
    { id: 'glitch-orb', name: 'Glitch Orb', icon: '⚡', price: 25,  desc: '+30% catch rate. Great for Rare and Epic.',             color: '#9C27B0' },
    { id: 'rare-orb',   name: 'Rare Orb',   icon: '💎', price: 100, desc: 'High-power orb. Best chance at Legendary.',            color: '#FF9800' },
    { id: 'gold-pack',  name: 'Brain Gold Pack', icon: '🪙', price: '0.01 SOL', desc: 'Buy 500 $BRACK. Requires connected wallet.', color: '#FFD700', solana: true },
    { id: 'extra-hunt', name: 'Extra Hunt Pass', icon: '🎟', price: 15, desc: 'Skip the 24h cooldown once per zone.',               color: '#00BCD4' },
  ];

  const el = document.createElement('div');
  el.className = 'page-screen shop-screen';
  el.innerHTML = `
    <div class="page-header">
      <button class="btn-back" id="shop-back">← Back</button>
      <div class="page-title">Shop</div>
      <div class="page-subtitle">Spend your $BRACK on items and upgrades</div>
    </div>

    ${locked ? '<div class="shop-locked-banner">Connect your wallet to purchase items</div>' : `<div class="shop-balance">Your Balance: <strong>${gold} $BRACK</strong></div>`}

    <div class="shop-grid">
      ${items.map(item => `
        <div class="shop-card">
          <div class="shop-icon" style="background:${item.color}22;border-color:${item.color}44">${item.icon}</div>
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.desc}</div>
          <div class="shop-item-price" style="color:${item.color}">
            ${typeof item.price === 'string' ? item.price : `${item.price} $BRACK`}
          </div>
          <button class="btn-shop-buy ${locked ? 'disabled' : ''}" ${locked ? 'disabled' : ''} data-id="${item.id}">
            ${item.solana ? '🔗 Buy with SOL' : 'Buy'}
          </button>
        </div>`).join('')}
    </div>

    <div class="shop-note">
      Market purchases are simulated in demo mode. Real transactions require Phantom wallet.
    </div>`;

  container.appendChild(el);
  el.querySelector('#shop-back').addEventListener('click', onBack);

  el.querySelectorAll('.btn-shop-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      showPurchaseResult(el, itemId, items.find(i => i.id === itemId));
    });
  });
}

function showPurchaseResult(parent, itemId, item) {
  const msg = document.createElement('div');
  msg.className = 'shop-toast';
  msg.textContent = `${item.icon} ${item.name} purchased! (Demo mode)`;
  parent.appendChild(msg);
  setTimeout(() => msg.classList.add('visible'), 10);
  setTimeout(() => { msg.classList.remove('visible'); setTimeout(() => msg.remove(), 300); }, 2500);
}
