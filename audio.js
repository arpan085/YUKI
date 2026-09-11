export class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.settings = { master: 0.8, sfx: 0.8, music: 0.5 };
  }

  init() {
    if (this.context) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.context = new Ctx();
    this.masterGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.applySettings(this.settings);
  }

  ensure() {
    if (!this.context) this.init();
    if (this.context && this.context.state === 'suspended') this.context.resume();
  }

  applySettings(settings) {
    this.settings = settings;
    if (!this.masterGain) return;
    this.masterGain.gain.value = settings.master;
    this.sfxGain.gain.value = settings.sfx;
    this.musicGain.gain.value = settings.music;
  }

  tone(freq, duration = 0.1, type = 'square', volume = 0.08, slide = 0) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    if (slide !== 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), this.context.currentTime + duration);
    }
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.context.currentTime + duration + 0.02);
  }

  playSfx(name) {
    this.ensure();
    const map = {
      jab: () => this.tone(185, 0.08, 'square', 0.09, 24),
      cross: () => this.tone(155, 0.1, 'square', 0.09, 18),
      hook: () => this.tone(120, 0.12, 'triangle', 0.1, 12),
      uppercut: () => this.tone(92, 0.16, 'sawtooth', 0.12, 34),
      hit: () => this.tone(96, 0.12, 'triangle', 0.07, -8),
      body: () => this.tone(112, 0.13, 'triangle', 0.06, 0),
      block: () => this.tone(330, 0.06, 'square', 0.04, -18),
      dodge: () => this.tone(520, 0.08, 'triangle', 0.05, 40),
      bell: () => {
        this.tone(740, 0.1, 'triangle', 0.08, 90);
        setTimeout(() => this.tone(740, 0.1, 'triangle', 0.08, 90), 80);
      },
      knockdown: () => this.tone(58, 0.22, 'sawtooth', 0.12, -14),
      ko: () => this.tone(42, 0.55, 'sawtooth', 0.15, -18),
      menu: () => this.tone(620, 0.08, 'square', 0.05, 20),
      win: () => this.tone(520, 0.6, 'triangle', 0.1, 24),
      loss: () => this.tone(170, 0.8, 'sawtooth', 0.1, -6),
      guardBreak: () => this.tone(72, 0.18, 'sawtooth', 0.11, -12),
      countdown: () => this.tone(560, 0.06, 'triangle', 0.05, 30)
    };
    const fn = map[name];
    if (fn) fn();
  }
}
