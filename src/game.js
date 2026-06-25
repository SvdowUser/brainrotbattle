import * as THREE from 'three';
import { Character } from './character.js';
import { TrackManager } from './track.js';
import { InputController } from './input.js';
import { audio } from './audio.js';

export class Game {
  constructor() {
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.character = null;
    this.track = null;
    this.input = null;
    this.clock = new THREE.Clock();

    this.state = 'menu'; // menu, playing, gameover
    this.score = 0;
    this.coins = 0;
    this.speed = 12;
    this.baseSpeed = 12;
    this.maxSpeed = 30;

    this.onScoreUpdate = null;
    this.onCoinsUpdate = null;
    this.onGameOver = null;
    this.onBoosterUpdate = null; // (kind, remainingSeconds, totalDuration) or (null)
    this.onEventStart = null;    // (kind)

    // Booster state
    this.coinMultiplier = 1;
    this.coinMultiplierTimer = 0;
    this.ghostTimer = 0;
    this.COIN2X_DURATION = 8;
    this.GHOST_DURATION = 6;

    // Event state
    this.activeEvent = null;         // { kind, timeLeft, duration }
    this.eventCooldown = 0;          // seconds until next event
    this.EVENT_DURATIONS = {
      coinRush: 10,
      dangerZone: 8,
      speedBurst: 6,
    };
    // Default fog/bg — captured at init, restored at event end
    this._baseFogColor = 0xfdba74; // city biome: warm morning haze
    this._baseBgColor = 0xfbbf77;
    this._fogTargetColor = 0xfdba74;
    this._fogCurrent = { r: 0.992, g: 0.729, b: 0.455 };

    // Performance
    this.lastFrame = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
  }

  async init() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvas = this.renderer.domElement;
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.touchAction = 'none';
    document.getElementById('app').appendChild(this.canvas);

    // Create scene — warm morning-city atmosphere (Subway Surfers vibe)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfbbf77);
    this.scene.fog = new THREE.Fog(0xfdba74, 32, 95);

    // Camera (follows character from behind)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );
    this.camera.position.set(0, 6, -9);
    this.camera.lookAt(0, 1.5, 10);

    // Lighting — bright cartoon-daylight (Subway-Surfers style)
    const ambient = new THREE.AmbientLight(0xffe3c0, 0.85);
    this.scene.add(ambient);

    // Main sun light — warm golden, nice and bright
    const sun = new THREE.DirectionalLight(0xfff0c8, 1.65);
    sun.position.set(10, 20, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    // Sky-fill (cool blue) — keeps shadows lively instead of muddy
    const rim = new THREE.DirectionalLight(0x9ccfff, 0.55);
    rim.position.set(-5, 7, -3);
    this.scene.add(rim);

    // Character
    this.character = new Character(this.scene);
    await this.character.load();

    // Track
    this.track = new TrackManager(this.scene);
    this.track.init();

    // ─── Auto-scan model libraries ──────────────────────────────────────
    // Two discovery paths are combined so we never miss a user-dropped file:
    //
    //  1) Build-time glob of src/assets/models/<category>/ — Vite resolves
    //     these eagerly and HMR picks up new files in dev mode.
    //
    //  2) Runtime HEAD-probe of /models/<category>/<prefix><N>.glb from the
    //     public/ folder. Users drop files into public/models/<category>/ and
    //     the game auto-includes them up to a max index per category without
    //     needing a Vite rebuild. Missing files 404 and are silently skipped.
    //
    // Existing files are never removed by new drops — the libraries are
    // additive and de-duped by URL inside track.js.
    const toUrls = (modules) =>
      Object.values(modules).map((m) => (typeof m === 'string' ? m : m.default));
    const carMods = import.meta.glob('./assets/models/cars/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    const busMods = import.meta.glob('./assets/models/buses/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    // Houses ("Häuser") — side-of-road decorations. Both names ("houses" and
    // "buildings") go into the same buildingLibrary so older drops keep working.
    const houseMods = import.meta.glob('./assets/models/houses/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    const buildingMods = import.meta.glob('./assets/models/buildings/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    // Lanterns ("Laternen") — both "lanterns" and legacy "lamps" folders feed
    // the same library.
    const lanternMods = import.meta.glob('./assets/models/lanterns/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    const lampMods = import.meta.glob('./assets/models/lamps/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    const pedMods = import.meta.glob('./assets/models/pedestrians/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    // Palms ("Palmen") — coastal biome decoration. User can drop up to ~10
    // variants; spawn picks randomly per tree.
    const palmMods = import.meta.glob('./assets/models/palms/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    // Billboards ("Werbeschilder") — highway ad boards as uploadable 3D models.
    const billboardMods = import.meta.glob('./assets/models/billboards/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });
    // Roads ("Strasse") — poly.pizza "Street Straight" or similar road segments.
    const roadMods = import.meta.glob('./assets/models/roads/*.{glb,gltf}', { eager: true, query: '?url', import: 'default' });

    // Build a list of expected runtime filenames per category (in public/models).
    const publicNames = (folder, prefix, max) => {
      const out = [`/models/${folder}/${prefix}.glb`]; // un-numbered
      for (let i = 1; i <= max; i++) {
        out.push(`/models/${folder}/${prefix}${i}.glb`);
        // case variant (Bus1.glb etc.) — Windows filesystems are case-insensitive
        // but Vite's dev server is case-sensitive; try the capitalized form too.
        const capPrefix = prefix[0].toUpperCase() + prefix.slice(1);
        out.push(`/models/${folder}/${capPrefix}${i}.glb`);
      }
      return out;
    };

    const carUrls = [...toUrls(carMods), ...publicNames('cars', 'car', 50)];
    const busUrls = [...toUrls(busMods), ...publicNames('buses', 'bus', 50)];
    const buildingUrls = [
      ...toUrls(buildingMods),
      ...toUrls(houseMods),
      ...publicNames('houses', 'house', 50),
      ...publicNames('buildings', 'building', 50),
    ];
    const lampUrls = [
      ...toUrls(lampMods),
      ...toUrls(lanternMods),
      ...publicNames('lanterns', 'lantern', 20),
      ...publicNames('lamps', 'lamp', 20),
    ];
    const pedUrls = [...toUrls(pedMods), ...publicNames('pedestrians', 'pedestrian', 50)];
    const palmUrls = [...toUrls(palmMods), ...publicNames('palms', 'palm', 20)];
    const billboardUrls = [...toUrls(billboardMods), ...publicNames('billboards', 'billboard', 20)];
    const roadUrls = [...toUrls(roadMods), ...publicNames('roads', 'road', 10)];

    this.track.loadBuiltinCarLibrary(carUrls);
    this.track.loadBuiltinBusLibrary(busUrls);
    this.track.loadBuiltinBuildingLibrary(buildingUrls);
    this.track.loadBuiltinLampLibrary(lampUrls);
    this.track.loadBuiltinPedestrianLibrary(pedUrls);
    this.track.loadBuiltinPalmLibrary(palmUrls);
    this.track.loadBuiltinBillboardLibrary(billboardUrls);
    this.track.loadBuiltinRoadLibrary(roadUrls);
    // Update fog/bg base colors when biome transitions, so events lerp back to current biome
    this.track.onBiomeChange = (biome) => {
      this._baseFogColor = biome.fogColor;
      // background uses horizon hex as a Color
      const bgCol = new THREE.Color(biome.skyHorizon);
      this._baseBgColor = bgCol.getHex();
      // If no event in flight, snap to new base
      if (!this.activeEvent) this._fogTargetColor = this._baseFogColor;
    };

    // Input — hook audio into each gesture
    this.input = new InputController(this.canvas);
    this.input.onSwipeLeft = () => { this.character.moveLeft(); audio.swipe(); };
    this.input.onSwipeRight = () => { this.character.moveRight(); audio.swipe(); };
    this.input.onSwipeUp = () => { this.character.jump(); audio.jump(); };
    this.input.onSwipeDown = () => { this.character.slide(); audio.slide(); };

    // Resize handler
    window.addEventListener('resize', () => this.onResize());

    // Start render loop
    this.animate();
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.coins = 0;
    this.speed = this.baseSpeed;
    this.lastMilestone = 0;
    this.coinMultiplier = 1;
    this.coinMultiplierTimer = 0;
    this.ghostTimer = 0;
    this.activeEvent = null;
    this.eventCooldown = 22 + Math.random() * 10; // first event after ~22-32s
    this.track.coinRushActive = false;
    this.track.dangerZoneActive = false;
    this._fogTargetColor = this._baseFogColor;
    if (this.scene && this.scene.fog) {
      this.scene.fog.color.setHex(this._baseFogColor);
      this.scene.background.setHex(this._baseBgColor);
    }
    this.character.reset();
    this.track.reset();
    this._setCharacterGhost(false);
    if (this.onScoreUpdate) this.onScoreUpdate(0);
    if (this.onCoinsUpdate) this.onCoinsUpdate(0);
    if (this.onBoosterUpdate) this.onBoosterUpdate(null);
    // Audio
    audio.resume();
    audio.start();
    setTimeout(() => audio.startMusic('game'), 400);
  }

  _setCharacterGhost(on) {
    if (!this.character || !this.character.group) return;
    this.character.group.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (on) {
            if (m._origOpacity === undefined) {
              m._origOpacity = m.opacity;
              m._origTransparent = m.transparent;
            }
            m.transparent = true;
            m.opacity = 0.45;
          } else if (m._origOpacity !== undefined) {
            m.opacity = m._origOpacity;
            m.transparent = m._origTransparent;
            delete m._origOpacity;
            delete m._origTransparent;
          }
        });
      }
    });
  }

  _activateBooster(kind) {
    if (kind === 'coin2x') {
      this.coinMultiplier = 2;
      this.coinMultiplierTimer = this.COIN2X_DURATION;
    } else if (kind === 'ghost') {
      this.ghostTimer = this.GHOST_DURATION;
      this._setCharacterGhost(true);
    }
    audio.powerupPickup(kind);
    this._emitBoosterState();
  }

  _emitBoosterState() {
    if (!this.onBoosterUpdate) return;
    // Show the more urgent/active booster; prefer whichever has more time left
    if (this.ghostTimer > 0 && this.ghostTimer >= this.coinMultiplierTimer) {
      this.onBoosterUpdate('ghost', this.ghostTimer, this.GHOST_DURATION);
    } else if (this.coinMultiplierTimer > 0) {
      this.onBoosterUpdate('coin2x', this.coinMultiplierTimer, this.COIN2X_DURATION);
    } else {
      this.onBoosterUpdate(null);
    }
  }

  _startRandomEvent() {
    const kinds = ['coinRush', 'dangerZone', 'speedBurst'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    this._startEvent(kind);
  }

  _startEvent(kind) {
    const dur = this.EVENT_DURATIONS[kind] || 8;
    this.activeEvent = { kind, timeLeft: dur, duration: dur };
    audio.eventAnnounce(kind);
    if (this.onEventStart) this.onEventStart(kind);

    if (kind === 'coinRush') {
      this.track.coinRushActive = true;
      this._fogTargetColor = 0x5a3a0a; // warm gold
    } else if (kind === 'dangerZone') {
      this.track.dangerZoneActive = true;
      this._fogTargetColor = 0x4a0d0d; // danger red
    } else if (kind === 'speedBurst') {
      this._fogTargetColor = 0x0a3a5a; // electric blue
    }
  }

  _endEvent(kind) {
    if (kind === 'coinRush') this.track.coinRushActive = false;
    else if (kind === 'dangerZone') this.track.dangerZoneActive = false;
    this._fogTargetColor = this._baseFogColor;
    audio.eventEnd();
  }

  _tickFog(dt) {
    if (!this.scene || !this.scene.fog) return;
    // Smoothly lerp fog and bg toward target
    const target = new THREE.Color(this._fogTargetColor);
    const speed = Math.min(1, dt * 1.5);
    this._fogCurrent.r += (target.r - this._fogCurrent.r) * speed;
    this._fogCurrent.g += (target.g - this._fogCurrent.g) * speed;
    this._fogCurrent.b += (target.b - this._fogCurrent.b) * speed;
    this.scene.fog.color.setRGB(this._fogCurrent.r, this._fogCurrent.g, this._fogCurrent.b);
    this.scene.background.setRGB(
      this._fogCurrent.r * 0.7,
      this._fogCurrent.g * 0.7,
      this._fogCurrent.b * 0.7,
    );
  }

  stop() {
    this.state = 'gameover';
    audio.stopMusic();
    audio.gameover();
    if (this.onGameOver) this.onGameOver(this.score, this.coins);
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = now - this.lastFrame;
    if (delta < this.frameInterval) return;
    this.lastFrame = now - (delta % this.frameInterval);

    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state === 'playing') {
      this.update(dt);
    } else {
      // Menu/gameover — still animate character idly for visual appeal
      this.character.updateIdle(dt);
    }

    this.renderer.render(this.scene, this.camera);
  };

  update(dt) {
    // Progressive speed increase
    this.speed = Math.min(
      this.maxSpeed,
      this.baseSpeed + (this.score / 100)
    );

    // Event system: tick active, else count down cooldown
    if (this.activeEvent) {
      this.activeEvent.timeLeft -= dt;
      if (this.activeEvent.timeLeft <= 0) {
        this._endEvent(this.activeEvent.kind);
        this.activeEvent = null;
        this.eventCooldown = 18 + Math.random() * 14;
      }
    } else if (this.score > 120) {
      this.eventCooldown -= dt;
      if (this.eventCooldown <= 0) this._startRandomEvent();
    }
    if (this.activeEvent && this.activeEvent.kind === 'speedBurst') {
      this.speed *= 1.5;
    }
    this._tickFog(dt);

    // Tick booster timers
    if (this.coinMultiplierTimer > 0) {
      this.coinMultiplierTimer -= dt;
      if (this.coinMultiplierTimer <= 0) {
        this.coinMultiplierTimer = 0;
        this.coinMultiplier = 1;
        audio.powerupEnd();
      }
    }
    if (this.ghostTimer > 0) {
      this.ghostTimer -= dt;
      if (this.ghostTimer <= 0) {
        this.ghostTimer = 0;
        this._setCharacterGhost(false);
        audio.powerupEnd();
      } else if (this.ghostTimer < 1.0) {
        const blink = Math.sin(this.ghostTimer * 30) > 0;
        this._setCharacterGhost(blink);
      }
    }
    this._emitBoosterState();

    // Update character
    this.character.update(dt);

    // Update track (obstacles + coins + powerups)
    const result = this.track.update(dt, this.speed, this.character);

    // Collisions
    if (result.hitObstacle) {
      if (this.ghostTimer > 0) {
        audio.swipe();
      } else {
        this.character.die();
        audio.crash();
        setTimeout(() => this.stop(), 800);
        return;
      }
    }

    if (result.powerupPicked) {
      this._activateBooster(result.powerupPicked);
    }

    if (result.coinsCollected > 0) {
      const multiplied = result.coinsCollected * this.coinMultiplier;
      this.coins += multiplied;
      for (let i = 0; i < result.coinsCollected; i++) {
        setTimeout(() => {
          audio.coin();
          if (this.coinMultiplier > 1) audio.coin2xAccent();
        }, i * 40);
      }
      if (this.onCoinsUpdate) this.onCoinsUpdate(this.coins);
    }

    // Score = distance
    this.score += this.speed * dt;
    if (this.onScoreUpdate) this.onScoreUpdate(this.score);

    // Milestone ping every 500 distance
    const milestone = Math.floor(this.score / 500);
    if (milestone > (this.lastMilestone || 0)) {
      this.lastMilestone = milestone;
      audio.milestone();
    }

    // Camera follows character's lane smoothly
    const targetX = this.character.group.position.x * 0.5;
    this.camera.position.x += (targetX - this.camera.position.x) * Math.min(1, dt * 6);
  }
}
