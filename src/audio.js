// ============================================================
//  AUDIO  -  drop your own .mp3 files into /assets/audio/ and list them here.
//  Each event can have several files (one is picked at random).
//  If a file is missing, a built-in synthesized sound / speech is used instead.
// ============================================================
export const AUDIO_BASE = 'assets/audio/';
export const AUDIO_MAP = {
  click: ['click.mp3'],
  toss: ['coin_toss.mp3'],
  bowl: ['bowl_runup.mp3'],
  bat: ['bat_hit.mp3'],
  four: ['four.mp3'],
  six: ['six.mp3'],
  wicket: ['wicket.mp3'],
  appeal: ['appeal.mp3'],
  review: ['review.mp3'],
  out: ['out.mp3'],
  notout: ['not_out.mp3'],
  simp: ['simp_gulley_ouch.mp3'],
  cheer: ['cheer.mp3'],
  groan: ['groan.mp3'],
  win: ['win.mp3'],
  lose: ['lose.mp3'],
  fifty: ['fifty.mp3'],
  hundred: ['hundred.mp3'],
  overdone: ['over_complete.mp3'],
  tip: ['captain_tip.mp3'],
  crowd: ['crowd_loop.mp3'],
  // voice lines (commentator / captain) - add as many variants as you like
  v_four: ['voice_four_1.mp3', 'voice_four_2.mp3'],
  v_six: ['voice_six_1.mp3', 'voice_six_2.mp3'],
  v_wicket: ['voice_wicket_1.mp3', 'voice_wicket_2.mp3'],
  v_win: ['voice_win.mp3'],
  v_lose: ['voice_lose.mp3'],
  v_defend: ['voice_defend.mp3'],
};

// voice events: English = voice_<event>_1/2.mp3 , Hindi = hi_voice_<event>_1/2.mp3
export const VOICE_KEYS = ['four', 'six', 'wicket', 'lbw', 'review', 'out', 'notout', 'simp', 'dot', 'defend', 'beaten', 'single', 'two', 'three', 'fifty', 'hundred', 'win', 'lose'];
for (const k of VOICE_KEYS) { AUDIO_MAP['v_' + k] = [1, 2].map(i => `voice_${k}_${i}.mp3`); AUDIO_MAP['hi_v_' + k] = [1, 2].map(i => `hi_voice_${k}_${i}.mp3`); }
AUDIO_MAP.bgm = ['bgm.mp3'];   // background music loop (optional)

export class AudioManager {
  constructor() {
    this.vol = 0.8; this.sfx = true; this.lang = 'off'; this.music = true; this.bgmEl = null; this.ctx = null;
    this.ok = new Set(); this.bad = new Set(); this.crowdEl = null; this.crowdNodes = null;
    for (const files of Object.values(AUDIO_MAP)) for (const f of files) this._probe(f);
  }
  _probe(f) {
    try {
      const a = new Audio(); a.preload = 'auto';
      a.addEventListener('canplaythrough', () => this.ok.add(f), { once: true });
      a.addEventListener('error', () => this.bad.add(f), { once: true });
      a.src = AUDIO_BASE + f;
    } catch (e) { this.bad.add(f); }
  }
  unlock() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* no audio */ }
  }
  play(ev, vol = 1) {
    if (!this.sfx) return;
    const files = (AUDIO_MAP[ev] || []).filter(f => this.ok.has(f));
    if (files.length) {
      const a = new Audio(AUDIO_BASE + files[Math.floor(Math.random() * files.length)]);
      a.volume = Math.min(1, this.vol * vol); a.play().catch(() => {});
      return;
    }
    this.synth(ev, vol);
  }
  speak(text) {
    if (this.lang === 'off' || !this.sfx || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text), hi = this.lang === 'hi'; u.lang = hi ? 'hi-IN' : 'en-IN'; u.rate = 1.05; u.volume = this.vol;
      const vs = speechSynthesis.getVoices(), norm = x => x.lang.replace('_', '-').toLowerCase();
      const v = vs.find(x => norm(x).startsWith(hi ? 'hi' : 'en-in')) || vs.find(x => norm(x).startsWith(hi ? 'hi' : 'en'));
      if (v) u.voice = v; speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  // play commentary mp3 for the selected language, or speak the text if no mp3 was added
  voiceEvent(key, text) {
    if (this.lang === 'off' || !this.sfx) return;
    const ev = (this.lang === 'hi' ? 'hi_v_' : 'v_') + key;
    if ((AUDIO_MAP[ev] || []).some(f => this.ok.has(f))) this.play(ev); else if (text) this.speak(text);
  }
  startMusic() {
    if (this.bgmEl || !this.music) return; const f = (AUDIO_MAP.bgm || []).find(x => this.ok.has(x)); if (!f) return;
    this.bgmEl = new Audio(AUDIO_BASE + f); this.bgmEl.loop = true; this.bgmEl.volume = this.vol * 0.35; this.bgmEl.play().catch(() => {});
  }
  setMusic(on) { this.music = on; if (on) this.startMusic(); else if (this.bgmEl) { this.bgmEl.pause(); this.bgmEl = null; } }
  setVolume(v) { this.vol = v; if (this.bgmEl) this.bgmEl.volume = v * 0.35; if (this.crowdEl) this.crowdEl.volume = v * 0.5; if (this.crowdNodes) this.crowdNodes.master.gain.value = v; }
  startCrowd() {
    if (this.crowdEl || this.crowdNodes) return;
    const f = (AUDIO_MAP.crowd || []).find(x => this.ok.has(x));
    if (f) { this.crowdEl = new Audio(AUDIO_BASE + f); this.crowdEl.loop = true; this.crowdEl.volume = this.vol * 0.5; this.crowdEl.play().catch(() => {}); return; }
    if (!this.ctx) return;
    const c = this.ctx, len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = c.createGain(); g.gain.value = 0.05; const master = c.createGain(); master.gain.value = this.vol;
    src.connect(lp); lp.connect(g); g.connect(master); master.connect(c.destination); src.start();
    this.crowdNodes = { g, lp, master };
  }
  cheerLevel(l) { // 0..1
    if (this.crowdNodes) { const t = this.ctx.currentTime; this.crowdNodes.g.gain.linearRampToValueAtTime(0.04 + l * 0.16, t + 0.2); this.crowdNodes.lp.frequency.linearRampToValueAtTime(450 + l * 1400, t + 0.2); }
    if (this.crowdEl) this.crowdEl.volume = Math.min(1, this.vol * (0.35 + l * 0.65));
  }
  // ---- synthesized fallbacks ----
  _tone(f, d, type = 'sine', v = 0.2, slide = 0, delay = 0) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v * this.vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  _noise(d, v = 0.2, freq = 1500, delay = 0) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + delay, n = Math.floor(c.sampleRate * d);
    const b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = c.createGain(); g.gain.value = v * this.vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  }
  synth(ev, vol = 1) {
    if (!this.ctx) return;
    switch (ev) {
      case 'click': this._tone(700, 0.05, 'square', 0.06); break;
      case 'bat': this._noise(0.08, 0.5 * vol, 2500); this._tone(180, 0.1, 'triangle', 0.3); break;
      case 'bowl': this._noise(0.5, 0.05, 700); break;
      case 'four': this._tone(520, 0.15, 'triangle', 0.2); this._tone(780, 0.25, 'triangle', 0.2, 0, 0.12); this._noise(1.2, 0.25, 1800, 0.1); break;
      case 'six': [520, 660, 780, 1040].forEach((f, i) => this._tone(f, 0.22, 'triangle', 0.22, 0, i * 0.1)); this._noise(1.8, 0.35, 2200, 0.2); break;
      case 'wicket': this._tone(220, 0.5, 'sawtooth', 0.25, -150); this._noise(0.3, 0.4, 900); break;
      case 'appeal': this._noise(0.8, 0.3, 1400); this._tone(600, 0.5, 'square', 0.08, 200); break;
      case 'review': this._tone(900, 0.12, 'sine', 0.2); this._tone(900, 0.12, 'sine', 0.2, 0, 0.25); this._tone(1200, 0.3, 'sine', 0.2, 0, 0.5); break;
      case 'out': this._tone(160, 0.7, 'sawtooth', 0.3, -80); break;
      case 'notout': this._tone(660, 0.18, 'triangle', 0.25); this._tone(880, 0.3, 'triangle', 0.25, 0, 0.15); break;
      case 'simp': this._tone(900, 0.6, 'sine', 0.25, -700); this._tone(120, 0.4, 'square', 0.2, 0, 0.5); break;
      case 'cheer': this._noise(1.4, 0.3, 1800); break;
      case 'groan': this._tone(300, 0.9, 'sawtooth', 0.12, -150); break;
      case 'win': [523, 659, 784, 1046, 1318].forEach((f, i) => this._tone(f, 0.35, 'triangle', 0.25, 0, i * 0.15)); this._noise(3, 0.3, 2000); break;
      case 'lose': [440, 392, 330, 262].forEach((f, i) => this._tone(f, 0.45, 'sawtooth', 0.15, 0, i * 0.25)); break;
      case 'fifty': case 'hundred': this._tone(880, 0.2, 'triangle', 0.25); this._tone(1320, 0.4, 'triangle', 0.25, 0, 0.2); this._noise(1.5, 0.3, 1900); break;
      case 'overdone': this._tone(500, 0.15, 'sine', 0.15); break;
      case 'tip': this._tone(1000, 0.08, 'sine', 0.12); this._tone(1400, 0.1, 'sine', 0.12, 0, 0.1); break;
      case 'toss': for (let i = 0; i < 6; i++) this._tone(1800 - i * 120, 0.06, 'triangle', 0.12, 0, i * 0.18); break;
      default: break;
    }
  }
}
