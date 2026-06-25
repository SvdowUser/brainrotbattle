// BrainRotBattle — Procedural Audio Engine
// Web Audio API — 100% synthesized, zero assets, royalty-free
// Style: Chiptune / Arcade with Brainrot-Meme Vibes

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.muted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.nextNoteTime = 0;
    this.step = 0;

    this.currentTrack = 'game';

    // GAME TRACK — BPM 128, arcade drive tempo, Am-F-C-G
    this.tracks = {
      game: {
        bpm: 128,
        bassPattern: [
          110, 110, 82, 110,
          87, 87, 131, 87,
          131, 131, 98, 131,
          98, 98, 147, 98,
        ],
        leadPattern: [
          [440, 523, 659, 523], [440, 523, 659, 784],
          [349, 440, 523, 440], [349, 440, 523, 698],
          [523, 659, 784, 659], [523, 659, 784, 988],
          [392, 494, 587, 494], [392, 494, 587, 784],
        ],
        drumPattern: [
          'K', 'H', 'H', 'H',
          'S', 'H', 'H', 'H',
          'K', 'H', 'K', 'H',
          'S', 'H', 'H', 'S',
        ],
        musicGain: 0.35,
      },
      // MENU TRACK — chill 92 BPM, dreamy progression Am-Em-F-G
      menu: {
        bpm: 92,
        bassPattern: [
          55, 0, 55, 0,
          82, 0, 82, 0,
          87, 0, 87, 0,
          98, 0, 98, 0,
        ],
        leadPattern: [
          [880, 659, 523, 440], [880, 659, 523, 659],
          [987, 784, 659, 494], [987, 784, 659, 784],
          [1047, 784, 698, 523], [1047, 784, 698, 880],
          [1175, 880, 740, 587], [1175, 880, 740, 987],
        ],
        drumPattern: [
          'K', '.', '.', '.',
          '.', '.', 'H', '.',
          'K', '.', '.', '.',
          '.', '.', 'H', '.',
        ],
        musicGain: 0.22,
      },
    };
    this.stepDur = 60 / 128 / 4; // will be recomputed per track
  }

  async init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.8;
    this.sfxGain.connect(this.master);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.35;
    this.musicGain.connect(this.master);

    // Load saved mute preference
    const savedMute = localStorage.getItem('brb_muted') === '1';
    this.setMuted(savedMute);
  }

  async resume() {
    if (!this.ctx) await this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    localStorage.setItem('brb_muted', muted ? '1' : '0');
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // ═══════════════════════════════════════════════════════════════
  // SOUND EFFECTS
  // ═══════════════════════════════════════════════════════════════

  _beep({ freq = 440, freqEnd = null, type = 'square', dur = 0.15, vol = 0.3, attack = 0.005, release = 0.08 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
    }
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.linearRampToValueAtTime(vol * 0.6, t + dur - release);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _noise({ dur = 0.1, vol = 0.3, filter = 'lowpass', cutoff = 2000, cutoffEnd = null, q = 1 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filt = this.ctx.createBiquadFilter();
    filt.type = filter;
    filt.frequency.setValueAtTime(cutoff, t);
    if (cutoffEnd !== null) {
      filt.frequency.exponentialRampToValueAtTime(Math.max(50, cutoffEnd), t + dur);
    }
    filt.Q.value = q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  // Coin: consistent Mario-style ding every time
  coin() {
    if (!this.ctx) return;
    this._beep({ freq: 988, type: 'square', dur: 0.08, vol: 0.25 });
    setTimeout(() => this._beep({ freq: 1319, type: 'square', dur: 0.18, vol: 0.3 }), 60);
  }

  // Coin 2x bonus accent — extra cha-ching layered on top
  coin2xAccent() {
    if (!this.ctx) return;
    this._beep({ freq: 1760, type: 'triangle', dur: 0.12, vol: 0.15 });
    setTimeout(() => this._beep({ freq: 2093, type: 'triangle', dur: 0.18, vol: 0.12 }), 40);
  }

  // Swipe: 3 variants
  swipe() {
    if (!this.ctx) return;
    const v = Math.random();
    if (v < 0.34) {
      this._noise({ dur: 0.12, vol: 0.12, filter: 'bandpass', cutoff: 800, cutoffEnd: 2400, q: 3 });
    } else if (v < 0.67) {
      this._noise({ dur: 0.1, vol: 0.11, filter: 'bandpass', cutoff: 600, cutoffEnd: 1800, q: 4 });
    } else {
      this._noise({ dur: 0.14, vol: 0.13, filter: 'highpass', cutoff: 1000, cutoffEnd: 3000, q: 2 });
    }
  }

  // Jump: 3 variants
  jump() {
    if (!this.ctx) return;
    const variants = [
      { freq: 330, freqEnd: 880, type: 'square' },
      { freq: 280, freqEnd: 740, type: 'triangle' },
      { freq: 392, freqEnd: 988, type: 'square' },
    ];
    const p = variants[Math.floor(Math.random() * variants.length)];
    this._beep({ ...p, dur: 0.18, vol: 0.25 });
  }

  // Slide: 2 variants
  slide() {
    if (!this.ctx) return;
    if (Math.random() < 0.5) {
      this._noise({ dur: 0.25, vol: 0.18, filter: 'lowpass', cutoff: 1200, cutoffEnd: 400, q: 2 });
      this._beep({ freq: 180, freqEnd: 80, type: 'sawtooth', dur: 0.22, vol: 0.15 });
    } else {
      this._noise({ dur: 0.28, vol: 0.16, filter: 'lowpass', cutoff: 1500, cutoffEnd: 300, q: 3 });
      this._beep({ freq: 220, freqEnd: 70, type: 'sawtooth', dur: 0.25, vol: 0.14 });
    }
  }

  // Crash: noise burst + descending pitch thud
  crash() {
    if (!this.ctx) return;
    this._noise({ dur: 0.4, vol: 0.35, filter: 'lowpass', cutoff: 4000, cutoffEnd: 200, q: 1 });
    this._beep({ freq: 220, freqEnd: 40, type: 'sawtooth', dur: 0.5, vol: 0.4 });
    // "Oof"-like secondary tone
    setTimeout(() => this._beep({ freq: 150, freqEnd: 60, type: 'triangle', dur: 0.3, vol: 0.25 }), 80);
  }

  // Game Over: sad descending melody (Italo-meme-style)
  gameover() {
    if (!this.ctx) return;
    const notes = [523, 466, 415, 349, 311]; // C5 → Eb4 cascade
    notes.forEach((f, i) => {
      setTimeout(() => this._beep({
        freq: f, type: 'triangle', dur: 0.2, vol: 0.25
      }), i * 120);
    });
    // Low bass drop
    setTimeout(() => this._beep({
      freq: 110, freqEnd: 55, type: 'sawtooth', dur: 0.6, vol: 0.3
    }), 600);
  }

  // Start: upbeat fanfare
  start() {
    if (!this.ctx) return;
    const notes = [523, 659, 784, 1047]; // C-E-G-C
    notes.forEach((f, i) => {
      setTimeout(() => this._beep({
        freq: f, type: 'square', dur: 0.1, vol: 0.22
      }), i * 70);
    });
  }

  // Milestone ping (e.g. every 500m)
  milestone() {
    if (!this.ctx) return;
    this._beep({ freq: 784, type: 'square', dur: 0.08, vol: 0.2 });
    setTimeout(() => this._beep({ freq: 988, type: 'square', dur: 0.08, vol: 0.2 }), 60);
    setTimeout(() => this._beep({ freq: 1319, type: 'square', dur: 0.15, vol: 0.25 }), 120);
  }

  // Powerup pickup: ascending magical chime
  powerupPickup(kind = 'coin2x') {
    if (!this.ctx) return;
    const notes = kind === 'ghost'
      ? [523, 659, 784, 988, 1175]   // bright cyan-feel ascending
      : [659, 784, 988, 1319, 1568]; // golden feel
    notes.forEach((f, i) => {
      setTimeout(() => this._beep({
        freq: f, type: 'triangle', dur: 0.12, vol: 0.22
      }), i * 50);
    });
    // Sparkle layer
    setTimeout(() => this._beep({ freq: 2093, type: 'square', dur: 0.2, vol: 0.12 }), 100);
    setTimeout(() => this._beep({ freq: 2637, type: 'square', dur: 0.25, vol: 0.1 }), 160);
  }

  // Powerup fade-out — short descending tail
  powerupEnd() {
    if (!this.ctx) return;
    this._beep({ freq: 988, type: 'triangle', dur: 0.15, vol: 0.18 });
    setTimeout(() => this._beep({ freq: 784, type: 'triangle', dur: 0.2, vol: 0.15 }), 80);
  }

  // Event announcement jingles
  eventAnnounce(kind) {
    if (!this.ctx) return;
    if (kind === 'coinRush') {
      // Ascending gold rush: C5-E5-G5-C6-E6
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => {
        setTimeout(() => this._beep({ freq: f, type: 'square', dur: 0.12, vol: 0.25 }), i * 55);
      });
    } else if (kind === 'dangerZone') {
      // Alarm — two descending danger tones, repeated
      const alarm = () => {
        this._beep({ freq: 523, type: 'sawtooth', dur: 0.18, vol: 0.28 });
        setTimeout(() => this._beep({ freq: 392, type: 'sawtooth', dur: 0.18, vol: 0.28 }), 180);
      };
      alarm();
      setTimeout(alarm, 400);
    } else if (kind === 'speedBurst') {
      // Rising pitch bend + noise whoosh
      this._beep({ freq: 220, freqEnd: 1760, type: 'sawtooth', dur: 0.45, vol: 0.25 });
      this._noise({ dur: 0.4, vol: 0.2, filter: 'bandpass', cutoff: 800, cutoffEnd: 4000, q: 2 });
    }
  }

  // Event end — subtle descend
  eventEnd() {
    if (!this.ctx) return;
    this._beep({ freq: 880, type: 'triangle', dur: 0.15, vol: 0.15 });
    setTimeout(() => this._beep({ freq: 659, type: 'triangle', dur: 0.2, vol: 0.13 }), 80);
  }

  // ═══════════════════════════════════════════════════════════════
  // MUSIC LOOP — scheduled chiptune 16-step
  // ═══════════════════════════════════════════════════════════════

  startMusic(trackName = 'game') {
    if (!this.ctx) return;
    // Switching track? stop old first
    if (this.musicPlaying && this.currentTrack !== trackName) {
      this.stopMusic();
    }
    if (this.musicPlaying) return;
    this.currentTrack = trackName;
    const track = this.tracks[trackName] || this.tracks.game;
    this.stepDur = 60 / track.bpm / 4;
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(track.musicGain, this.ctx.currentTime, 0.1);
    }
    this.musicPlaying = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this._scheduler();
  }

  startMenuMusic() { this.startMusic('menu'); }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _scheduler = () => {
    if (!this.musicPlaying) return;
    // Schedule notes 100ms ahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this._scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += this.stepDur;
      this.step = (this.step + 1) % 16;
    }
    this.musicTimer = setTimeout(this._scheduler, 25);
  };

  _scheduleStep(step, time) {
    const track = this.tracks[this.currentTrack] || this.tracks.game;
    const bar = Math.floor(step / 4);
    const isMenu = this.currentTrack === 'menu';

    // Bass
    const bassFreq = track.bassPattern[step];
    if (bassFreq > 0 && (isMenu || step % 2 === 0)) {
      this._musicNote({
        freq: bassFreq,
        type: 'sawtooth',
        dur: this.stepDur * (isMenu ? 3.5 : 1.8),
        vol: isMenu ? 0.14 : 0.22,
        startTime: time,
        filter: { cutoff: isMenu ? 400 : 600, q: 4 },
      });
    }
    // Lead
    const leadChord = track.leadPattern[bar % track.leadPattern.length];
    const leadFreq = leadChord[step % 4];
    this._musicNote({
      freq: leadFreq,
      type: isMenu ? 'triangle' : 'square',
      dur: this.stepDur * (isMenu ? 1.6 : 0.9),
      vol: isMenu ? 0.1 : 0.08,
      startTime: time,
      filter: { cutoff: isMenu ? 1800 : 3000, q: 1 },
    });
    // Drums
    const d = track.drumPattern[step];
    if (d === 'K') this._kick(time);
    else if (d === 'S') this._snare(time);
    else if (d === 'H') this._hat(time);
  }

  _musicNote({ freq, type, dur, vol, startTime, filter }) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.005);
    gain.gain.linearRampToValueAtTime(vol * 0.5, startTime + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    let last = gain;
    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filter.cutoff;
      f.Q.value = filter.q || 1;
      osc.connect(f);
      f.connect(gain);
    } else {
      osc.connect(gain);
    }
    last.connect(this.musicGain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.02);
  }

  _kick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.17);
  }

  _snare(time) {
    const bufSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 1500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicGain);
    src.start(time);
    src.stop(time + 0.14);
  }

  _hat(time) {
    const bufSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 6000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicGain);
    src.start(time);
    src.stop(time + 0.05);
  }
}

// Singleton instance
export const audio = new AudioEngine();
