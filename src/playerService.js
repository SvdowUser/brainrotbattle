// Player data service — currently backed by localStorage.
// TODO: Replace all localStorage calls with API calls to your backend (Supabase / Firebase / Node).
// Each function is annotated with the HTTP endpoint it should eventually call.

const STORAGE_KEY = 'brainrock_players';
const WALLET_KEY  = 'brainrock_wallet';

function _loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function _saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// TODO: GET /api/players?wallet=:address
export function getPlayerByWallet(wallet) {
  const all = _loadAll();
  return all[wallet] || null;
}

// TODO: GET /api/players/check-username?name=:username  (returns { available: bool })
export function isUsernameAvailable(username) {
  const all = _loadAll();
  const lower = username.toLowerCase();
  return !Object.values(all).some(p => p.username.toLowerCase() === lower);
}

// TODO: POST /api/players  { wallet, username, starterId }
export function createPlayer(wallet, username, starterId) {
  const all = _loadAll();
  const player = {
    wallet,
    username,
    starterId,
    createdAt: Date.now(),
    brainDex: [starterId],
    caught: { [starterId]: 1 },
    brainGold: 100,
    orbs: { brain: 10, glitch: 3, rare: 1 },
    position: { x: 19, y: 17 },
  };
  all[wallet] = player;
  _saveAll(all);
  localStorage.setItem(WALLET_KEY, wallet);
  return player;
}

// TODO: PUT /api/players/:wallet  { ...updates }
export function savePlayerState(wallet, updates) {
  const all = _loadAll();
  if (all[wallet]) {
    all[wallet] = { ...all[wallet], ...updates };
    _saveAll(all);
  }
}

export function loadPlayer() {
  const wallet = localStorage.getItem(WALLET_KEY);
  if (!wallet) return null;
  return getPlayerByWallet(wallet);
}

export function getConnectedWallet() {
  return localStorage.getItem(WALLET_KEY);
}

// Simulates wallet connection — replace with real Phantom/Solflare adapter
export function connectWallet() {
  const existing = localStorage.getItem(WALLET_KEY);
  if (existing) return existing;
  const fake = 'Ez' + Math.random().toString(36).slice(2, 8).toUpperCase() +
               Math.random().toString(36).slice(2, 8).toUpperCase() + 'S';
  localStorage.setItem(WALLET_KEY, fake);
  return fake;
}

export function disconnectWallet() {
  localStorage.removeItem(WALLET_KEY);
}

export function addCaughtBrainrod(wallet, brainrodId) {
  const all = _loadAll();
  if (!all[wallet]) return;
  const p = all[wallet];
  p.caught = p.caught || {};
  p.caught[brainrodId] = (p.caught[brainrodId] || 0) + 1;
  if (!p.brainDex.includes(brainrodId)) p.brainDex.push(brainrodId);
  _saveAll(all);
}
