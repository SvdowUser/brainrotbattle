import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Camera looks +Z so LANES[0] = visual left, LANES[2] = visual right
const LANES = [2.5, 0, -2.5];
const CHUNK_LENGTH = 20;
const VISIBLE_CHUNKS = 6;
const SPAWN_DISTANCE = 60;
const DESPAWN_DISTANCE = -15;

const ROAD_HALF = 4.0;       // road extends from -4 to +4 (width 8)
const SIDEWALK_HALF = 7.5;   // sidewalk extends from ±4 to ±7.5

// Biome thresholds (distance triggers)
const BIOMES = [
  {
    name: 'city',
    start: 0,
    // Subway-Surfers-style morning sky: warm peach horizon -> bright blue up top
    skyTop: '#0ea5e9', skyMid: '#60a5fa', skyHorizon: '#fbbf77', sunDot: '#fffbeb',
    fogColor: 0xfdba74,
    sidewalkAccent: '#9aa3ae',
    decoMix: { lamp: 0.6, palm: 0.0, cactus: 0.0, building: 1.0, billboard: 0.10 },
  },
  {
    name: 'coastal',
    start: 1200,
    skyTop: '#082f49', skyMid: '#0284c7', skyHorizon: '#fed7aa', sunDot: '#fde68a',
    fogColor: 0x7dd3fc,
    sidewalkAccent: '#cbb78b',
    decoMix: { lamp: 0.3, palm: 1.0, cactus: 0.0, building: 0.25, billboard: 0.08 },
  },
  {
    name: 'desert',
    start: 2800,
    skyTop: '#3b0764', skyMid: '#c2410c', skyHorizon: '#fde047', sunDot: '#fef3c7',
    fogColor: 0xfb923c,
    sidewalkAccent: '#a87a50',
    decoMix: { lamp: 0.2, palm: 0.1, cactus: 1.0, building: 0.0, billboard: 0.10 },
  },
];

export class TrackManager {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.obstacles = [];
    this.coins = [];
    this.decorations = [];
    this.powerups = [];

    // Materials (filled in init)
    this.asphaltMat = null;
    this.sidewalkMats = [];        // one per biome
    this.curbMat = null;
    this.obstacleMat = null;
    this.obstacleMat2 = null;
    this.obstacleMat3 = null;
    this.coinMat = null;
    this.powerupCoinMat = null;
    this.powerupGhostMat = null;
    this.lampPostMat = null;
    this.lampHeadMat = null;
    this.lampGlowMat = null;
    this.billboardFrameMat = null;
    this.billboardAdMats = [];     // pool of "ad" placeholders, swappable later
    this.buildingMats = [];
    this.palmTrunkMat = null;
    this.palmFrondMat = null;
    this.cactusMat = null;

    // Scenery containers
    this.buildings = [];           // includes buildings, billboards, lamps, palms
    this.skyboxMesh = null;
    this.skyboxMat = null;
    this.starfield = null;
    this.dust = null;
    this._silhouette = null;

    // Track state
    this.distSinceLastPowerup = 0;
    this.totalDistance = 0;
    this.currentBiomeIdx = 0;

    // Event modifiers
    this.coinRushActive = false;
    this.dangerZoneActive = false;

    // Custom 3D models — if set, replaces procedural geometry.
    // Populated via setModel(kind, url) when the user uploads a .glb/.gltf.
    this.customModels = {
      lamp: null,
      building: null,
      billboard: null,
      palm: null,
      cactus: null,
      car: null,
      train: null,
    };
    // Built-in car library: an array of preprocessed car scenes, loaded from
    // /public/models/cars/*.glb at startup via loadBuiltinCarLibrary().
    // Each entry is already normalized (scaled + ground + forward-facing +Z).
    this.carLibrary = [];
    // Same idea but for long blocker vehicles (bus / lorry / truck).
    this.busLibrary = [];
    // Optional libraries: if loaded, spawn functions prefer these over procedural geometry.
    this.buildingLibrary = [];
    this.lampLibrary = [];
    this.pedestrianLibrary = [];
    // Palm tree library (replaces the procedural palm when populated).
    this.palmLibrary = [];
    // Billboard library (replaces the procedural highway ad board).
    this.billboardLibrary = [];
    // Road library — if populated, each chunk uses a 3D road model instead
    // of the procedural asphalt+sidewalk+curb strip.
    this.roadLibrary = [];
    // Active walking pedestrians (drifted forward like buildings and despawned behind player)
    this.pedestrians = [];
    // Per-lane cruising speed factor for moving vehicles. Cars spawned into
    // the same lane share the same speed so they don't rear-end each other.
    this._laneSpeed = [null, null, null];
    this._laneSpeedTimer = 0;
    // Recently-used model indices (anti-repeat across spawns). We keep a
    // rolling history so the picker avoids the last few picks, not just the
    // immediately-previous one — prevents the "same 2 cars cycling" feel.
    this._recentCarIdx = [];
    this._recentBusIdx = [];
    this._recentBuildingIdx = [];
    this._recentLampIdx = [];
    this._recentPedestrianIdx = [];
    this._recentPalmIdx = [];
    this._recentBillboardIdx = [];
    this._recentRoadIdx = [];
    // Legacy single-index anchors kept for back-compat with _pickNextIndex.
    this._lastCarIdx = -1;
    this._lastBusIdx = -1;
    this._lastBuildingIdx = -1;
    this._gltfLoader = new GLTFLoader();
  }

  // ─────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────
  init() {
    const tex = this._createTextures();

    // Road = asphalt
    tex.asphalt.repeat.set(1, 4);
    this.asphaltMat = new THREE.MeshStandardMaterial({
      map: tex.asphalt, roughness: 0.95, metalness: 0.0,
    });

    // Sidewalk: one material per biome (different sand tones)
    this.sidewalkMats = BIOMES.map((b, i) => {
      const t = this._createSidewalkTex(b.sidewalkAccent);
      t.repeat.set(2, 4);
      return new THREE.MeshStandardMaterial({
        map: t, roughness: 0.9, metalness: 0.0,
      });
    });

    // Property ground (extends from sidewalk outward under buildings)
    this.propertyMats = BIOMES.map((b) => {
      const t = this._createPropertyTex(b.name);
      t.repeat.set(4, 6);
      return new THREE.MeshStandardMaterial({
        map: t, roughness: 0.95, metalness: 0.0,
      });
    });

    // Curb between road and sidewalk
    this.curbMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8, roughness: 0.8, metalness: 0.0,
    });

    // Obstacles
    this.obstacleMat = new THREE.MeshStandardMaterial({
      map: tex.obstacleLow, roughness: 0.85, metalness: 0.1,
    });
    this.obstacleMat2 = new THREE.MeshStandardMaterial({
      map: tex.obstacleHigh, roughness: 0.7, metalness: 0.15,
    });
    this.obstacleMat3 = new THREE.MeshStandardMaterial({
      map: tex.obstacleFull, roughness: 0.95, metalness: 0.0,
    });

    // Coins — gold material for the Torus, emissive for warm glow
    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.25,
    });
    // Coin glow halo — additive sprite so coins pop against the scene
    this._coinHaloTex = this._canvasTex(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(254, 240, 138, 1.0)');
      g.addColorStop(0.3, 'rgba(251, 191, 36, 0.55)');
      g.addColorStop(0.7, 'rgba(251, 191, 36, 0.15)');
      g.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
    this._coinHaloMat = new THREE.SpriteMaterial({
      map: this._coinHaloTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
      fog: false,
    });

    // Powerups
    this.powerupCoinMat = new THREE.MeshStandardMaterial({
      map: tex.powerCoin,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
      metalness: 0.5,
      roughness: 0.25,
    });
    this.powerupGhostMat = new THREE.MeshStandardMaterial({
      map: tex.powerGhost,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.0,
      metalness: 0.3,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    // Street lamp materials
    this.lampPostMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937, roughness: 0.6, metalness: 0.7,
    });
    this.lampHeadMat = new THREE.MeshStandardMaterial({
      color: 0x111827, roughness: 0.7, metalness: 0.5,
    });
    // Emissive lamp head glow — stays bright regardless of lighting
    this.lampGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfff4c4,
      emissive: 0xfff4c4,
      emissiveIntensity: 1.6,
      toneMapped: false,
    });

    // Billboard frame + ad slots
    this.billboardFrameMat = new THREE.MeshStandardMaterial({
      color: 0x374151, roughness: 0.7, metalness: 0.5,
    });
    this.billboardAdMats = [
      new THREE.MeshBasicMaterial({ map: this._makeAdPlaceholder('YOUR\nAD HERE', '#1e40af', '#ffffff'), toneMapped: false }),
      new THREE.MeshBasicMaterial({ map: this._makeAdPlaceholder('SPACE\nFOR RENT', '#7c2d12', '#fde047'), toneMapped: false }),
      new THREE.MeshBasicMaterial({ map: this._makeAdPlaceholder('BRAINROT\nBATTLE', '#0f172a', '#22d3ee'), toneMapped: false }),
      new THREE.MeshBasicMaterial({ map: this._makeAdPlaceholder('PLAY\nMORE', '#831843', '#fef3c7'), toneMapped: false }),
    ];

    // Buildings
    this._createBuildingMaterials();

    // Trees / cacti
    this.palmTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x6b4423, roughness: 0.9, metalness: 0.0,
    });
    this.palmFrondMat = new THREE.MeshStandardMaterial({
      color: 0x166534, side: THREE.DoubleSide, roughness: 0.75, metalness: 0.0,
    });
    this.cactusMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f, roughness: 0.75, metalness: 0.0,
    });

    // Sky + stars + dust
    this._createSkyAndStars();

    // Spawn initial chunks
    for (let i = 0; i < VISIBLE_CHUNKS; i++) {
      this.spawnChunk(i * CHUNK_LENGTH);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TEXTURES
  // ─────────────────────────────────────────────────────────────
  _canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'));
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
  }

  _createTextures() {
    // ROAD — dark asphalt with dashed lane dividers and solid edge lines.
    // Texture width 256 = road width 8m. Height 512 tiles along the run.
    // Road lanes at world x = ±2.5 and 0 → u ≈ 48, 128, 208 (dividers at 88 and 168).
    const asphalt = this._canvasTex(256, 512, (ctx) => {
      // Base asphalt (slightly warm charcoal, darker in the center)
      const bgGrad = ctx.createLinearGradient(0, 0, 256, 0);
      bgGrad.addColorStop(0, '#2d2f33');
      bgGrad.addColorStop(0.5, '#24262a');
      bgGrad.addColorStop(1, '#2d2f33');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 256, 512);
      // Fine asphalt grain (lots of tiny specks, mixed values)
      for (let i = 0; i < 3800; i++) {
        const v = 30 + Math.random() * 55;
        ctx.fillStyle = `rgb(${v},${v + Math.random() * 6 | 0},${v + Math.random() * 6 | 0})`;
        const s = 0.6 + Math.random() * 1.6;
        ctx.fillRect(Math.random() * 256, Math.random() * 512, s, s);
      }
      // Subtle darker tyre streaks down each lane center
      [48, 128, 208].forEach((cx) => {
        const tg = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0);
        tg.addColorStop(0, 'rgba(10,10,12,0)');
        tg.addColorStop(0.5, 'rgba(10,10,12,0.18)');
        tg.addColorStop(1, 'rgba(10,10,12,0)');
        ctx.fillStyle = tg;
        ctx.fillRect(cx - 22, 0, 44, 512);
      });
      // Solid white edge lines (just inside the curb on each side)
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(6, 0, 4, 512);
      ctx.fillRect(246, 0, 4, 512);
      // Dashed white lane dividers between lanes 1/2 and 2/3.
      // Dashes: 60 px long with 40 px gap, repeating every 100 px along the run.
      const dashH = 60, gapH = 40, period = dashH + gapH;
      const drawDashedDivider = (cx) => {
        ctx.fillStyle = '#f1f1f0';
        // Loop starts below 0 and goes past 512 so tiling has no seam.
        for (let y = -period; y < 512 + period; y += period) {
          ctx.fillRect(cx - 2, y, 4, dashH);
        }
      };
      drawDashedDivider(88);
      drawDashedDivider(168);
      // Occasional faint crack / patch stains for realism
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        const x0 = Math.random() * 256;
        const y0 = Math.random() * 512;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + (Math.random() - 0.5) * 40, y0 + (Math.random() - 0.5) * 40);
        ctx.stroke();
      }
    });

    // LOW obstacle: concrete barrier with yellow hazard stripes
    const obstacleLow = this._canvasTex(128, 64, (ctx) => {
      // Base concrete
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(0, 0, 128, 64);
      // Concrete noise
      for (let i = 0; i < 120; i++) {
        const v = 60 + Math.random() * 50;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(Math.random() * 128, Math.random() * 64, 2, 2);
      }
      // Yellow/black hazard stripe across the top and bottom
      ctx.fillStyle = '#fde047';
      ctx.fillRect(0, 0, 128, 10);
      ctx.fillRect(0, 54, 128, 10);
      ctx.fillStyle = '#111827';
      for (let x = 0; x < 128; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 12, 0);
        ctx.lineTo(x + 24, 10); ctx.lineTo(x + 12, 10);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, 54); ctx.lineTo(x + 12, 54);
        ctx.lineTo(x + 24, 64); ctx.lineTo(x + 12, 64);
        ctx.closePath(); ctx.fill();
      }
    });

    // HIGH obstacle: construction-site barrier (orange/white diagonal stripes)
    const obstacleHigh = this._canvasTex(128, 64, (ctx) => {
      // Orange base
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(0, 0, 128, 64);
      // White diagonal stripes
      ctx.fillStyle = '#f9fafb';
      const stripeW = 14;
      ctx.save();
      ctx.translate(64, 32);
      ctx.rotate(-Math.PI / 4);
      for (let i = -120; i < 120; i += stripeW * 2) {
        ctx.fillRect(i, -120, stripeW, 240);
      }
      ctx.restore();
      // Black border top and bottom
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 128, 4);
      ctx.fillRect(0, 60, 128, 4);
      // "BAUSTELLE" text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BAUSTELLE', 64, 32);
    });

    // FULL obstacle: subway train wagon (front/back view) — red/silver livery
    const obstacleFull = this._canvasTex(128, 128, (ctx) => {
      // Sky strip (above wagon roof) — same as sleeper gravel so it blends
      ctx.fillStyle = '#5b5148';
      ctx.fillRect(0, 0, 128, 14);
      // Wagon body — glossy red w/ vertical gradient
      const bodyGrad = ctx.createLinearGradient(0, 14, 0, 128);
      bodyGrad.addColorStop(0, '#f87171');
      bodyGrad.addColorStop(0.3, '#dc2626');
      bodyGrad.addColorStop(0.8, '#991b1b');
      bodyGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(0, 14, 128, 114);
      // Silver roof strip
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(4, 14, 120, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(6, 14, 116, 2);
      // Large front window (cockpit) — glowing teal glass
      const winGrad = ctx.createLinearGradient(0, 28, 0, 64);
      winGrad.addColorStop(0, '#cffafe');
      winGrad.addColorStop(0.5, '#22d3ee');
      winGrad.addColorStop(1, '#0e7490');
      ctx.fillStyle = winGrad;
      ctx.fillRect(22, 30, 84, 34);
      // Window frame
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.strokeRect(22, 30, 84, 34);
      // Window highlight streak
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(28, 34, 30, 4);
      // Headlights — two bright yellow discs
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(26, 82, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(102, 82, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.arc(26, 82, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(102, 82, 9, 0, Math.PI * 2); ctx.stroke();
      // Center emblem
      ctx.fillStyle = '#fffbeb';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 64, 84);
      // Coupler / bumper at the bottom
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 110, 128, 18);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 110, 128, 3);
      // Wheels (just painted, actual wheels are the rails below)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(30, 122, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(98, 122, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#52525b';
      ctx.beginPath(); ctx.arc(30, 122, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(98, 122, 4, 0, Math.PI * 2); ctx.fill();
    });

    // POWERUP textures
    const powerCoin = this._canvasTex(128, 128, (ctx) => {
      const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 70);
      grad.addColorStop(0, '#fff7ed');
      grad.addColorStop(0.5, '#fbbf24');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(64, 64, 56, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#7c2d12';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2X', 64, 68);
    });

    const powerGhost = this._canvasTex(128, 128, (ctx) => {
      const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 70);
      grad.addColorStop(0, '#ecfeff');
      grad.addColorStop(0.5, '#22d3ee');
      grad.addColorStop(1, '#0e7490');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#cffafe';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(64, 64, 56, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(64, 54, 22, Math.PI, 0);
      ctx.lineTo(86, 86);
      ctx.lineTo(78, 78);
      ctx.lineTo(70, 86);
      ctx.lineTo(58, 78);
      ctx.lineTo(50, 86);
      ctx.lineTo(42, 78);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0e7490';
      ctx.beginPath(); ctx.arc(56, 52, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(72, 52, 3, 0, Math.PI * 2); ctx.fill();
    });

    return { asphalt, obstacleLow, obstacleHigh, obstacleFull, powerCoin, powerGhost };
  }

  _createPropertyTex(biomeName) {
    // Ground that extends outward from the sidewalks — varies by biome
    if (biomeName === 'city') {
      return this._canvasTex(128, 128, (ctx) => {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, 128, 128);
        // Urban concrete noise
        for (let i = 0; i < 350; i++) {
          const v = 25 + Math.random() * 45;
          ctx.fillStyle = `rgb(${v},${v},${v + 3})`;
          ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
        }
        // Cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          let x0 = Math.random() * 128, y0 = Math.random() * 128;
          ctx.moveTo(x0, y0);
          for (let j = 0; j < 6; j++) {
            x0 += (Math.random() - 0.5) * 20;
            y0 += (Math.random() - 0.5) * 20;
            ctx.lineTo(x0, y0);
          }
          ctx.stroke();
        }
        // Occasional grass patches
        ctx.fillStyle = 'rgba(34, 80, 34, 0.45)';
        for (let i = 0; i < 3; i++) {
          const cx = Math.random() * 128, cy = Math.random() * 128;
          const r = 8 + Math.random() * 10;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        }
      });
    }
    if (biomeName === 'coastal') {
      return this._canvasTex(128, 128, (ctx) => {
        ctx.fillStyle = '#d4a572';
        ctx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 500; i++) {
          const tint = Math.random();
          ctx.fillStyle = tint < 0.5
            ? 'rgba(255,240,200,0.25)'
            : 'rgba(140,100,50,0.25)';
          ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
        }
        // Rocks
        ctx.fillStyle = 'rgba(100,80,50,0.5)';
        for (let i = 0; i < 4; i++) {
          const cx = Math.random() * 128, cy = Math.random() * 128;
          const r = 3 + Math.random() * 5;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        }
      });
    }
    // desert default
    return this._canvasTex(128, 128, (ctx) => {
      ctx.fillStyle = '#a87a50';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 450; i++) {
        const tint = Math.random();
        ctx.fillStyle = tint < 0.5
          ? 'rgba(210,150,90,0.3)'
          : 'rgba(70,45,20,0.3)';
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
      }
      // Cracked dunes
      ctx.strokeStyle = 'rgba(60,35,15,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 128, Math.random() * 128);
        ctx.quadraticCurveTo(
          Math.random() * 128, Math.random() * 128,
          Math.random() * 128, Math.random() * 128
        );
        ctx.stroke();
      }
    });
  }

  _createSidewalkTex(accentHex) {
    // Tiled concrete slabs with grout lines
    return this._canvasTex(128, 256, (ctx) => {
      ctx.fillStyle = accentHex;
      ctx.fillRect(0, 0, 128, 256);
      // Slab lines
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2;
      for (let y = 0; y <= 256; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(64, 256); ctx.stroke();
      // Speckle
      for (let i = 0; i < 350; i++) {
        const v = Math.random() * 255;
        ctx.fillStyle = `rgba(${v|0},${v|0},${v|0},0.15)`;
        ctx.fillRect(Math.random() * 128, Math.random() * 256, 1.5, 1.5);
      }
    });
  }

  _makeAdPlaceholder(text, bg, fg) {
    return this._canvasTex(512, 256, (ctx) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 512, 256);
      // Frame
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 496, 240);
      // Inner ad area
      ctx.fillStyle = fg;
      ctx.font = 'bold 64px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = text.split('\n');
      const lineH = 70;
      const startY = 128 - ((lines.length - 1) * lineH) / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, 256, startY + i * lineH));
    });
  }

  _createBuildingMaterials() {
    // More muted/professional palette than before
    const palettes = [
      { base: '#1f2937', windows: '#fde047', accent: '#fbbf24' }, // warm
      { base: '#0f172a', windows: '#fef3c7', accent: '#cbd5e1' }, // cool
      { base: '#1c1917', windows: '#fb923c', accent: '#a8a29e' }, // sepia
      { base: '#1e1b4b', windows: '#a5f3fc', accent: '#67e8f9' }, // night cyan
    ];
    this.buildingMats = palettes.map(p => {
      const t = this._canvasTex(96, 256, (ctx) => {
        ctx.fillStyle = p.base;
        ctx.fillRect(0, 0, 96, 256);
        // Slight wall texture
        for (let i = 0; i < 250; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
          ctx.fillRect(Math.random() * 96, Math.random() * 256, 1, 1);
        }
        // Window grid
        const cols = 6, rows = 14;
        const wW = 9, wH = 12;
        const padX = (96 - cols * wW) / (cols + 1);
        const padY = 6;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = padX + c * (wW + padX);
            const y = padY + r * (wH + padY);
            const lit = Math.random() < 0.55;
            if (lit) {
              ctx.fillStyle = p.windows;
              ctx.globalAlpha = 0.7 + Math.random() * 0.3;
              ctx.fillRect(x, y, wW, wH);
            } else {
              ctx.fillStyle = '#0a0a0f';
              ctx.globalAlpha = 1;
              ctx.fillRect(x, y, wW, wH);
            }
          }
        }
        ctx.globalAlpha = 1;
        // Roof line
        ctx.fillStyle = p.accent;
        ctx.fillRect(0, 0, 96, 3);
      });
      return new THREE.MeshStandardMaterial({
        map: t,
        emissive: new THREE.Color(p.windows),
        emissiveIntensity: 0.4,
        emissiveMap: t,
        roughness: 0.85,
        metalness: 0.1,
      });
    });
  }

  _createSkyAndStars() {
    // Skybox starts in city biome — gradient
    const skyTex = this._buildSkyTex(BIOMES[0]);
    const skyGeo = new THREE.CylinderGeometry(100, 100, 80, 32, 1, true);
    this.skyboxMat = new THREE.MeshBasicMaterial({
      map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false,
    });
    this.skyboxMesh = new THREE.Mesh(skyGeo, this.skyboxMat);
    this.skyboxMesh.position.set(0, 20, 0);
    this.skyboxMesh.renderOrder = -10;
    this.scene.add(this.skyboxMesh);

    // Distant skyline silhouette
    const silhouetteTex = this._canvasTex(512, 128, (ctx) => {
      ctx.clearRect(0, 0, 512, 128);
      let x = 0;
      while (x < 512) {
        const w = 18 + Math.random() * 38;
        const h = 26 + Math.random() * 78;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, 128 - h, w, h);
        if (Math.random() < 0.18) {
          ctx.beginPath();
          ctx.moveTo(x + w / 2 - 3, 128 - h);
          ctx.lineTo(x + w / 2, 128 - h - 18);
          ctx.lineTo(x + w / 2 + 3, 128 - h);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
        for (let y = 128 - h + 8; y < 128 - 8; y += 8) {
          for (let wx = x + 3; wx < x + w - 3; wx += 5) {
            if (Math.random() < 0.35) ctx.fillRect(wx, y, 2, 2);
          }
        }
        x += w + 1;
      }
    });
    silhouetteTex.wrapS = THREE.RepeatWrapping;
    silhouetteTex.repeat.set(6, 1);
    const silMat = new THREE.MeshBasicMaterial({
      map: silhouetteTex, transparent: true, fog: false,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const silhouetteGeo = new THREE.CylinderGeometry(70, 70, 16, 64, 1, true);
    this._silhouette = new THREE.Mesh(silhouetteGeo, silMat);
    this._silhouette.position.set(0, 6, 0);
    this._silhouette.renderOrder = -5;
    this.scene.add(this._silhouette);

    // Subtle starfield (visible in nightcity / city biomes)
    const starCount = 180;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.4;
      const r = 80 + Math.random() * 15;
      positions[i*3+0] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i*3+1] = Math.cos(phi) * r + 5;
      positions[i*3+2] = Math.sin(phi) * Math.sin(theta) * r;
      const tint = Math.random();
      if (tint < 0.3) { colors[i*3]=0.85; colors[i*3+1]=0.95; colors[i*3+2]=1; }
      else { colors[i*3]=1; colors[i*3+1]=0.97; colors[i*3+2]=0.85; }
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.5, vertexColors: true, transparent: true,
      opacity: 0.7, fog: false, sizeAttenuation: true,
    });
    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // Subtle dust drift — subdued
    const dustCount = 80;
    const dustPos = new Float32Array(dustCount * 3);
    const dustColor = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i*3+0] = (Math.random() - 0.5) * 30;
      dustPos[i*3+1] = Math.random() * 10 + 1;
      dustPos[i*3+2] = Math.random() * 80;
      // soft warm white
      dustColor[i*3+0] = 1; dustColor[i*3+1] = 0.95; dustColor[i*3+2] = 0.85;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColor, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.12, vertexColors: true, transparent: true,
      opacity: 0.35, fog: true, sizeAttenuation: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.dust = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dust);
  }

  _buildSkyTex(biome) {
    return this._canvasTex(64, 256, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, biome.skyTop);
      grad.addColorStop(0.55, biome.skyMid);
      grad.addColorStop(1, biome.skyHorizon);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 256);
      // Sun/moon dot
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = biome.sunDot;
      ctx.beginPath(); ctx.arc(32, 70, 11, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  _setBiome(idx) {
    if (idx === this.currentBiomeIdx) return;
    this.currentBiomeIdx = idx;
    const biome = BIOMES[idx];
    // Swap skybox texture
    if (this.skyboxMat) {
      const oldMap = this.skyboxMat.map;
      const newMap = this._buildSkyTex(biome);
      this.skyboxMat.map = newMap;
      this.skyboxMat.needsUpdate = true;
      if (oldMap) oldMap.dispose();
    }
    // Update fog color on scene
    if (this.scene.fog) {
      this.scene.fog.color.setHex(biome.fogColor);
    }
    // Tint scene background to match biome horizon
    if (this.scene.background && this.scene.background.isColor) {
      this.scene.background.setStyle(biome.skyHorizon);
    }
    // Callback so game.js can update its _baseFogColor / _baseBgColor
    if (this.onBiomeChange) {
      this.onBiomeChange(biome);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────
  reset() {
    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.coins.forEach(c => this.scene.remove(c.mesh));
    this.powerups.forEach(p => this.scene.remove(p.mesh));
    this.chunks.forEach(c => this.scene.remove(c));
    this.decorations.forEach(d => this.scene.remove(d));
    this.buildings.forEach(b => this.scene.remove(b));
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.chunks = [];
    this.decorations = [];
    this.buildings = [];
    this.distSinceLastPowerup = 0;
    this.totalDistance = 0;
    this._setBiome(0);

    for (let i = 0; i < VISIBLE_CHUNKS; i++) {
      this.spawnChunk(i * CHUNK_LENGTH);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHUNK SPAWN
  // ─────────────────────────────────────────────────────────────
  spawnChunk(zStart) {
    const biome = BIOMES[this.currentBiomeIdx];

    // PROPERTY GROUND — extends from sidewalk outward, under buildings/palms/etc.
    // Width ~22 each side so buildings at SIDEWALK_HALF+1.5..+7.5 have solid ground under them
    const propGeo = new THREE.BoxGeometry(22, 0.1, CHUNK_LENGTH);
    const propMat = this.propertyMats[this.currentBiomeIdx];
    const propL = new THREE.Mesh(propGeo, propMat);
    propL.position.set(-(SIDEWALK_HALF + 11), -0.1, zStart + CHUNK_LENGTH / 2);
    propL.receiveShadow = true;
    this.scene.add(propL);
    this.chunks.push(propL);
    const propR = new THREE.Mesh(propGeo, propMat);
    propR.position.set(SIDEWALK_HALF + 11, -0.1, zStart + CHUNK_LENGTH / 2);
    propR.receiveShadow = true;
    this.scene.add(propR);
    this.chunks.push(propR);

    // 3D ROAD MODEL (e.g. poly.pizza "Street Straight") — if any road GLB
    // is loaded, clone it per chunk and skip the procedural road/sidewalk/
    // curb geometry. The model already bakes in road + sidewalk + kerb.
    if (this.roadLibrary && this.roadLibrary.length > 0) {
      const idx = this._pickRandomIndexRecent(this.roadLibrary.length, this._recentRoadIdx);
      const roadModel = this.roadLibrary[idx].clone(true);
      roadModel.position.set(0, 0, zStart + CHUNK_LENGTH / 2);
      roadModel.traverse((c) => {
        if (c.isMesh) c.receiveShadow = true;
      });
      this.scene.add(roadModel);
      this.chunks.push(roadModel);
    } else {
      // ROAD — asphalt slab (procedural fallback)
      const roadGeo = new THREE.BoxGeometry(ROAD_HALF * 2, 0.15, CHUNK_LENGTH);
      const road = new THREE.Mesh(roadGeo, this.asphaltMat);
      road.position.set(0, -0.075, zStart + CHUNK_LENGTH / 2);
      road.receiveShadow = true;
      this.scene.add(road);
      this.chunks.push(road);

      // SIDEWALKS — concrete planes on each side
      const swGeo = new THREE.BoxGeometry(SIDEWALK_HALF - ROAD_HALF, 0.25, CHUNK_LENGTH);
      const swMat = this.sidewalkMats[this.currentBiomeIdx];
      const swL = new THREE.Mesh(swGeo, swMat);
      swL.position.set(-(ROAD_HALF + (SIDEWALK_HALF - ROAD_HALF) / 2), 0.05, zStart + CHUNK_LENGTH / 2);
      swL.receiveShadow = true;
      this.scene.add(swL);
      this.chunks.push(swL);
      const swR = new THREE.Mesh(swGeo, swMat);
      swR.position.set(ROAD_HALF + (SIDEWALK_HALF - ROAD_HALF) / 2, 0.05, zStart + CHUNK_LENGTH / 2);
      swR.receiveShadow = true;
      this.scene.add(swR);
      this.chunks.push(swR);

      // CURB — small white kerb between road and sidewalk
      const curbGeo = new THREE.BoxGeometry(0.18, 0.3, CHUNK_LENGTH);
      const curbL = new THREE.Mesh(curbGeo, this.curbMat);
      curbL.position.set(-(ROAD_HALF + 0.1), 0.075, zStart + CHUNK_LENGTH / 2);
      this.scene.add(curbL);
      this.chunks.push(curbL);
      const curbR = new THREE.Mesh(curbGeo, this.curbMat);
      curbR.position.set(ROAD_HALF + 0.1, 0.075, zStart + CHUNK_LENGTH / 2);
      this.scene.add(curbR);
      this.chunks.push(curbR);
    }

    // LAMPS — one per chunk, alternating sides → ~40m between lamps on the same side.
    // We use a monotonic spawn-counter (instead of deriving side from the chunk's
    // Z position) so the L/R/L/R pattern is guaranteed even if chunks are ever
    // inserted out of order or spawned at non-integer multiples of CHUNK_LENGTH.
    if (biome.decoMix.lamp > 0) {
      if (this._lampSpawnCounter == null) this._lampSpawnCounter = 0;
      const lampSide = (this._lampSpawnCounter % 2 === 0) ? -1 : 1;
      this._lampSpawnCounter++;
      this._spawnStreetLamp(lampSide, zStart + CHUNK_LENGTH / 2);
    }

    // PEDESTRIANS — walk along the sidewalks if pedestrian library is loaded
    if (this.pedestrianLibrary && this.pedestrianLibrary.length > 0) {
      // 1-2 per chunk, random sides, random z within chunk
      const pedCount = 1 + (Math.random() < 0.5 ? 1 : 0);
      for (let p = 0; p < pedCount; p++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const zPed = zStart + 2 + Math.random() * (CHUNK_LENGTH - 4);
        this._spawnPedestrian(side, zPed);
      }
    }

    // DECO PER SIDE (buildings / palms / cacti)
    for (let side of [-1, 1]) {
      // Buildings — dense in city (2-3 per side), sparse elsewhere
      const buildingCount = biome.decoMix.building > 0.7
        ? 2 + Math.floor(Math.random() * 2)
        : 1;
      for (let b = 0; b < buildingCount; b++) {
        if (biome.decoMix.building > 0 && Math.random() < biome.decoMix.building) {
          this._spawnBuilding(side, zStart);
        }
      }

      // Palm trees
      if (Math.random() < biome.decoMix.palm) {
        const palmZ = zStart + 3 + Math.random() * (CHUNK_LENGTH - 6);
        this._spawnPalm(side, palmZ);
      }
      if (Math.random() < biome.decoMix.palm * 0.6) {
        const palmZ = zStart + 10 + Math.random() * (CHUNK_LENGTH - 12);
        this._spawnPalm(side, palmZ);
      }

      // Cacti
      if (Math.random() < biome.decoMix.cactus) {
        const cactusZ = zStart + 3 + Math.random() * (CHUNK_LENGTH - 6);
        this._spawnCactus(side, cactusZ);
      }
      if (Math.random() < biome.decoMix.cactus * 0.6) {
        const cactusZ = zStart + 10 + Math.random() * (CHUNK_LENGTH - 12);
        this._spawnCactus(side, cactusZ);
      }
    }

    // Highway billboard — side-mounted, alternates sides based on chunk index, spawn sparingly
    if (Math.random() < biome.decoMix.billboard) {
      const chunkIdx = Math.round(zStart / CHUNK_LENGTH);
      const bbSide = (chunkIdx % 2 === 0) ? -1 : 1;
      this._spawnHighwayBillboard(bbSide, zStart + CHUNK_LENGTH / 2);
    }

    this.populateChunk(zStart);
  }

  // Spawn a pedestrian on the sidewalk, walking slowly along +Z or -Z.
  // side: -1 = left sidewalk, +1 = right sidewalk. z: center of initial position.
  _spawnPedestrian(side, z) {
    if (!this.pedestrianLibrary || this.pedestrianLibrary.length === 0) return;
    const idx = this._pickRandomIndexRecent(this.pedestrianLibrary.length, this._recentPedestrianIdx);
    const model = this.pedestrianLibrary[idx].clone(true);
    // Walk along near edge of sidewalk, jittered x within the sidewalk strip
    const sidewalkInner = ROAD_HALF + 0.6;
    const sidewalkOuter = SIDEWALK_HALF - 0.4;
    const xLocal = sidewalkInner + Math.random() * Math.max(0.1, sidewalkOuter - sidewalkInner);
    model.position.set(side * xLocal, 0, z);
    // Walking direction: 50/50 forward (-Z toward player) or backward (+Z away)
    const walkDir = Math.random() < 0.5 ? -1 : 1;
    // Face the walking direction
    model.rotation.y = walkDir < 0 ? Math.PI : 0;
    this.scene.add(model);
    this.pedestrians.push({
      mesh: model,
      walkSpeed: 1.1 + Math.random() * 0.6, // m/s in world frame
      walkDir,
      swayPhase: Math.random() * Math.PI * 2,
    });
  }

  _spawnStreetLamp(side, z) {
    // After _normalizeLampModel the lamp's arm points in +X, so for the
    // library case the model already carries a baseline rotation.y (from
    // the normalize step). We ADD the side yaw instead of overwriting it:
    //   right side (+1): +0 rad so arm keeps pointing outward (+x)
    //   left  side (-1): +π rad mirrors the arm to point outward (-x)
    const sideYaw = side > 0 ? 0 : Math.PI;
    // Auto-library — lanterns + lamps folders both feed this library.
    if (this.lampLibrary && this.lampLibrary.length > 0) {
      const idx = this._pickRandomIndexRecent(this.lampLibrary.length, this._recentLampIdx);
      const model = this.lampLibrary[idx].clone(true);
      model.position.set(side * (ROAD_HALF + 0.7), 0, z);
      // Preserve the normalize's auto-orient rotation; add the side flip on top.
      model.rotation.y = (model.rotation.y || 0) + sideYaw;
      this.scene.add(model);
      this.buildings.push(model);
      return;
    }
    // Single custom GLB override (legacy upload) — also uses the oriented yaw.
    if (this.customModels.lamp) {
      const model = this.customModels.lamp.clone(true);
      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const scale = 5 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      model.position.set(side * (ROAD_HALF + 0.7), 0, z);
      model.rotation.y = (model.rotation.y || 0) + sideYaw;
      model.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.scene.add(model);
      this.buildings.push(model);
      return;
    }
    const group = new THREE.Group();
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5, 8);
    const pole = new THREE.Mesh(poleGeo, this.lampPostMat);
    pole.position.y = 2.5;
    group.add(pole);
    // Base ring
    const baseGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.3, 10);
    const base = new THREE.Mesh(baseGeo, this.lampPostMat);
    base.position.y = 0.15;
    group.add(base);
    // Curved arm (simple horizontal cylinder)
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6);
    const arm = new THREE.Mesh(armGeo, this.lampPostMat);
    arm.position.set(side * -0.6, 5, 0); // arm extends toward road
    arm.rotation.z = Math.PI / 2;
    group.add(arm);
    // Lamp head housing
    const headGeo = new THREE.BoxGeometry(0.5, 0.18, 0.35);
    const head = new THREE.Mesh(headGeo, this.lampHeadMat);
    head.position.set(side * -1.1, 4.92, 0);
    group.add(head);
    // Glow plate (emissive bottom)
    const glowGeo = new THREE.BoxGeometry(0.42, 0.04, 0.28);
    const glow = new THREE.Mesh(glowGeo, this.lampGlowMat);
    glow.position.set(side * -1.1, 4.81, 0);
    group.add(glow);

    // No PointLight — too expensive on mobile. The emissive lampGlowMat carries the look.

    // Position the entire lamp on the sidewalk (just past the curb)
    group.position.set(side * (ROAD_HALF + 0.7), 0, z);
    this.scene.add(group);
    this.buildings.push(group);
  }

  _spawnBuilding(side, zStart) {
    // Auto-library — combined houses + buildings feed the same library.
    if (this.buildingLibrary && this.buildingLibrary.length > 0) {
      const idx = this._pickRandomIndexRecent(this.buildingLibrary.length, this._recentBuildingIdx);
      const model = this.buildingLibrary[idx].clone(true);
      const xOffset = SIDEWALK_HALF + 2.5 + Math.random() * 6;
      model.position.set(side * xOffset, 0, zStart + Math.random() * CHUNK_LENGTH);
      model.rotation.y = (Math.random() - 0.5) * 0.25;
      this.scene.add(model);
      this.buildings.push(model);
      return;
    }
    // Single custom GLB override (legacy upload)
    if (this.customModels.building) {
      const model = this.customModels.building.clone(true);
      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const scale = 6 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      const xOffset = SIDEWALK_HALF + 4 + Math.random() * 6;
      model.position.set(side * xOffset, 0, zStart + Math.random() * CHUNK_LENGTH);
      model.rotation.y = (Math.random() - 0.5) * 0.2;
      model.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.scene.add(model);
      this.buildings.push(model);
      return;
    }
    const mat = this.buildingMats[Math.floor(Math.random() * this.buildingMats.length)];
    const w = 3 + Math.random() * 4;
    const d = 3 + Math.random() * 4;
    const h = 6 + Math.random() * 14;
    const bGeo = new THREE.BoxGeometry(w, h, d);
    const b = new THREE.Mesh(bGeo, mat);
    b.castShadow = true;
    b.receiveShadow = true;
    // Push buildings clearly past sidewalk so billboards / lamps don't clip through them.
    const xOffset = SIDEWALK_HALF + 2.5 + w / 2 + Math.random() * 5;
    const zJitter = Math.random() * CHUNK_LENGTH;
    b.position.set(side * xOffset, h / 2, zStart + zJitter);
    b.rotation.y = (Math.random() - 0.5) * 0.15;
    this.scene.add(b);
    this.buildings.push(b);
  }

  _spawnHighwayBillboard(side, z) {
    // 1) Billboard library (public/models/billboards/*.glb) — picked randomly.
    //    Expected facing: board normal along +Z in source. Normalize scales to
    //    ~6m tall; spawn rotates so the board faces the road.
    if (this.billboardLibrary && this.billboardLibrary.length > 0) {
      const idx = this._pickRandomIndexRecent(this.billboardLibrary.length, this._recentBillboardIdx);
      const model = this.billboardLibrary[idx].clone(true);
      model.position.set(side * (SIDEWALK_HALF + 1.2), 0, z);
      // Right side (+1): face toward -X (toward road) → rotation.y = -π/2
      // Left  side (-1): face toward +X (toward road) → rotation.y = +π/2
      model.rotation.y = (model.rotation.y || 0) + (side > 0 ? -Math.PI / 2 : Math.PI / 2);
      this.scene.add(model);
      this.buildings.push(model);
      return;
    }
    // 2) Single custom GLB override (legacy upload)
    if (this.customModels.billboard) {
      const model = this.customModels.billboard.clone(true);
      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const scale = 6 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      model.position.set(side * (SIDEWALK_HALF + 1.2), 0, z);
      model.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      model.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.scene.add(model);
      this.buildings.push(model);
      return;
    }
    // Side-mounted highway billboard — slim profile, posts lie along Z so no clip into buildings
    const group = new THREE.Group();
    // Two posts, spaced along Z (they'll end up along world Z since we rotate ±π/2 ± 0.15)
    const postGeo = new THREE.CylinderGeometry(0.14, 0.18, 6.5, 8);
    const post1 = new THREE.Mesh(postGeo, this.billboardFrameMat);
    post1.position.set(-1.6, 3.25, 0);
    group.add(post1);
    const post2 = new THREE.Mesh(postGeo, this.billboardFrameMat);
    post2.position.set(1.6, 3.25, 0);
    group.add(post2);
    // Board frame
    const adW = 3.8, adH = 2.1;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(adW + 0.25, adH + 0.25, 0.15),
      this.billboardFrameMat
    );
    frame.position.set(0, 5.7, 0);
    group.add(frame);
    // Ad face (+Z normal in local space)
    const adGeo = new THREE.PlaneGeometry(adW, adH);
    const adMat = this.billboardAdMats[Math.floor(Math.random() * this.billboardAdMats.length)];
    const ad = new THREE.Mesh(adGeo, adMat);
    ad.position.set(0, 5.7, 0.09);
    ad.userData.adSlot = true;
    group.add(ad);

    // Position: just off the sidewalk, outboard. With rotation ≈ ±π/2, the posts lie
    // along world Z (same X as group), so the billboard is thin in world X — no clip.
    group.position.set(side * (SIDEWALK_HALF + 0.6), 0, z);
    // Face the road with a slight tilt toward the approaching player.
    // Right side (+1): face should point toward -X (road) slightly toward -Z (player)
    //   → rotation.y = -π/2 - small tilt
    // Left side (-1):  face toward +X slightly toward -Z → rotation.y = +π/2 + small tilt
    const tilt = Math.PI / 14;
    group.rotation.y = side > 0 ? (-Math.PI / 2 - tilt) : (Math.PI / 2 + tilt);

    this.scene.add(group);
    this.buildings.push(group);
  }

  _spawnPalm(side, z) {
    const group = new THREE.Group();
    // 1) Library-based palm (user-uploaded .glb in /public/models/palms)
    if (this.palmLibrary && this.palmLibrary.length > 0) {
      const idx = this._pickRandomIndexRecent(this.palmLibrary.length, this._recentPalmIdx);
      const model = this.palmLibrary[idx].clone(true);
      // Small random yaw so duplicates don't look like clones
      model.rotation.y = Math.random() * Math.PI * 2;
      // Slight scale jitter (±10%) for variety
      const s = 0.9 + Math.random() * 0.2;
      model.scale.multiplyScalar(s);
      group.add(model);
      group.position.set(side * (SIDEWALK_HALF + 1 + Math.random() * 2), 0, z);
      this.scene.add(group);
      this.buildings.push(group);
      return;
    }
    // 2) Procedural fallback palm
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 4, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.palmTrunkMat);
    trunk.position.y = 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    group.add(trunk);
    const frondGeo = new THREE.PlaneGeometry(2.4, 0.7);
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(frondGeo, this.palmFrondMat);
      const ang = (i / 6) * Math.PI * 2;
      f.position.set(Math.cos(ang) * 0.7, 4 + Math.random() * 0.2, Math.sin(ang) * 0.7);
      f.rotation.y = ang;
      f.rotation.z = -0.3;
      group.add(f);
    }
    const coconutMat = new THREE.MeshStandardMaterial({ color: 0x422006, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const cn = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), coconutMat);
      cn.position.set(
        (Math.random() - 0.5) * 0.4,
        3.85,
        (Math.random() - 0.5) * 0.4
      );
      group.add(cn);
    }
    group.position.set(side * (SIDEWALK_HALF + 1 + Math.random() * 2), 0, z);
    this.scene.add(group);
    this.buildings.push(group);
  }

  _spawnCactus(side, z) {
    const group = new THREE.Group();
    // Main body
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.4, 2.6, 10);
    const body = new THREE.Mesh(bodyGeo, this.cactusMat);
    body.position.y = 1.3;
    group.add(body);
    // Side arm
    const armGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.1, 8);
    const arm = new THREE.Mesh(armGeo, this.cactusMat);
    arm.position.set(0.45, 1.6, 0);
    arm.rotation.z = -Math.PI / 3;
    group.add(arm);
    const arm2 = new THREE.Mesh(armGeo.clone(), this.cactusMat);
    arm2.position.set(-0.45, 1.9, 0);
    arm2.rotation.z = Math.PI / 3;
    group.add(arm2);
    group.position.set(side * (SIDEWALK_HALF + 0.6 + Math.random() * 3), 0, z);
    this.scene.add(group);
    this.buildings.push(group);
  }

  // ─────────────────────────────────────────────────────────────
  // GAMEPLAY POPULATION (obstacles, coins, powerups)
  // ─────────────────────────────────────────────────────────────
  populateChunk(zStart) {
    if (zStart < CHUNK_LENGTH) return;

    // Ensure per-lane speed is initialized; re-seed occasionally for variety
    for (let k = 0; k < 3; k++) {
      if (this._laneSpeed[k] == null) this._laneSpeed[k] = 0.35 + Math.random() * 0.35;
    }

    // Density — keep the road navigable. The user was seeing too many
    // vehicles to weave through, so we back off the baseline.
    const obstacleCount = this.dangerZoneActive
      ? 1 + Math.floor(Math.random() * 2)   // 1–2 in danger zones
      : (Math.random() < 0.35 ? 0 : 1);     // ~35% chunks with no obstacles

    const obstacleZPositions = [];
    // Minimum Z distance between same-lane obstacles — prevents cars stacking.
    // Slightly looser so buses have room to breathe in their lane.
    const MIN_LANE_GAP = 12.0;

    for (let i = 0; i < obstacleCount; i++) {
      const z = zStart + 4 + Math.random() * (CHUNK_LENGTH - 8);
      obstacleZPositions.push(z);

      // GUARANTEED CORRIDOR: block at most 1 lane per z so the player can
      // always weave through. (Two-lane blocks across multiple z positions
      // are still possible because multiple chunks' obstacles coexist, but
      // no single z is a wall.)
      const lanesBlocked = 1;
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, lanesBlocked);

      lanes.forEach(lane => {
        // Enforce minimum Z gap in the same lane — skip spawn if too close
        // to any existing obstacle in that lane, no matter its Z position.
        const tooClose = this.obstacles.some((o) => {
          if (!o || !o.mesh) return false;
          // Compare lane by x position of the mesh
          if (Math.abs(o.mesh.position.x - LANES[lane]) > 0.1) return false;
          // Give buses extra clearance both ahead and behind so nothing spawns
          // on top of them.
          const gap = (o.type === 'full') ? 18.0 : MIN_LANE_GAP;
          return Math.abs(o.mesh.position.z - z) < gap;
        });
        if (tooClose) return;
        // Bus spawn rate: only ~18% of obstacles are full-lane blockers so
        // the road feels driveable. (Was ~35%.)
        const type = Math.random() < 0.18 ? 0.99 : Math.random() * 0.6;
        this.spawnObstacle(LANES[lane], z, type);
      });
    }

    const coinPatterns = ['line', 'zigzag', 'arc'];
    const pattern = coinPatterns[Math.floor(Math.random() * coinPatterns.length)];
    this.spawnCoinPattern(zStart, pattern, obstacleZPositions);

    if (this.coinRushActive) {
      const extras = ['line', 'zigzag'];
      const extra = extras[Math.floor(Math.random() * extras.length)];
      this.spawnCoinPattern(zStart + CHUNK_LENGTH * 0.5, extra, obstacleZPositions);
    }

    // Powerup spawn — rare and spaced
    this.distSinceLastPowerup += CHUNK_LENGTH;
    if (this.distSinceLastPowerup >= 180 && Math.random() < 0.15) {
      let tries = 6;
      while (tries-- > 0) {
        const z = zStart + 4 + Math.random() * (CHUNK_LENGTH - 8);
        if (obstacleZPositions.some(oz => Math.abs(oz - z) < 3)) continue;
        const lane = Math.floor(Math.random() * 3);
        const kind = Math.random() < 0.12 ? 'ghost' : 'coin2x';
        this.spawnPowerup(LANES[lane], z, kind);
        this.distSinceLastPowerup = 0;
        break;
      }
    }
  }

  spawnPowerup(x, z, kind) {
    const geo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const mat = kind === 'ghost' ? this.powerupGhostMat : this.powerupCoinMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 1.2, z);
    mesh.castShadow = true;

    const haloGeo = new THREE.RingGeometry(0.55, 0.8, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: kind === 'ghost' ? 0x22d3ee : 0xfbbf24,
      transparent: true, opacity: 0.35, side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    mesh.add(halo);

    this.scene.add(mesh);
    this.powerups.push({
      mesh, halo, kind, collected: false,
      baseY: 1.2,
      tOffset: Math.random() * Math.PI * 2,
      bbox: new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, 1.2, z),
        new THREE.Vector3(0.9, 0.9, 0.9)
      ),
    });
  }

  // Build a stylized parked car (body + cabin + glass + wheels + lights) as a Group.
  // Returns a new Group positioned at origin; caller sets group.position.
  _buildCar() {
    const group = new THREE.Group();

    // 1) Built-in car library (preprocessed on load) — pick a random one
    //    that isn't in our recent-picks history, so the fleet feels varied.
    if (this.carLibrary && this.carLibrary.length > 0) {
      const idx = this._pickRandomIndexRecent(this.carLibrary.length, this._recentCarIdx);
      const model = this.carLibrary[idx].clone(true);
      // Small random rotation (±2°) makes the fleet look less like a convoy
      model.rotation.y += (Math.random() - 0.5) * 0.07;
      group.add(model);
      return group;
    }

    // If a car library was requested (URLs provided) but hasn't loaded yet,
    // DO NOT fall back to procedural geometry — user wants only 3D models.
    if (this._libraryRequested && this._libraryRequested.has('car')) {
      return null;
    }

    // 2) Single custom upload (from Model-Panel) — normalize and use it.
    if (this.customModels.car) {
      const model = this._normalizeCarModel(this.customModels.car.clone(true));
      group.add(model);
      return group;
    }

    // Procedural car
    const palette = [0xef4444, 0x3b82f6, 0xfbbf24, 0x10b981, 0xa855f7, 0xf97316];
    const bodyColor = palette[Math.floor(Math.random() * palette.length)];
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor, roughness: 0.35, metalness: 0.5,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0b1220, roughness: 0.12, metalness: 0.25,
      emissive: 0x1e3a5a, emissiveIntensity: 0.22,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a, roughness: 0.8, metalness: 0.1,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8, roughness: 0.3, metalness: 0.7,
    });
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfff7c0, emissive: 0xfffbe0, emissiveIntensity: 0.9,
      roughness: 0.3, metalness: 0.2,
    });
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xff4444, emissive: 0xff0000, emissiveIntensity: 0.9,
      roughness: 0.3, metalness: 0.2,
    });
    // Lower body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 3.2), bodyMat);
    body.position.y = 0.55;
    group.add(body);
    // Cabin
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 1.55), bodyMat);
    cab.position.set(0, 1.05, -0.2);
    group.add(cab);
    // Glass strips around cabin (tinted)
    const frontG = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.55), glassMat);
    frontG.position.set(0, 1.05, 0.58); frontG.rotation.x = -0.35;
    group.add(frontG);
    const rearG = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.45), glassMat);
    rearG.position.set(0, 1.05, -0.97); rearG.rotation.x = 0.38; rearG.rotation.y = Math.PI;
    group.add(rearG);
    [-0.86, 0.86].forEach((sx) => {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), glassMat);
      sw.position.set(sx, 1.05, -0.2);
      sw.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
      group.add(sw);
    });
    // Wheels (4)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 14);
    [[-0.8, 0.32, 1.05], [0.8, 0.32, 1.05], [-0.8, 0.32, -1.05], [0.8, 0.32, -1.05]]
      .forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, wy, wz);
        wheel.rotation.z = Math.PI / 2;
        group.add(wheel);
        // Chrome rim center
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.30, 10), rimMat);
        rim.position.set(wx, wy, wz);
        rim.rotation.z = Math.PI / 2;
        group.add(rim);
      });
    // Headlights (front)
    [-0.6, 0.6].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), headlightMat);
      hl.position.set(hx, 0.6, 1.62);
      group.add(hl);
    });
    // Taillights (rear)
    [-0.6, 0.6].forEach((hx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), tailMat);
      tl.position.set(hx, 0.75, -1.62);
      group.add(tl);
    });
    // Front grille / bumper (dark strip)
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937, roughness: 0.7, metalness: 0.6,
    });
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 0.08), bumperMat);
    grille.position.set(0, 0.45, 1.62);
    group.add(grille);
    return group;
  }

  spawnObstacle(x, z, type) {
    let mesh;
    let obstacleType;
    let halfExtents = null; // { x, yMin, yMax, z } — if set, bbox follows mesh.position each frame
    let moveFactor = 0; // 0 = static, 1 = moves with player (invisible). 0.5 ≈ highway feel.

    // Only two obstacle types left: jumpable car (low) and lane-blocking bus (full).
    // Duck-under barriers removed per user request.
    if (type < 0.65) {
      // CAR — jump over it (driving car on the highway)
      mesh = this._buildCar();
      // If a car library was requested but no models are loaded yet, _buildCar
      // returns null. Skip the spawn entirely so procedural block cars don't
      // flash on-screen while the GLBs are still being fetched.
      if (!mesh) return;
      mesh.position.set(x, 0, z);
      obstacleType = 'low';
      // Manual bbox: only covers the body up to ~0.9m, so a jump clears it reliably.
      // Sized for a 4m-long car.
      halfExtents = { x: 0.95, yMin: 0.0, yMax: 0.9, z: 2.0 };
      // Same-lane cars share the lane's cruising speed → no rear-ends.
      const laneIdx = LANES.indexOf(x);
      moveFactor = (laneIdx >= 0 && this._laneSpeed[laneIdx] != null)
        ? this._laneSpeed[laneIdx]
        : 0.45;
    } else {
      // FULL: long blocker — bus or truck from library. Too long to jump over.
      // Must lane-change. Drifts forward at moderate highway speed.
      // Same lane = same speed (prevents rear-ending other vehicles)
      const laneIdxFull = LANES.indexOf(x);
      const laneBaseSpeed = (laneIdxFull >= 0 && this._laneSpeed[laneIdxFull] != null)
        ? this._laneSpeed[laneIdxFull]
        : 0.4;
      if (this.busLibrary && this.busLibrary.length > 0) {
        const idx = this._pickRandomIndexRecent(this.busLibrary.length, this._recentBusIdx);
        mesh = new THREE.Group();
        mesh.add(this.busLibrary[idx].clone(true));
        mesh.position.set(x, 0, z);
        // Bus bbox ≈ 10m long, 1.3m half-width, 3m tall. Full height so
        // jumps and slides can't avoid it.
        halfExtents = { x: 1.3, yMin: 0.0, yMax: 3.0, z: 5.0 };
        // Buses ride slightly slower than cars in same lane
        moveFactor = Math.max(0.2, laneBaseSpeed - 0.15);
      } else if (this._libraryRequested && this._libraryRequested.has('bus')) {
        // Bus library was requested (URLs provided) but not yet loaded —
        // skip the spawn instead of showing procedural block geometry.
        return;
      } else {
        // Fallback: procedural subway wagon
        moveFactor = Math.max(0.2, laneBaseSpeed - 0.15);
        halfExtents = { x: 1.15, yMin: 0.0, yMax: 2.3, z: 2.3 };
        mesh = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626, roughness: 0.55, metalness: 0.15,
        });
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0xd4d4d8, roughness: 0.45, metalness: 0.6,
        });
        const underMat = new THREE.MeshStandardMaterial({
          color: 0x1f2937, roughness: 0.9, metalness: 0.1,
        });
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 4.5), bodyMat);
        body.position.set(0, 1.0, 0);
        mesh.add(body);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.16, 4.55), roofMat);
        roof.position.set(0, 2.08, 0);
        mesh.add(roof);
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.35, 4.45), underMat);
        chassis.position.set(0, 0.18, 0);
        mesh.add(chassis);
        const frontGeo = new THREE.PlaneGeometry(2.2, 2.0);
        const front = new THREE.Mesh(frontGeo, this.obstacleMat3);
        front.position.set(0, 1.0, -2.26);
        front.rotation.y = Math.PI;
        mesh.add(front);
        const winMat = new THREE.MeshStandardMaterial({
          color: 0x22d3ee, emissive: 0x0ea5e9, emissiveIntensity: 0.25,
          roughness: 0.3, metalness: 0.4,
        });
        [-1.11, 1.11].forEach((sx) => {
          for (let k = 0; k < 4; k++) {
            const w = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.65), winMat);
            w.position.set(sx, 1.35, -1.6 + k * 1.1);
            mesh.add(w);
          }
        });
        mesh.position.set(x, 0, z);
      }
      obstacleType = 'full';
    }

    // Enable shadow casting on all obstacle meshes (groups or single meshes)
    if (mesh.traverse) {
      mesh.traverse((c) => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
      });
    } else {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    this.scene.add(mesh);

    const bbox = new THREE.Box3();
    if (halfExtents) {
      bbox.min.set(x - halfExtents.x, halfExtents.yMin, z - halfExtents.z);
      bbox.max.set(x + halfExtents.x, halfExtents.yMax, z + halfExtents.z);
    } else {
      bbox.setFromObject(mesh);
    }
    this.obstacles.push({
      mesh,
      type: obstacleType,
      bbox,
      halfExtents,   // if set, update loop recomputes bbox each frame from mesh.position
      moveFactor,    // 0..1 — portion of player speed the obstacle matches (highway illusion)
    });
  }

  spawnCoinPattern(zStart, pattern, obstacleZs) {
    // 3D rotating coin — torus gives a nice chunky coin silhouette
    const coinGeo = new THREE.TorusGeometry(0.32, 0.10, 12, 24);
    const count = 8;
    const laneIdx = Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const z = zStart + 2 + t * (CHUNK_LENGTH - 4);

      const tooClose = obstacleZs.some(oz => Math.abs(oz - z) < 1.5);
      if (tooClose) continue;

      let x, y = 1.0;
      if (pattern === 'line') {
        x = LANES[laneIdx];
      } else if (pattern === 'zigzag') {
        x = LANES[(laneIdx + Math.floor(i / 2)) % 3];
      } else {
        x = LANES[laneIdx];
        y = 1.0 + Math.sin(t * Math.PI) * 1.2;
      }

      const coin = new THREE.Mesh(coinGeo, this.coinMat);
      // Default torus orientation: hole faces +Z (toward camera) — perfect coin look
      coin.position.set(x, y, z);
      coin.castShadow = true;
      // Glow halo sprite (always faces camera)
      const halo = new THREE.Sprite(this._coinHaloMat);
      halo.scale.set(1.4, 1.4, 1);
      coin.add(halo);
      this.scene.add(coin);

      this.coins.push({
        mesh: coin,
        collected: false,
        bbox: new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(0.7, 0.7, 0.7)
        ),
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ─────────────────────────────────────────────────────────────
  update(dt, speed, character) {
    const dz = speed * dt;
    let hitObstacle = false;
    let coinsCollected = 0;
    let powerupPicked = null;
    this._powerupTimer = (this._powerupTimer || 0) + dt;
    this.totalDistance += dz;

    // Biome change check
    for (let i = BIOMES.length - 1; i >= 0; i--) {
      if (this.totalDistance >= BIOMES[i].start) {
        if (i !== this.currentBiomeIdx) this._setBiome(i);
        break;
      }
    }

    this.chunks.forEach(c => c.position.z -= dz);
    this.decorations.forEach(d => d.position.z -= dz);
    this.buildings.forEach(b => b.position.z -= dz);

    // Despawn buildings/scenery past camera
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      if (this.buildings[i].position.z < DESPAWN_DISTANCE) {
        this.scene.remove(this.buildings[i]);
        this.buildings.splice(i, 1);
      }
    }

    // Subtle dust drift
    if (this.dust) {
      const pos = this.dust.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] -= dz * 0.6;
        pos[i + 1] += Math.sin(this._powerupTimer * 1.5 + i) * dt * 0.06;
        if (pos[i + 2] < -10) {
          pos[i + 2] = 70 + Math.random() * 15;
          pos[i + 0] = (Math.random() - 0.5) * 30;
          pos[i + 1] = Math.random() * 10 + 1;
        }
      }
      this.dust.geometry.attributes.position.needsUpdate = true;
    }

    // Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      // Moving vehicles (cars, buses) drift forward → z moves slower than the
      // static world, giving the illusion of driving on a highway.
      const moveFactor = o.moveFactor || 0;
      o.mesh.position.z -= dz * (1 - moveFactor);
      // Refresh bbox — half-extent vehicles follow mesh.position each frame
      if (o.halfExtents) {
        const p = o.mesh.position;
        const h = o.halfExtents;
        o.bbox.min.set(p.x - h.x, h.yMin, p.z - h.z);
        o.bbox.max.set(p.x + h.x, h.yMax, p.z + h.z);
      } else {
        o.bbox.setFromObject(o.mesh);
      }

      if (character.bbox.intersectsBox(o.bbox)) {
        const charY = character.group.position.y;
        const charSliding = character.isSliding;
        if (o.type === 'low' && charY > 0.9) continue;
        if (o.type === 'high' && charSliding) continue;
        if (o.type === 'hole' && charY > 0.8) continue; // airborne above the hole
        hitObstacle = true;
      }

      if (o.mesh.position.z < DESPAWN_DISTANCE) {
        this.scene.remove(o.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // ───── Per-lane follow-logic ─────
    // Cars behind a bus/truck in the same lane should queue up behind it instead
    // of driving through. Sort by z ascending (closest→farthest from player) and
    // enforce a minimum spacing so trailing vehicles get pushed back. We also
    // match the follower's forward speed to the leader's so they stay tucked in
    // behind — no more cars driving into a bus's tailgate.
    //
    // NOTE: obstacle types are 'low' (car) and 'full' (bus). Earlier versions
    // used 'car' here which never matched and caused the bug.
    {
      const byLane = [[], [], []];
      for (let i = 0; i < this.obstacles.length; i++) {
        const o = this.obstacles[i];
        if (o.type !== 'low' && o.type !== 'full') continue;
        const lane = LANES.indexOf(o.mesh.position.x);
        if (lane >= 0) byLane[lane].push(o);
      }
      for (let l = 0; l < 3; l++) {
        // Sort by z ascending so byLane[l][0] is the frontmost (lowest z, closest to player)
        byLane[l].sort((a, b) => a.mesh.position.z - b.mesh.position.z);
        for (let i = 1; i < byLane[l].length; i++) {
          const ahead = byLane[l][i - 1];   // closer to player (lower z)
          const curr = byLane[l][i];        // farther away (higher z) -> the follower
          // Min gap scales with BOTH vehicle lengths. Half-Z extents we use:
          //   car  → 2.0m (overall ~4m long)
          //   bus  → 5.0m (overall ~10m long)
          // Add a 2m safety cushion so bodies never clip or touch.
          const halfZ = (o) => (o.type === 'full' ? 5.0 : 2.0);
          const MIN_GAP = halfZ(ahead) + halfZ(curr) + 2.0;
          // curr is *behind* ahead in the world (higher z = farther from player)
          const gap = curr.mesh.position.z - ahead.mesh.position.z;
          if (gap < MIN_GAP) {
            curr.mesh.position.z = ahead.mesh.position.z + MIN_GAP;
            // Re-sync bbox after snap
            if (curr.halfExtents) {
              const p = curr.mesh.position;
              const h = curr.halfExtents;
              curr.bbox.min.set(p.x - h.x, h.yMin, p.z - h.z);
              curr.bbox.max.set(p.x + h.x, h.yMax, p.z + h.z);
            } else {
              curr.bbox.setFromObject(curr.mesh);
            }
          }
          // Lock both vehicles in the pair to the faster forward speed so the
          // queue stays tucked together and keeps pace with the faster of the
          // two. moveFactor = portion of player speed the obstacle matches
          // (higher = stays farther from player, closer to parked-forward).
          // Using the max() means a slow bus riding in front of a fast car
          // gets dragged along at the car's speed, preventing both the car
          // clipping into the bus and the bus looming at the player too fast.
          const syncF = Math.max(curr.moveFactor, ahead.moveFactor);
          curr.moveFactor = syncF;
          ahead.moveFactor = syncF;
        }
      }
    }

    // ───── Pedestrians (walking on the sidewalk) ─────
    if (this.pedestrians && this.pedestrians.length > 0) {
      for (let i = this.pedestrians.length - 1; i >= 0; i--) {
        const ped = this.pedestrians[i];
        // World drift (like buildings) PLUS the pedestrian's own walk velocity.
        // walkDir = -1 (toward player), +1 (away from player).
        ped.mesh.position.z -= dz;
        ped.mesh.position.z += ped.walkDir * ped.walkSpeed * dt;
        // Gentle sway for liveliness
        ped.swayPhase += dt * 6;
        ped.mesh.rotation.z = Math.sin(ped.swayPhase) * 0.04;
        ped.mesh.position.y = Math.abs(Math.sin(ped.swayPhase * 2)) * 0.03;
        // Despawn when past camera (either end of the world)
        if (ped.mesh.position.z < DESPAWN_DISTANCE || ped.mesh.position.z > SPAWN_DISTANCE + 20) {
          this.scene.remove(ped.mesh);
          this.pedestrians.splice(i, 1);
        }
      }
    }

    // Coins — Subway-Surfers-style spin around the vertical axis
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.mesh.position.z -= dz;
      c.mesh.rotation.y += dt * 5;            // face -> edge -> face, classic coin twirl

      c.bbox.setFromCenterAndSize(
        c.mesh.position,
        new THREE.Vector3(0.75, 0.75, 0.75)
      );

      if (!c.collected && character.bbox.intersectsBox(c.bbox)) {
        c.collected = true;
        coinsCollected++;
        c.mesh.scale.multiplyScalar(1.5);
        setTimeout(() => this.scene.remove(c.mesh), 100);
      }

      if (c.mesh.position.z < DESPAWN_DISTANCE) {
        this.scene.remove(c.mesh);
        this.coins.splice(i, 1);
      }
    }

    // Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.mesh.position.z -= dz;
      p.mesh.rotation.y += dt * 2;
      p.mesh.rotation.x += dt * 0.7;
      p.mesh.position.y = p.baseY + Math.sin(this._powerupTimer * 2 + p.tOffset) * 0.15;
      if (p.halo) {
        const pulse = 1 + Math.sin(this._powerupTimer * 4 + p.tOffset) * 0.2;
        p.halo.scale.set(pulse, pulse, pulse);
      }

      p.bbox.setFromCenterAndSize(
        p.mesh.position,
        new THREE.Vector3(1.0, 1.0, 1.0)
      );

      if (!p.collected && character.bbox.intersectsBox(p.bbox)) {
        p.collected = true;
        powerupPicked = p.kind;
        p.mesh.scale.multiplyScalar(1.8);
        setTimeout(() => this.scene.remove(p.mesh), 150);
      }

      if (p.mesh.position.z < DESPAWN_DISTANCE) {
        this.scene.remove(p.mesh);
        this.powerups.splice(i, 1);
      }
    }

    // Spawn next chunk
    const furthestChunk = this.chunks.reduce((max, c) =>
      c.position.z > max ? c.position.z : max, 0);
    if (furthestChunk < SPAWN_DISTANCE) {
      this.spawnChunk(furthestChunk + CHUNK_LENGTH);
    }

    // Cleanup chunks/decorations past camera
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      if (this.chunks[i].position.z < DESPAWN_DISTANCE) {
        this.scene.remove(this.chunks[i]);
        this.chunks.splice(i, 1);
      }
    }
    for (let i = this.decorations.length - 1; i >= 0; i--) {
      if (this.decorations[i].position.z < DESPAWN_DISTANCE) {
        this.scene.remove(this.decorations[i]);
        this.decorations.splice(i, 1);
      }
    }

    return { hitObstacle, coinsCollected, powerupPicked };
  }

  // Public API: swap an ad placeholder texture later when you have real images
  setAdImage(imageUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const newMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      // Rotate through ad slots so future spawns use it too
      this.billboardAdMats.push(newMat);
    });
  }

  // Public API: upload custom skins for buildings / lamps / palms / cacti / road / sidewalk / ad
  // kind: 'building' | 'lamp' | 'palm' | 'cactus' | 'road' | 'sidewalk' | 'ad'
  // imageUrl: any URL (blob: from <input type=file> works great)
  setSkin(kind, imageUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 4;

      const apply = (mat, tileX = 1, tileY = 1) => {
        if (!mat) return;
        const utex = tex.clone();
        utex.needsUpdate = true;
        utex.repeat.set(tileX, tileY);
        utex.wrapS = utex.wrapT = THREE.RepeatWrapping;
        mat.map = utex;
        if (mat.color) mat.color.set(0xffffff);
        if ('emissiveMap' in mat) { mat.emissiveMap = utex; }
        mat.needsUpdate = true;
      };

      switch (kind) {
        case 'building':
          this.buildingMats.forEach((m) => apply(m, 1, 2));
          break;
        case 'lamp':
          apply(this.lampPostMat, 1, 2);
          apply(this.lampHeadMat, 1, 1);
          break;
        case 'palm':
          apply(this.palmTrunkMat, 1, 2);
          break;
        case 'cactus':
          apply(this.cactusMat, 1, 2);
          break;
        case 'road':
        case 'asphalt':
          apply(this.asphaltMat, 1, 4);
          break;
        case 'sidewalk':
          this.sidewalkMats.forEach((m) => apply(m, 2, 4));
          break;
        case 'ad':
        case 'billboard': {
          const adMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
          this.billboardAdMats.push(adMat);
          break;
        }
      }
    });
  }

  // Public API: upload custom 3D models (.glb / .gltf) for decorations and obstacles.
  // kind: 'lamp' | 'building' | 'billboard' | 'palm' | 'cactus' | 'car' | 'train'
  // url: any URL (blob: from <input type=file> works great)
  setModel(kind, url) {
    if (!(kind in this.customModels)) {
      console.warn('[track] setModel: unknown kind', kind);
      return;
    }
    this._gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!model) {
          console.error('[track] setModel: no scene in GLB for', kind);
          return;
        }
        this._prepareModelMaterials(model);
        this.customModels[kind] = model;
        console.log('[track] custom model loaded for', kind);
      },
      undefined,
      (err) => console.error('[track] GLB load failed for', kind, err)
    );
  }

  // Ensure materials render correctly in our lit scene:
  //  - Shadows on/off per mesh
  //  - Force opaque / DoubleSide for Sketchfab-style models whose back faces
  //    sometimes get culled out of view
  //  - Clamp metalness/roughness: most Sketchfab models use metalness=1 / roughness=0
  //    which renders near-black without an envMap. Clamping makes them diffuse & bright.
  //  - Strip alphaTest / alpha issues that show bodies as black
  _prepareModelMaterials(root) {
    root.traverse((c) => {
      if (!c.isMesh) return;
      c.castShadow = true;
      c.receiveShadow = true;
      c.frustumCulled = true;
      const fixMat = (m) => {
        if (!m) return m;
        // Diffuse-ify metal-heavy materials so they aren't pitch-black under our lights
        if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, 0.3);
        if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.5, 0.5);
        // Don't cull back faces — Sketchfab exports often miss interior faces
        m.side = THREE.DoubleSide;
        // Force opaque if it was set transparent with full opacity
        if (m.transparent && m.opacity > 0.95) m.transparent = false;
        // Kill broken alphaTest (happens when alphaMap is missing)
        if (m.alphaTest > 0 && !m.alphaMap) m.alphaTest = 0;
        // Lift nearly-black base colors (ambient-only scene can't light pure-black)
        if (m.color) {
          const c2 = m.color;
          const lum = c2.r * 0.3 + c2.g * 0.59 + c2.b * 0.11;
          if (lum < 0.04 && !m.map) c2.setRGB(0.35, 0.35, 0.38);
        }
        if (m.map) {
          m.map.colorSpace = THREE.SRGBColorSpace;
          m.map.anisotropy = 4;
        }
        m.needsUpdate = true;
        return m;
      };
      c.material = Array.isArray(c.material) ? c.material.map(fixMat) : fixMat(c.material);
    });
  }

  // Shared helper: orient the longest axis along Z, uniform-scale to a target
  // length, center on X, ground on Y. Returns the same model (mutated).
  _normalizeVehicleModel(model, targetLength) {
    this._prepareModelMaterials(model);
    let bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    if (size.x > size.z) {
      model.rotation.y = Math.PI / 2;
      model.updateMatrixWorld(true);
      bbox = new THREE.Box3().setFromObject(model);
    }
    const newSize = bbox.getSize(new THREE.Vector3());
    const longest = Math.max(newSize.x, newSize.z, 0.001);
    const scale = targetLength / longest;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const finalBbox = new THREE.Box3().setFromObject(model);
    const center = finalBbox.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= finalBbox.min.y;
    return model;
  }

  // Car: ~4.0m long (realistic sedan/hatchback). Jumpable obstacle.
  _normalizeCarModel(model) {
    return this._normalizeVehicleModel(model, 4.0);
  }

  // Bus/truck: ~10m long, too long to jump over. Lane-change only.
  _normalizeBusModel(model) {
    return this._normalizeVehicleModel(model, 10.0);
  }

  // Load cars into the built-in library.
  loadBuiltinCarLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.carLibrary, 'car',
      (model) => this._normalizeCarModel(model));
  }

  // Load long blocker vehicles (bus, lorry, truck).
  loadBuiltinBusLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.busLibrary, 'bus',
      (model) => this._normalizeBusModel(model));
  }

  // Load roadside buildings / houses. Auto-scaled to ~12m tall.
  loadBuiltinBuildingLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.buildingLibrary, 'building',
      (model) => this._normalizeBuildingModel(model));
  }

  // Load street lamps / lanterns — scaled to ~5m tall, grounded.
  loadBuiltinLampLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.lampLibrary, 'lamp',
      (model) => this._normalizeLampModel(model));
  }

  // Load pedestrians — scaled to ~1.75m tall, grounded.
  loadBuiltinPedestrianLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.pedestrianLibrary, 'pedestrian',
      (model) => this._normalizePedestrianModel(model));
  }

  // Load palm trees — scaled to ~4.5m tall, grounded.
  loadBuiltinPalmLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.palmLibrary, 'palm',
      (model) => this._normalizePalmModel(model));
  }

  // Load highway billboards — scaled to ~6m tall, grounded.
  loadBuiltinBillboardLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.billboardLibrary, 'billboard',
      (model) => this._normalizeBillboardModel(model));
  }

  // Load road segments (e.g. poly.pizza "Street Straight"). Each segment is
  // auto-scaled so its +Z length matches CHUNK_LENGTH (20m) and its X width
  // matches the full road+sidewalk span.
  loadBuiltinRoadLibrary(manifest) {
    this._loadLibraryGeneric(manifest, this.roadLibrary, 'road',
      (model) => this._normalizeRoadModel(model));
  }

  // Shared loader helper.
  //  - De-dupes URLs so duplicates in the manifest don't double-fill.
  //  - HEAD-probes each URL so missing files (404) are silently skipped —
  //    the manifest can include speculative names (car1..car20) and only
  //    the ones that actually exist get parsed.
  //  - Additive: re-calling with a new manifest never drops already-loaded
  //    models; duplicates detected by URL are skipped.
  _loadLibraryGeneric(manifest, target, label, normalize) {
    if (!Array.isArray(manifest) || manifest.length === 0) return;
    // Persist the "seen" set across calls so subsequent calls stay additive
    // without double-loading the same URL.
    if (!this._loadedUrls) this._loadedUrls = new Set();
    if (!this._libraryRequested) this._libraryRequested = new Set();
    // Mark this library kind as "requested" so spawn code knows to wait for
    // 3D models rather than falling back to procedural geometry.
    this._libraryRequested.add(label);
    const localSeen = new Set();
    manifest.forEach((url) => {
      if (!url) return;
      if (this._loadedUrls.has(url) || localSeen.has(url)) return;
      localSeen.add(url);
      fetch(url, { method: 'HEAD' }).then((r) => {
        if (!r.ok) return;
        // Mark only after a successful HEAD so a flaky 500 can be retried later.
        this._loadedUrls.add(url);
        this._gltfLoader.load(
          url,
          (gltf) => {
            const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            if (!model) return;
            const normalized = normalize(model);
            target.push(normalized);
            console.log('[track]', label, 'library +', url, '→', target.length);
          },
          undefined,
          (err) => console.warn('[track]', label, 'GLB parse failed:', url, err)
        );
      }).catch(() => { /* ignore network errors for optional files */ });
    });
  }

  // Building: scale by tallest dimension to ~12m. Preserves aspect ratio.
  _normalizeBuildingModel(model) {
    this._prepareModelMaterials(model);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const scale = 12 / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const finalBbox = new THREE.Box3().setFromObject(model);
    const center = finalBbox.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= finalBbox.min.y;
    return model;
  }

  // Lamp: scale to ~5m tall, grounded, AND auto-rotated so the arm/head
  // always extends in the +X direction after normalize. That way the spawn
  // code can trivially mirror left-side lamps to point outward toward the
  // sidewalk (rotation.y = π for left, 0 for right).
  _normalizeLampModel(model) {
    this._prepareModelMaterials(model);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const scale = 5 / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    // First ground & center the whole model at origin.
    let fb = new THREE.Box3().setFromObject(model);
    let center = fb.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= fb.min.y;
    model.updateMatrixWorld(true);
    // Now detect which horizontal direction the "head" is offset in. The head
    // sits on top of the trunk, so we find the mesh geometry above 2/3 of the
    // total height and compute its horizontal centroid. Whichever of ±X or
    // ±Z is biggest wins; we apply a yaw so that direction becomes +X.
    fb = new THREE.Box3().setFromObject(model);
    const totalH = fb.max.y - fb.min.y;
    const headCutoffY = fb.min.y + totalH * 0.55;
    let sumX = 0, sumZ = 0, sumW = 0;
    const v = new THREE.Vector3();
    model.traverse((c) => {
      if (!c.isMesh || !c.geometry) return;
      const pos = c.geometry.attributes && c.geometry.attributes.position;
      if (!pos) return;
      // Sample up to 200 vertices per mesh to keep this cheap.
      const step = Math.max(1, Math.floor(pos.count / 200));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i);
        v.applyMatrix4(c.matrixWorld);
        if (v.y < headCutoffY) continue;
        sumX += v.x; sumZ += v.z; sumW++;
      }
    });
    if (sumW > 0) {
      const cx = sumX / sumW;
      const cz = sumZ / sumW;
      // Angle from +X axis in X/Z plane. We want head to be at +X (angle=0),
      // so rotate model by -angle around Y.
      const ang = Math.atan2(cz, cx);
      // Apply even for subtle head offsets so the arm/bulb points in a
      // deterministic +X direction. Lanterns with a single vertical
      // bulb-on-top design (offset < 0.02m) are truly symmetric and fall
      // through, but almost any arm/head extension triggers the rotate.
      const offsetMag = Math.hypot(cx, cz);
      if (offsetMag > 0.05) {
        model.rotation.y -= ang;
        model.updateMatrixWorld(true);
        // Re-center after rotate because the origin may have drifted slightly.
        fb = new THREE.Box3().setFromObject(model);
        center = fb.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= fb.min.y;
      }
    }
    return model;
  }

  // Pedestrian: scale to ~1.75m tall, grounded.
  _normalizePedestrianModel(model) {
    this._prepareModelMaterials(model);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const scale = 1.75 / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const finalBbox = new THREE.Box3().setFromObject(model);
    const center = finalBbox.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= finalBbox.min.y;
    return model;
  }

  // Road segment: scale to exactly CHUNK_LENGTH (20m) along Z and ~15m on X
  // (the full road+sidewalk span). Grounded so y=0 sits at the top of the
  // road surface. Any included sidewalks/curbs are baked into the model.
  _normalizeRoadModel(model) {
    this._prepareModelMaterials(model);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    // Fit to chunk length along Z while keeping width/height proportional-ish.
    // We use the Z-based scale as the uniform scale so lane widths stay sane.
    const scaleZ = CHUNK_LENGTH / Math.max(size.z, 0.001);
    model.scale.setScalar(scaleZ);
    model.updateMatrixWorld(true);
    const finalBbox = new THREE.Box3().setFromObject(model);
    const center = finalBbox.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    // Ground so the top of the asphalt sits at y=0 (same plane as the
    // procedural road). We assume the model's road surface is at finalBbox.max.y
    // minus a small offset — practically, grounding on min.y works for most
    // poly.pizza road meshes since they're modelled flat on the ground plane.
    model.position.y -= finalBbox.min.y;
    return model;
  }

  // Billboard: scale to ~6m tall, grounded.
  _normalizeBillboardModel(model) {
    this._prepareModelMaterials(model);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const scale = 6 / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const finalBbox = new THREE.Box3().setFromObject(model);
    const center = finalBbox.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= finalBbox.min.y;
    return model;
  }

  // Palm: scale to ~4.5m tall, grounded.
  _normalizePalmModel(model) {
    this._prepareModelMaterials(model);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const scale = 4.5 / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const finalBbox = new THREE.Box3().setFromObject(model);
    const center = finalBbox.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= finalBbox.min.y;
    return model;
  }

  // Pick a random model index that isn't the same as the previously-picked one.
  // Kept for callers that still use the single-anchor API.
  _pickNextIndex(libraryLength, lastIdxRefName) {
    if (libraryLength <= 0) return -1;
    if (libraryLength === 1) return 0;
    let idx = Math.floor(Math.random() * libraryLength);
    if (idx === this[lastIdxRefName]) {
      idx = (idx + 1) % libraryLength;
    }
    this[lastIdxRefName] = idx;
    return idx;
  }

  // True shuffle-bag picker: walks through a random permutation of all model
  // indices and only reshuffles when the bag is empty. Guarantees every model
  // in the library is seen once per cycle (no "same 2 cars" feeling) even
  // with small libraries. The `recentArr` state now doubles as the bag: the
  // array stores the *remaining* shuffled indices, popped one at a time.
  _pickRandomIndexRecent(libraryLength, bag) {
    if (libraryLength <= 0) return -1;
    if (libraryLength === 1) return 0;
    // Rebuild the bag when empty OR when the library has grown (new upload).
    if (!bag._size || bag._size !== libraryLength || bag.length === 0) {
      bag.length = 0;
      for (let i = 0; i < libraryLength; i++) bag.push(i);
      // Fisher–Yates shuffle
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // Avoid immediate repeat across cycles: we pop from the end, so if the
      // last slot matches the previous pick, swap it with the first slot.
      const tail = bag.length - 1;
      if (bag._last !== undefined && bag[tail] === bag._last && bag.length > 1) {
        [bag[tail], bag[0]] = [bag[0], bag[tail]];
      }
      bag._size = libraryLength;
    }
    const idx = bag.pop();
    bag._last = idx;
    return idx;
  }
}
