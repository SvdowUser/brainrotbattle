const CONTRACT_PLACEHOLDER = 'BRK...coming soon';

export function showLanding(container, callbacks) {
  // callbacks: { onPlay, onConnect, onLeaderboard, onShop, onDex }
  const { onPlay, onConnect, onLeaderboard, onShop, onDex } = callbacks;

  container.innerHTML = `
    <!-- NAV -->
    <nav class="nav-bar" id="landing-nav">
      <div class="nav-left">
        <a class="nav-logo" href="#"><span class="nav-brain">🧠</span> BRAINROCK</a>
        <button class="nav-link" id="nav-hunt">Hunt</button>
        <button class="nav-link" id="nav-dex">BrainDex</button>
        <button class="nav-link" id="nav-shop">Shop</button>
        <button class="nav-link" id="nav-rank">Ranking</button>
      </div>
      <div class="nav-right">
        <div class="nav-contract" id="nav-contract" title="Copy contract address">
          $BRACK &nbsp;·&nbsp; ${CONTRACT_PLACEHOLDER}
          <button class="nav-copy-btn" id="nav-copy">Copy</button>
        </div>
        <button class="btn-wallet-connect" id="nav-wallet">Connect Wallet</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-map-bg" aria-hidden="true">
        <div class="hero-map-anim"></div>
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-logo">
          <div class="hero-logo-main">BRAINROCK</div>
          <div class="hero-logo-sub">BATTLE</div>
        </div>
        <div class="hero-tagline">Catch. Train. Battle. Earn.</div>
        <div class="hero-desc">
          Explore the BrainWorld, catch 20 original Brainrods,<br>
          fill your BrainDex, and trade on the Solana blockchain.
        </div>
        <button class="btn-hero-play" id="hero-play">
          <span class="btn-hero-icon">🧠</span> Play Now
        </button>
        <div class="hero-wallet-hint" id="hero-wallet-hint">Connect wallet to save your progress</div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="hiw-section" id="hiw">
      <div class="section-title">How it Works</div>
      <div class="section-sub">Your adventure in 3 steps</div>
      <div class="hiw-cards">
        <div class="hiw-card">
          <div class="hiw-icon" style="background:#1b5e2022">🌿</div>
          <div class="hiw-card-title">Daily Hunt</div>
          <div class="hiw-card-desc">One free hunt per zone every 24h. Walk the map, enter the rustling grass, and catch wild Brainrods!</div>
          <div class="hiw-bar" style="background:#4CAF50"></div>
        </div>
        <div class="hiw-card">
          <div class="hiw-icon" style="background:#f9a82522">🧠</div>
          <div class="hiw-card-title">BrainDex & Market</div>
          <div class="hiw-card-desc">Unlock new zones by filling your BrainDex. Trade your catches on the market for $BRACK tokens.</div>
          <div class="hiw-bar" style="background:#FFD700"></div>
        </div>
        <div class="hiw-card">
          <div class="hiw-icon" style="background:#b71c1c22">💎</div>
          <div class="hiw-card-title">Complete the BrainDex</div>
          <div class="hiw-card-desc">20 Brainrods to collect — from common Fizzpup to legendary Glitchzero. Can you catch them all?</div>
          <div class="hiw-bar" style="background:#E53935"></div>
        </div>
      </div>
    </section>

    <!-- CREATURES PREVIEW -->
    <section class="creatures-section">
      <div class="section-title">The Brainrods</div>
      <div class="section-sub">20 original creatures. Zero Pokémon.</div>
      <div class="creature-preview-grid" id="creature-grid"></div>
    </section>

    <!-- LEADERBOARD TEASER -->
    <section class="leaderboard-teaser">
      <div class="section-title">Top Trainers</div>
      <button class="btn-secondary" id="hero-lb">View Full Leaderboard</button>
    </section>

    <!-- FOOTER -->
    <footer class="landing-footer">
      <div class="footer-brand">BRAINROCK BATTLE</div>
      <div class="footer-legal">
        Brainrock Battle is an original game. Not affiliated with Nintendo, Game Freak, or The Pokémon Company.
        All Brainrod characters are original creations. $BRACK is a utility token — not a financial instrument.
      </div>
      <div class="footer-links">
        <span>© 2025 Brainrock Battle</span>
      </div>
    </footer>`;

  // Build creature preview grid (static import hoisted at top of module)
  Promise.resolve().then(() => import('../data/brainrods.js')).then(({ BRAINRODS, RARITY_COLORS }) => {
    const grid = container.querySelector('#creature-grid');
    if (!grid) return;
    BRAINRODS.slice(0, 10).forEach(b => {
      const card = document.createElement('div');
      card.className = 'creature-card';
      card.innerHTML = `
        <canvas class="creature-card-canvas" width="64" height="64"></canvas>
        <div class="creature-card-name" style="color:${b.color}">${b.name}</div>
        <div class="creature-card-type">${b.type}</div>
        <div class="creature-card-rarity" style="color:${RARITY_COLORS[b.rarity]}">${b.rarity}</div>`;
      grid.appendChild(card);
      const cv  = card.querySelector('.creature-card-canvas');
      const ctx = cv.getContext('2d');
      let f = 0;
      const anim = () => {
        if (!document.body.contains(cv)) return;
        ctx.clearRect(0, 0, 64, 64);
        const r = 20 + Math.sin(f * 0.07) * 3;
        ctx.shadowColor = b.color; ctx.shadowBlur = 10;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(32, 32, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.color2;
        ctx.beginPath(); ctx.arc(32 - r * 0.25, 32 - r * 0.25, r * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.arc(32 - r * 0.3, 32 - r * 0.35, r * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; f++;
        requestAnimationFrame(anim);
      };
      anim();
    });
  });

  // Wire buttons
  container.querySelector('#hero-play')?.addEventListener('click', onPlay);
  container.querySelector('#nav-hunt')?.addEventListener('click', onPlay);
  container.querySelector('#nav-dex')?.addEventListener('click',  onDex);
  container.querySelector('#nav-shop')?.addEventListener('click', onShop);
  container.querySelector('#nav-rank')?.addEventListener('click', onLeaderboard);
  container.querySelector('#hero-lb')?.addEventListener('click',  onLeaderboard);
  container.querySelector('#nav-wallet')?.addEventListener('click', onConnect);

  container.querySelector('#nav-copy')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(CONTRACT_PLACEHOLDER);
    const btn = container.querySelector('#nav-copy');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

export function updateNavWalletButton(container, playerData, wallet) {
  const btn = container.querySelector('#nav-wallet');
  const hint = container.querySelector('#hero-wallet-hint');
  if (!btn) return;
  if (wallet) {
    btn.textContent = playerData
      ? `🧠 ${playerData.username}`
      : `${wallet.slice(0,6)}...${wallet.slice(-4)}`;
    btn.classList.add('connected');
    if (hint) hint.textContent = playerData
      ? `Playing as ${playerData.username} · BrainDex: ${playerData.brainDex.length}/20`
      : 'Wallet connected. Create your trainer to start!';
  } else {
    btn.textContent = 'Connect Wallet';
    btn.classList.remove('connected');
    if (hint) hint.textContent = 'Connect wallet to save your progress';
  }
}
