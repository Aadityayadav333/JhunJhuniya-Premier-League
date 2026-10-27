/* JhunJhuniya Premier League - bundled build. Edit files in /src and run: python3 build.py */
(function(){
'use strict';
const THREE = window.THREE; const __M = {};

/* ---- data ---- */
__M.data = (function(){
// ============================================================
//  JhunJhuniya Premier League - game data & tunable config
// ============================================================
const CONFIG = {
  twoStarSuccess: 0.5,      // base chance a 4/6 attempt works vs a 2-star bowler
  unratedOutChance: 0.07,   // base dismissal chance vs unrated bowlers on a big shot
  crowdedZonePenalty: 0.28, // extra danger when hitting into a crowded zone
  reviewsPerTeam: 2,
  lbwUmpireAccuracy: 0.8,
  runTime: 1.35,            // seconds per run animation
  swingPerfect: 0.05, swingGood: 0.11, swingLate: 0.2, // timing windows (s)
};

const TEAMS = {
  A: { key: 'A', name: 'Legion Warriors', short: 'LGW', color: 0xd32f2f, css: '#e53935' },
  B: { key: 'B', name: 'Matrix Defenders', short: 'MXD', color: 0x1e5bd8, css: '#2f7bff' },
};

// look keys: skin, hair(short|long|curly|quiff|bald|pony|side|none), hairC, beard(0..1.6), beardC,
// stache, glasses(round|rect|shades), sp(special), h(height), bulk(build), belly
// bowl: {type: fast|spin|leg|off|carrom, stars: 0-3, hand: 'R'|'L'}
function buildTeams(userName) {
  const A = [
    { id: 'you', name: userName || 'New Player', max: Infinity, isUser: true, role: 'You',
      look: { skin: 0xc89b76, hair: 'short', hairC: 0x1a1a1a }, bowl: { type: 'fast', stars: 0, hand: 'R' } },
    { id: 'gold', name: 'Goldclad', role: 'Captain', max: 100,
      look: { skin: 0xc68a5a, hair: 'long', hairC: 0xd9a416, beard: 0.45, beardC: 0x6b4a14, h: 1.1 } },
    { id: 'brof', name: 'Brofessor', max: 50, look: { sp: 'batman', skin: 0xd9ad8a, bulk: 1.3, h: 1.05 } },
    { id: 'nachi', name: 'Nachi Bhai', max: 50, bowl: { type: 'fast', stars: 3, hand: 'R' },
      look: { skin: 0xd2a07a, hair: 'curly', hairC: 0x1b1210, beard: 0.7, beardC: 0x1b1210 } },
    { id: 'gaurav', name: 'Gaurav Bhati', max: 50, bowl: { type: 'fast', stars: 2, hand: 'R' },
      look: { skin: 0xbf8b62, hair: 'short', hairC: 0x111111, beard: 0.8, beardC: 0x151515, h: 1.17, bulk: 1.1 } },
    { id: 'hemant', name: 'Hemant', max: 35, bowl: { type: 'fast', stars: 2, hand: 'R' },
      look: { skin: 0xc99c78, hair: 'side', hairC: 0x2a1c12, stache: true } },
    { id: 'mick', name: 'Mick', max: 30, look: { skin: 0xe3b693, hair: 'long', hairC: 0x4a2f1b } },
    { id: 'kaushik', name: 'Kaushik Ji', max: 20, look: { skin: 0xc29a7a, hair: 'short', hairC: 0x222222 } },
    { id: 'mens', name: 'Mensation', max: 20, look: { skin: 0xe0b08c, hair: 'quiff', hairC: 0x0e0e0e, glasses: 'shades', beard: 0.2, beardC: 0x111111 } },
    { id: 'kaali', name: 'Desi Kaali Goli', max: 20, look: { sp: 'blank' } },
    { id: 'zulfi', name: 'Zulfiqar', max: 10, bowl: { type: 'fast', stars: 0, hand: 'L' },
      look: { sp: 'skullcap', skin: 0xc79a74, beard: 1.5, beardC: 0xf2f2f2, bulk: 0.95, h: 0.97 } },
  ];
  const B = [
    { id: 'nidhi', name: 'Nidhi Dalli', max: 10, look: { sp: 'girl', skin: 0xe8bb9a, hair: 'pony', hairC: 0x1a0f0a, h: 0.93 } },
    { id: 'bakri', name: 'Awkward Bakri', max: 25, bowl: { type: 'spin', stars: 0, hand: 'R' }, look: { sp: 'goat' } },
    { id: 'smith', name: 'Agent Smith', max: 50, bowl: { type: 'fast', stars: 2, hand: 'R' },
      look: { sp: 'agent', skin: 0xe6c3a4, hair: 'short', hairC: 0x111111, glasses: 'shades', h: 1.08 } },
    { id: 'baal', name: 'Baal', max: 100, bowl: { type: 'carrom', stars: 3, hand: 'R' }, look: { sp: 'devil', h: 1.12, bulk: 1.15 } },
    { id: 'illu', name: 'Illuminati', max: 60, look: { sp: 'cyclops', skin: 0xb9a98c, hair: 'bald' } },
    { id: 'candid', name: 'Candid Exchange', max: 40, look: { skin: 0xd1a07b, hair: 'short', hairC: 0x3a2a1d } },
    { id: 'daddu', name: 'Bango Daddu', max: 20, look: { sp: 'boomer', skin: 0xe2b99b, hair: 'bald', hairC: 0xdddddd, belly: 1, stache: true, h: 0.96 } },
    { id: 'gulley', name: 'Simp Gulley', max: 0, simp: true, look: { sp: 'nerd', skin: 0xf0cfb0, hair: 'side', hairC: 0x3b2a1a, glasses: 'round', h: 0.95, bulk: 0.85 } },
    { id: 'npc', name: 'NPC', max: 20, look: { sp: 'laugh', skin: 0xd8ae8a, hair: 'short', hairC: 0x2d2d2d } },
    { id: 'acharya', name: 'Acharya Ji', max: 30, bowl: { type: 'leg', stars: 2, hand: 'R' },
      look: { skin: 0xe4bc9c, hair: 'long', hairC: 0xf0f0f0, beard: 1.2, beardC: 0xf4f4f4, h: 1.02 } },
    { id: 'vikas', name: 'Vikas Sir', max: 25, bowl: { type: 'off', stars: 0, hand: 'R' },
      look: { skin: 0xcf9f78, hair: 'side', hairC: 0x2b2118, glasses: 'rect', stache: true } },
  ];
  A.forEach(p => { p.team = 'A'; });
  B.forEach(p => { p.team = 'B'; });
  const byId = (arr, id) => arr.find(p => p.id === id);
  const order = {
    A: ['you', 'gold', 'brof', 'nachi', 'gaurav', 'hemant', 'mick', 'kaushik', 'mens', 'kaali', 'zulfi'].map(i => byId(A, i)),
    B: ['nidhi', 'bakri', 'smith', 'baal', 'illu', 'candid', 'daddu', 'gulley', 'npc', 'acharya', 'vikas'].map(i => byId(B, i)),
  };
  const bowlers = {
    A: ['hemant', 'nachi', 'zulfi', 'you', 'gaurav'].map(i => byId(A, i)),
    B: ['smith', 'vikas', 'baal', 'acharya', 'bakri'].map(i => byId(B, i)),
  };
  const keeper = { A: byId(A, 'kaushik'), B: byId(B, 'candid') };
  return { A, B, order, bowlers, keeper };
}

const TIMES = {
  morning: { label: 'Morning', icon: '🌅' },
  evening: { label: 'Evening', icon: '🌇' },
  night: { label: 'Night', icon: '🌙' },
};
const WEATHERS = {
  summer: { label: 'Summer', icon: '☀️' },
  cold: { label: 'Cold', icon: '❄️' },
  cloudy: { label: 'Cloudy', icon: '☁️' },
};
// weather effect on ball physics
const WEATHER_FX = {
  summer: { swing: 0.6, bounce: 0.55, roll: 2.2, turn: 1.15 },
  cold: { swing: 1.1, bounce: 0.5, roll: 3.0, turn: 0.85 },
  cloudy: { swing: 1.6, bounce: 0.52, roll: 2.7, turn: 1.0 },
};

return { CONFIG, TEAMS, buildTeams, TIMES, WEATHERS, WEATHER_FX };
})();

/* ---- lines ---- */
__M.lines = (function(){
// ============================================================
//  Commentary lines (English + Hindi).  Add or edit freely - one line is picked at random.
//  If a matching mp3 exists (see AUDIO_MAP in audio.js) it is played instead of speech.
// ============================================================
const LINES = {
  en: {
    four: ['FOUR! Cracking shot!', 'Races away to the boundary!', 'What timing - that is four!'],
    six: ['SIX! Out of the park!', 'That has gone miles - a massive six!', 'Into the crowd! Maximum!'],
    wicket: ['OUT! What a delivery!', 'Gone! The bowler strikes!', 'That is a big wicket!'],
    lbw: ['Huge appeal for LBW!', 'Howzat! Plumb in front?'],
    review: ['Review taken! Let us see what the third umpire says.', 'The captain goes upstairs!'],
    out: ['That is OUT!'],
    notout: ['NOT OUT! The decision is overturned.', 'Saved by the review!'],
    simp: ['Ouch! Simp Gulley is down - out for a duck!'],
    dot: ['Dot ball.', 'Nothing on that one.'],
    defend: ['Solid defence.', 'Well left alone, well defended.'],
    beaten: ['Beaten! The bat missed it.', 'Right past the edge!'],
    single: ['Single taken.', 'Pushed for one.'],
    two: ['Two runs, good running.', 'They come back for the second!'],
    three: ['Three runs! Excellent running between the wickets.'],
    fifty: ['Fifty up! A fine knock.'],
    hundred: ['A magnificent hundred!'],
    win: ['What a match! Congratulations on the win!'],
    lose: ['Hard luck, better next time.'],
  },
  hi: {
    four: ['चौका! क्या शानदार शॉट!', 'गेंद सीधी सीमा रेखा के पार!', 'वाह! क्या टाइमिंग है, चार रन!'],
    six: ['छक्का! गेंद स्टेडियम के बाहर!', 'ये तो आसमान में गई, ज़बरदस्त छक्का!', 'सीधा दर्शकों में! पूरे छह रन!'],
    wicket: ['आउट! क्या गेंद थी!', 'गया! गेंदबाज़ ने विकेट ले लिया!', 'ये तो बहुत बड़ा विकेट है!'],
    lbw: ['एलबीडब्ल्यू की ज़ोरदार अपील!', 'हाउज़ैट! क्या सीधा पैड पर लगी?'],
    review: ['रिव्यू लिया गया! देखते हैं थर्ड अंपायर क्या कहते हैं।', 'कप्तान ने रिव्यू माँगा!'],
    out: ['आउट! उँगली उठ गई।'],
    notout: ['नॉट आउट! फ़ैसला बदल गया।', 'रिव्यू ने बचा लिया!'],
    simp: ['आउच! सिंप गुल्ली ढेर, खाता भी नहीं खुला!'],
    dot: ['डॉट बॉल।', 'इस गेंद पर कोई रन नहीं।'],
    defend: ['बढ़िया डिफ़ेंस।', 'सधा हुआ बचाव।'],
    beaten: ['बल्ले के पास से निकल गई! चूक गए।', 'बाल-बाल बचे!'],
    single: ['एक रन लिया।', 'धकेलकर एक रन।'],
    two: ['दो रन, बढ़िया दौड़!', 'दूसरे रन के लिए वापस दौड़े!'],
    three: ['तीन रन! विकेटों के बीच शानदार दौड़!'],
    fifty: ['पचास रन पूरे! शानदार पारी।'],
    hundred: ['शतक! क्या बेहतरीन पारी!'],
    win: ['क्या मैच था! जीत की बधाई हो!'],
    lose: ['किस्मत ने साथ नहीं दिया, अगली बार बेहतर।'],
  },
};
const ZONE_HI = { 0: 'सीधा', 1: 'कवर', 2: 'पॉइंट', 3: 'थर्ड मैन', 4: 'पीछे', '-1': 'मिड-विकेट', '-2': 'स्क्वायर लेग', '-3': 'फ़ाइन लेग' };
function pickLine(lang, key) {
  const arr = (LINES[lang] && LINES[lang][key]) || (LINES.en[key]) || [''];
  return arr[Math.floor(Math.random() * arr.length)];
}

return { LINES, ZONE_HI, pickLine };
})();

/* ---- audio ---- */
__M.audio = (function(){
// ============================================================
//  AUDIO  -  drop your own .mp3 files into /assets/audio/ and list them here.
//  Each event can have several files (one is picked at random).
//  If a file is missing, a built-in synthesized sound / speech is used instead.
// ============================================================
const AUDIO_BASE = 'assets/audio/';
const AUDIO_MAP = {
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
const VOICE_KEYS = ['four', 'six', 'wicket', 'lbw', 'review', 'out', 'notout', 'simp', 'dot', 'defend', 'beaten', 'single', 'two', 'three', 'fifty', 'hundred', 'win', 'lose'];
for (const k of VOICE_KEYS) { AUDIO_MAP['v_' + k] = [1, 2].map(i => `voice_${k}_${i}.mp3`); AUDIO_MAP['hi_v_' + k] = [1, 2].map(i => `hi_voice_${k}_${i}.mp3`); }
AUDIO_MAP.bgm = ['bgm.mp3'];   // background music loop (optional)

class AudioManager {
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

return { AUDIO_BASE, AUDIO_MAP, VOICE_KEYS, AudioManager };
})();

/* ---- compat ---- */
__M.compat = (function(){
// Works with Three.js r149 (bundled in /lib) and r152+ / r160
const REV = parseInt(THREE.REVISION, 10) || 160;
const LI = REV >= 155 ? 1 : 1 / Math.PI;     // light intensity scale (legacy vs physical lights)
const FLOOD = REV >= 155 ? 90 : 0.45;        // floodlight spot intensity
function srgb(t) { if (REV >= 152) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; return t; }

return { REV, LI, FLOOD, srgb };
})();

/* ---- physics ---- */
__M.physics = (function(){

const G = 9.81;
const BALL_R = 0.07;
const HIT_Z = 8.6;          // plane where bat meets ball
const STUMP_Z = 10.06;      // batting-end stumps
const ROPE_R = 70;

function ballisticVel(p0, p1, T) {
  return new THREE.Vector3((p1.x - p0.x) / T, (p1.y - p0.y) / T + 0.5 * G * T, (p1.z - p0.z) / T);
}

// Free flight: gravity, quadratic drag, bounce, rolling friction, hoarding collision
class Flight {
  constructor(pos, vel, fx) {
    this.pos = pos.clone(); this.vel = vel.clone(); this.fx = fx;
    this.stopped = false; this.t = 0; this.bounces = 0; this.maxR = 0; this.crossed = false; this.inStands = false;
    this.maxY = pos.y; this.drag = 0.0016;
  }
  step(dt) {
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n && !this.stopped; i++) this._s(h);
  }
  _s(h) {
    const v = this.vel, p = this.pos, k = this.drag * v.length();
    v.x -= v.x * k * h; v.y -= v.y * k * h; v.z -= v.z * k * h; v.y -= G * h;
    p.x += v.x * h; p.y += v.y * h; p.z += v.z * h; this.t += h;
    if (p.y > this.maxY) this.maxY = p.y;
    if (p.y <= BALL_R && v.y < 0) {
      p.y = BALL_R;
      if (-v.y > 1.3) { v.y = -v.y * this.fx.bounce; v.x *= 0.88; v.z *= 0.88; this.bounces++; } else v.y = 0;
    }
    if (p.y <= BALL_R + 0.002 && v.y === 0) {
      const hs = Math.hypot(v.x, v.z), ns = Math.max(0, hs - this.fx.roll * h);
      if (hs > 0) { v.x *= ns / hs; v.z *= ns / hs; }
      if (ns < 0.2) { this.stopped = true; v.set(0, 0, 0); }
    }
    const r = Math.hypot(p.x, p.z); if (r > this.maxR) this.maxR = r;
    if (r > ROPE_R) this.crossed = true;
    if (r > 72.3 && p.y < 1.1 && v.x * p.x + v.z * p.z > 0) { // advertising hoarding
      const nx = p.x / r, nz = p.z / r, d = v.x * nx + v.z * nz;
      v.x -= 1.5 * d * nx; v.z -= 1.5 * d * nz; v.multiplyScalar(0.45); p.x = nx * 72.2; p.z = nz * 72.2;
    }
    if (r > 74 && p.y <= BALL_R + 0.01) { this.stopped = true; this.inStands = true; v.set(0, 0, 0); }
  }
}

function simulateStop(pos, vel, fx, maxT = 12) {
  const f = new Flight(pos, vel, fx);
  while (!f.stopped && f.t < maxT) f.step(1 / 60);
  return f;
}

// Launch speed so a ground ball (with a small hop) travels ~dist metres before stopping
function groundVelocity(p0, angleDeg, dist, fx) {
  const a = angleDeg * Math.PI / 180, dx = Math.sin(a), dz = -Math.cos(a);
  let lo = 4, hi = 60;
  for (let i = 0; i < 16; i++) {
    const s = (lo + hi) / 2, f = simulateStop(p0, new THREE.Vector3(dx * s, 1.4, dz * s), fx, 14);
    const d = Math.hypot(f.pos.x - p0.x, f.pos.z - p0.z);
    if (d < dist) lo = s; else hi = s;
  }
  const s = (lo + hi) / 2; return new THREE.Vector3(dx * s, 1.4, dz * s);
}

/* Bowler's delivery: analytic two-parabola path (release -> bounce -> bat plane)
   o = { R:Vector3, bx, bz, speed, swing, turn, end:{x,y}?, bounceMul?, pace? } */
class Delivery {
  constructor(o, fx) {
    this.R = o.R.clone(); this.B = new THREE.Vector3(o.bx, 0, o.bz); this.fx = fx;
    const dz = this.B.z - this.R.z; this.t1 = dz / o.speed; this.swing = (o.swing || 0) * fx.swing;
    const t1 = this.t1;
    this.v1 = new THREE.Vector3((this.B.x - this.R.x) / t1, (0 - this.R.y) / t1 + 0.5 * G * t1, dz / t1);
    const vyB = this.v1.y - G * t1, pace = o.pace || 0.82;
    const vz2 = this.v1.z * pace; this.t2 = (HIT_Z - this.B.z) / vz2;
    let vx2 = this.v1.x + (o.turn || 0) * fx.turn, vy2 = -vyB * fx.bounce * (o.bounceMul || 1.1);
    if (o.end) { vx2 = (o.end.x - this.B.x) / this.t2; vy2 = o.end.y / this.t2 + 0.5 * G * this.t2; }
    this.v2 = new THREE.Vector3(vx2, vy2, vz2); this.total = this.t1 + this.t2;
  }
  pos(t, out = new THREE.Vector3()) {
    if (t <= this.t1) {
      const u = t / this.t1;
      out.set(this.R.x + this.v1.x * t + this.swing * Math.sin(Math.PI * u), this.R.y + this.v1.y * t - 0.5 * G * t * t, this.R.z + this.v1.z * t);
      if (out.y < BALL_R) out.y = BALL_R; return out;
    }
    const d = t - this.t1;
    out.set(this.B.x + this.v2.x * d, Math.max(BALL_R, this.v2.y * d - 0.5 * G * d * d), this.B.z + this.v2.z * d);
    return out;
  }
  velAt(t) {
    if (t <= this.t1) return new THREE.Vector3(this.v1.x, this.v1.y - G * t, this.v1.z);
    const d = t - this.t1; return new THREE.Vector3(this.v2.x, this.v2.y - G * d, this.v2.z);
  }
  endPos() { return this.pos(this.total); }
}

// Sample the delivery as a polyline (for Hawk-Eye)
function samplePath(del, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) pts.push(del.pos(del.total * i / n)); return pts;
}

return { G, BALL_R, HIT_Z, STUMP_Z, ROPE_R, ballisticVel, Flight, simulateStop, groundVelocity, Delivery, samplePath };
})();

/* ---- ai ---- */
__M.ai = (function(){
const { CONFIG } = __M.data;

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function wpick(pairs) { // [[value, weight],...]
  const tot = pairs.reduce((s, p) => s + p[1], 0); let r = Math.random() * tot;
  for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; } return pairs[0][0];
}

// ---------- zones (angle: 0 = straight, + = off side, - = leg side) ----------
const ZONE_NAMES = { 0: 'Straight', 1: 'Cover', 2: 'Point', 3: 'Third Man', 4: 'Behind', '-1': 'Mid-wicket', '-2': 'Square Leg', '-3': 'Fine Leg' };
function zoneKey(deg) { let k = Math.round(deg / 45); if (k === -4) k = 4; return k; }
const BAT = { x: 0.35, z: 9.2 };

// ---------- AI batter: a plan of ball outcomes that sums to a random score in [0,max] ----------
function makePlan(max, simp) {
  if (simp) return ['W'];
  const target = Math.floor(Math.random() * (max + 1)), out = []; let left = target;
  while (left > 0 && out.length < 80) {
    const opts = [[0, 30], [1, 28], [2, 8], [4, 22], [6, 12]].filter(([r]) => r <= left);
    const r = wpick(opts); out.push(r); left -= r;
  }
  out.push('W'); return out;
}
const pickWicketType = () => wpick([['bowled', 28], ['lbw', 24], ['caught', 38], ['caughtbehind', 10]]);

// ---------- fielding positions (batter-centred polar) ----------
function setField() {
  const heavy = Math.random() < 0.5 ? 1 : -1, pos = [];
  const mk = (a, r) => {
    const rad = a * Math.PI / 180;
    let x = BAT.x + r * Math.sin(rad), z = BAT.z - r * Math.cos(rad), d = Math.hypot(x, z);
    if (d > 64) { x *= 64 / d; z *= 64 / d; }
    pos.push({ x, z, a, r });
  };
  [30, 62, 95, 125].forEach((a, i) => mk(heavy * (a + rnd(-8, 8)), [24, 34, 46, 60][i] + rnd(-4, 6)));
  [40, 95, 140].forEach((a, i) => mk(-heavy * (a + rnd(-8, 8)), [38, 30, 58][i] + rnd(-4, 6)));
  mk(rnd(-14, -6), rnd(50, 60)); mk(rnd(6, 14), rnd(50, 60));
  return { pos, heavy };
}
function zoneCounts(pos) {
  const c = {}; for (let k = -3; k <= 4; k++) c[k] = 0;
  for (const f of pos) {
    const ang = Math.atan2(f.x - BAT.x, -(f.z - BAT.z)) * 180 / Math.PI;
    c[zoneKey(ang)] += f.r < 36 ? 1 : 0.9;
  }
  return c;
}
function zoneLevel(n) { return n >= 2.8 ? 'red' : n >= 1.8 ? 'amber' : 'green'; }

function aiShotAngle(counts) {
  const base = { 0: 3, 1: 2.5, '-1': 2.5, 2: 1.2, '-2': 1.2, 3: 0.5, '-3': 0.5 };
  const w = Object.entries(base).map(([k, b]) => [+k, b / (1 + counts[+k] * 1.4)]);
  const k = wpick(w); return k * 45 + rnd(-17, 17);
}

// ---------- the batting rules engine for the human player ----------
// kind: none|defend|single|drive|loft   q: perfect|good|late|miss   scen: normal|bowled|lbw|wide
function resolveUserShot({ kind, q, stars, crowded, scen }) {
  const onStumps = scen === 'bowled' || scen === 'lbw';
  const R = (runs, wicket = null, extra = {}) => ({ runs, wicket, ...extra });
  const dismissal = () => ({ type: onStumps ? wpick([['bowled', 5], ['lbw', 3]]) : wpick([['caught', 7], ['caughtbehind', 2], ['bowled', 1]]) });
  if (kind === 'none') return onStumps ? R(0, { type: scen === 'lbw' ? 'lbw' : 'bowled' }) : R(0);
  if (kind === 'defend') {
    if (q === 'miss') return onStumps ? R(0, { type: scen === 'lbw' ? 'lbw' : 'bowled' }) : R(0);
    if (q === 'late' && Math.random() < 0.1) return R(0, { type: 'caughtbehind' });
    return R(0, null, { blocked: true });
  }
  if (kind === 'single') {
    if (q === 'miss') return onStumps ? R(0, { type: scen === 'lbw' ? 'lbw' : 'bowled' }) : R(0);
    return crowded && Math.random() < 0.5 ? R(0, null, { blocked: true }) : R(1);
  }
  // aggressive: drive (aims for 4) / loft (aims for 6)
  const loft = kind === 'loft', bonus = { perfect: 0.25, good: 0.05, late: -0.25, miss: -0.5 }[q];
  if (stars >= 3) return R(0, loft ? { type: 'caught' } : dismissal(), { risk: 'forbidden' });
  if (stars === 2) {
    let p = CONFIG.twoStarSuccess + bonus - (crowded && loft ? CONFIG.crowdedZonePenalty : 0);
    p = Math.max(0.04, Math.min(0.9, p));
    if (Math.random() < p) return R(loft ? (q === 'perfect' || q === 'good' ? 6 : 2) : (q === 'late' ? 2 : 4), null, { risk: 'paid' });
    return R(0, loft ? { type: 'caught' } : dismissal(), { risk: 'failed' });
  }
  // unrated bowler: brutal
  let pOut = CONFIG.unratedOutChance + (q === 'late' ? 0.1 : q === 'miss' ? 0.4 : 0) + (crowded && loft ? CONFIG.crowdedZonePenalty * 0.7 : 0);
  if (Math.random() < pOut) return R(0, loft ? { type: 'caught' } : dismissal());
  if (q === 'miss') return R(0);
  if (loft) return R(q === 'late' ? 2 : (Math.random() < 0.7 ? 6 : 4));
  const runs = q === 'late' ? 2 : 4; return R(crowded && Math.random() < 0.55 ? 1 : runs);
}

function timingQuality(offset) {
  const a = Math.abs(offset);
  if (a <= CONFIG.swingPerfect) return 'perfect';
  if (a <= CONFIG.swingGood) return 'good';
  if (a <= CONFIG.swingLate) return 'late';
  return 'miss';
}

// ---------- human bowling: quality 0..1 from chosen line (x) and length (z) ----------
function bowlQuality(lineX, lengthZ) {
  const lineErr = Math.min(1, Math.abs(lineX - 0.18) / 0.9), lenErr = Math.min(1, Math.min(Math.abs(lengthZ - 6.4), Math.abs(lengthZ - 8.0)) / 2.2);
  return Math.max(0, 1 - 0.55 * lineErr - 0.45 * lenErr);
}
function adjustForBowling(outcome, Q) {
  if (outcome === 'W') return outcome;
  if (Q > 0.8) { const r = Math.random(); if (r < 0.1) return 'W'; if ((outcome === 4 || outcome === 6) && r < 0.55) return 0; }
  if (Q < 0.35 && (outcome === 0 || outcome === 1 || outcome === 2) && Math.random() < 0.35) return 4;
  return outcome;
}

// ---------- LBW specification & Hawk-Eye numbers ----------
function makeLbw() {
  const kind = wpick([['plumb', 45], ['marginal', 15], ['legpitch', 14], ['high', 13], ['misses', 13]]);
  const s = { kind, pitchX: rnd(-0.1, 0.1), impX: rnd(-0.07, 0.07), impY: 0.42, projY: 0.32, projX: 0 };
  if (kind === 'marginal') { s.impX = pick([-1, 1]) * 0.138; }
  if (kind === 'legpitch') { s.pitchX = -0.5; s.impX = -0.06; }
  if (kind === 'high') { s.impY = 0.78; s.projY = 0.95; }
  if (kind === 'misses') { s.impX = -0.34; s.pitchX = -0.2; }
  s.projX = s.impX;
  const halfW = 0.1143 + 0.036;
  s.pitching = s.pitchX < -0.17 ? 'OUTSIDE LEG' : 'IN LINE';
  s.impact = Math.abs(s.impX) <= halfW + 0.03 ? 'IN LINE' : (s.impX < 0 ? 'OUTSIDE LEG' : 'OUTSIDE OFF');
  s.wickets = (kind === 'plumb' || kind === 'legpitch') ? 'HITTING' : kind === 'marginal' ? "UMPIRE'S CALL" : 'MISSING';
  s.trulyOut = kind === 'plumb';
  s.umpireCall = kind === 'marginal';
  const pOut = kind === 'plumb' ? 0.92 : kind === 'marginal' ? 0.55 : 0.25;
  s.decisionOut = Math.random() < pOut;
  return s;
}

return { rnd, pick, wpick, ZONE_NAMES, zoneKey, BAT, makePlan, pickWicketType, setField, zoneCounts, zoneLevel, aiShotAngle, resolveUserShot, timingQuality, bowlQuality, adjustForBowling, makeLbw };
})();

/* ---- characters ---- */
__M.characters = (function(){

// ---------- shared geometry / materials ----------
const GE = {
  sph: new THREE.SphereGeometry(1, 16, 12),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 12),
  cap: new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
  tor: new THREE.TorusGeometry(1, 0.14, 6, 18),
};
const matCache = new Map();
function M(c, o = {}) {
  const k = c + '|' + JSON.stringify(o);
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.02, ...o }));
  return matCache.get(k);
}
function part(parent, g, mat, sx, sy, sz, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(g, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = shadow; parent.add(m); return m;
}
const ease = u => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;

class Character {
  constructor(player, teamColor, opts = {}) {
    this.player = player; this.teamColor = teamColor; this.kind = opts.kind || 'player';
    const L = player.look || {}, sp = L.sp, H = L.h || 1, bulk = L.bulk || 1;
    this.root = new THREE.Group(); this.root.scale.setScalar(H);
    this.body = new THREE.Group(); this.root.add(this.body);
    const skinC = sp === 'blank' ? 0x060606 : sp === 'devil' ? 0xa51a1a : sp === 'goat' ? 0xe9e1cc : (L.skin ?? 0xc99a74);
    const skin = M(skinC), hairM = M(L.hairC ?? 0x222222), shirt = M(teamColor, { roughness: 0.6 });
    let pantC = 0xf3f3f0; if (sp === 'agent') pantC = 0x111111; if (sp === 'nerd') pantC = 0xb8a679; if (this.kind === 'umpire') pantC = 0x1c1c20;
    const pants = M(pantC);
    this.hair = []; this.parts = {}; this.tailPivot = null; this.cape = null; this.laugh = sp === 'laugh';
    const girl = sp === 'girl', sw = (girl ? 0.84 : bulk);

    // legs
    const mkLeg = s => {
      const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.9, 0); this.body.add(hip);
      part(hip, GE.cyl, pants, 0.08, 0.46, 0.08, 0, -0.22, 0);
      const knee = new THREE.Group(); knee.position.set(0, -0.45, 0); hip.add(knee);
      part(knee, GE.cyl, sp === 'boomer' ? skin : pants, 0.065, 0.46, 0.065, 0, -0.22, 0);
      part(knee, GE.box, sp === 'batman' ? M(0x111111) : M(0xf5f5f5), 0.09, 0.07, 0.2, 0, -0.46, 0.04);
      const pad = part(knee, GE.box, M(0xf2efe6), 0.13, 0.42, 0.1, 0, -0.18, 0.06); pad.visible = false;
      return { hip, knee, pad };
    };
    const lg = mkLeg(-1), rg = mkLeg(1);
    this.legL = lg.hip; this.kneeL = lg.knee; this.legR = rg.hip; this.kneeR = rg.knee; this.pads = [lg.pad, rg.pad];

    // torso
    this.torso = new THREE.Group(); this.torso.position.set(0, 0.9, 0); this.body.add(this.torso);
    let tColor = shirt; if (sp === 'agent') tColor = M(0x0d0d0d);
    part(this.torso, GE.box, tColor, 0.4 * sw, 0.56, 0.22 * (L.belly ? 1.3 : 1), 0, 0.28, 0);
    part(this.torso, GE.cyl, pants, 0.19 * sw, 0.1, 0.12, 0, 0.02, 0);
    if (sp === 'agent') { part(this.torso, GE.box, M(0xffffff), 0.08, 0.3, 0.02, 0, 0.38, 0.115); part(this.torso, GE.box, shirt, 0.04, 0.3, 0.02, 0, 0.34, 0.125); }
    if (L.belly) part(this.torso, GE.sph, shirt, 0.19, 0.19, 0.17, 0, 0.14, 0.12);
    if (sp === 'nerd') { part(this.torso, GE.box, M(0xffffff), 0.07, 0.09, 0.02, 0.12, 0.42, 0.125); [0, 1].forEach(i => part(this.torso, GE.box, i ? M(0x2255cc) : M(0xcc2222), 0.01, 0.06, 0.02, 0.1 + i * 0.025, 0.46, 0.13)); }
    if (sp === 'batman') { part(this.torso, GE.sph, M(0x111111), 0.07, 0.04, 0.02, 0, 0.4, 0.115); part(this.torso, GE.box, M(0xf5c518), 0.4 * sw, 0.05, 0.23, 0, 0.02, 0); }
    // arms
    const mkArm = s => {
      const sh = new THREE.Group(); sh.position.set(s * (0.21 * sw + 0.03), 0.5, 0); this.torso.add(sh);
      part(sh, GE.cyl, sp === 'agent' ? M(0x0d0d0d) : shirt, 0.06 * (sp === 'batman' ? 1.3 : 1), 0.3, 0.06 * (sp === 'batman' ? 1.3 : 1), 0, -0.14, 0);
      const el = new THREE.Group(); el.position.set(0, -0.29, 0); sh.add(el);
      part(el, GE.cyl, sp === 'batman' ? M(0x111111) : skin, 0.048, 0.27, 0.048, 0, -0.13, 0);
      const hand = part(el, GE.sph, sp === 'batman' ? M(0x111111) : skin, 0.055, 0.055, 0.055, 0, -0.29, 0);
      return { sh, el, hand };
    };
    const al = mkArm(-1), ar = mkArm(1);
    this.armL = al.sh; this.elbowL = al.el; this.armR = ar.sh; this.elbowR = ar.el; this.handR = ar.hand; this.handL = al.hand;
    this.gloves = [];
    [al.el, ar.el].forEach(el => { const g = part(el, GE.sph, M(0xf2f2f2), 0.075, 0.075, 0.075, 0, -0.3, 0.01); g.visible = false; this.gloves.push(g); });

    // head
    this.head = new THREE.Group(); this.head.position.set(0, 1.64, 0); this.body.add(this.head);
    part(this.body, GE.cyl, skin, 0.05, 0.1, 0.05, 0, 1.5, 0);
    const headSph = part(this.head, GE.sph, skin, 0.125, 0.14, 0.13, 0, 0.0, 0);
    if (sp === 'goat') headSph.scale.set(0.12, 0.17, 0.135);
    this._face(L, sp, skin, hairM);
    this._hair(L, sp, hairM);
    this._specials(L, sp, skin, shirt, teamColor);

    // bat
    this.batP = new THREE.Group(); this.batP.position.set(0.02, 0.95, 0.28); this.body.add(this.batP);
    part(this.batP, GE.cyl, M(0x222222), 0.018, 0.2, 0.018, 0, -0.1, 0);
    part(this.batP, GE.box, M(0xd8b878), 0.11, 0.62, 0.035, 0, -0.5, 0);
    this.batP.visible = false;
    // helmet
    this.helmet = new THREE.Group(); this.head.add(this.helmet);
    part(this.helmet, GE.cap, M(new THREE.Color(teamColor).multiplyScalar(0.8).getHex(), { roughness: 0.35 }), 0.152, 0.16, 0.16, 0, 0.01, 0);
    part(this.helmet, GE.box, M(0x222222), 0.14, 0.012, 0.07, 0, 0.08, 0.15);
    for (let i = -1; i <= 1; i++) part(this.helmet, GE.box, M(0x999999), 0.006, 0.07, 0.006, i * 0.045, -0.0, 0.155);
    this.helmet.visible = false;
    this.root.traverse(o => { if (o.isMesh) o.castShadow = true; });

    this.anim = { name: 'idle', t: 0, once: false, dur: 1, loc: true }; this.target = null; this.speed = 5; this.facing = 0;
    this.time = Math.random() * 10; this.bodyYaw = 0; this.swingAim = 0; this.swingKind = 'drive'; this.heldBall = null;
  }

  _face(L, sp, skin, hairM) {
    const h = this.head, dark = M(0x111111);
    if (sp !== 'blank') {
      if (sp === 'cyclops') {
        part(h, GE.sph, M(0xffffff), 0.05, 0.05, 0.03, 0, 0.035, 0.12); part(h, GE.sph, M(0x9b1c1c, { emissive: 0x330000 }), 0.027, 0.027, 0.02, 0, 0.035, 0.145); part(h, GE.sph, dark, 0.013, 0.013, 0.01, 0, 0.035, 0.158);
        part(h, GE.box, hairM, 0.1, 0.014, 0.02, 0, 0.09, 0.12);
      } else if (sp === 'goat') {
        [-1, 1].forEach(s => { part(h, GE.sph, M(0xf2d95c), 0.026, 0.02, 0.014, s * 0.065, 0.045, 0.1); part(h, GE.box, dark, 0.026, 0.006, 0.01, s * 0.065, 0.045, 0.112); });
      } else if (sp === 'laugh') {
        [-1, 1].forEach(s => part(h, GE.box, dark, 0.04, 0.008, 0.01, s * 0.045, 0.04, 0.122).rotation.z = s * 0.3);
      } else if (sp === 'devil') {
        [-1, 1].forEach(s => { part(h, GE.sph, M(0xffd400, { emissive: 0xffaa00, emissiveIntensity: 1.2 }), 0.026, 0.016, 0.014, s * 0.045, 0.035, 0.115).rotation.z = -s * 0.35; });
      } else {
        [-1, 1].forEach(s => { part(h, GE.sph, M(0xffffff), 0.022, 0.018, 0.012, s * 0.045, 0.03, 0.112); part(h, GE.sph, dark, 0.011, 0.011, 0.008, s * 0.045, 0.03, 0.122); });
        if (sp === 'girl') [-1, 1].forEach(s => part(h, GE.box, dark, 0.035, 0.005, 0.008, s * 0.045, 0.052, 0.118));
        part(h, GE.sph, skin, 0.018, 0.022, 0.02, 0, -0.01, 0.128);
      }
      if (sp === 'laugh') { part(h, GE.sph, M(0x3a0808), 0.05, 0.03, 0.02, 0, -0.058, 0.115); part(h, GE.box, M(0xffffff), 0.06, 0.012, 0.01, 0, -0.04, 0.133); }
      else if (sp === 'girl') part(h, GE.box, M(0xd64a6a), 0.035, 0.012, 0.01, 0, -0.058, 0.123);
      else if (sp === 'nerd') { part(h, GE.box, M(0x7a2020), 0.04, 0.008, 0.01, 0, -0.056, 0.123); part(h, GE.box, M(0xffffff), 0.018, 0.016, 0.008, 0, -0.065, 0.126); }
      else if (sp !== 'cyclops' && sp !== 'goat') part(h, GE.box, M(0x7a3030), 0.04, 0.007, 0.01, 0, -0.058, 0.123);
    }
    if (L.stache) part(h, GE.box, hairM, 0.085, 0.016, 0.02, 0, -0.04, 0.125);
    if (L.beard) {
      const bc = M(L.beardC ?? 0x222222), n = L.beard;
      part(h, GE.sph, bc, 0.118, 0.05 + 0.07 * n, 0.1, 0, -0.075 - 0.04 * n, 0.03);
      if (n > 1) part(h, GE.cone, bc, 0.09, 0.28 * (n - 0.6), 0.06, 0, -0.21 - 0.05 * n, 0.07).rotation.x = Math.PI;
    }
    if (L.glasses === 'round') [-1, 1].forEach(s => part(h, GE.tor, dark, 0.04, 0.04, 0.04, s * 0.047, 0.03, 0.125));
    if (L.glasses === 'rect') [-1, 1].forEach(s => part(h, GE.box, M(0x222222, { transparent: true, opacity: 0.55 }), 0.058, 0.04, 0.008, s * 0.047, 0.03, 0.128));
    if (L.glasses === 'shades' || sp === 'agent') { [-1, 1].forEach(s => part(h, GE.box, dark, 0.058, 0.034, 0.012, s * 0.047, 0.03, 0.128)); part(h, GE.box, dark, 0.14, 0.008, 0.01, 0, 0.04, 0.12); }
    if (L.glasses === 'round' || L.glasses === 'rect') part(h, GE.box, dark, 0.03, 0.006, 0.006, 0, 0.035, 0.13);
  }

  _hair(L, sp, hairM) {
    const h = this.head, style = L.hair || 'none';
    if (style === 'none' || sp === 'blank' || sp === 'goat' || sp === 'devil' || sp === 'batman') return;
    if (style === 'bald') { if (sp === 'boomer') [-1, 1].forEach(s => part(h, GE.sph, hairM, 0.04, 0.06, 0.06, s * 0.12, 0.0, -0.02)); return; }
    const cap = () => part(h, GE.cap, hairM, 0.137, 0.15, 0.142, 0, 0.012, -0.004);
    if (style === 'short' || style === 'side') { cap(); if (style === 'side') part(h, GE.box, hairM, 0.12, 0.02, 0.05, -0.01, 0.12, 0.08); }
    if (style === 'quiff') { cap(); part(h, GE.box, hairM, 0.1, 0.06, 0.1, 0, 0.15, 0.07).rotation.x = -0.4; }
    if (style === 'curly') { cap(); for (let i = 0; i < 16; i++) { const a = i * 2.4, b = 0.4 + (i % 4) * 0.28; part(h, GE.sph, hairM, 0.05, 0.05, 0.05, Math.sin(a) * 0.1 * Math.sin(b + 0.6), 0.07 + Math.cos(b) * 0.09, Math.cos(a) * 0.1 * Math.sin(b + 0.6) - 0.01); } }
    if (style === 'long' || style === 'pony') {
      cap();
      const n = style === 'long' ? 7 : 3;
      for (let i = 0; i < n; i++) {
        const piv = new THREE.Group(), a = (i / (n - 1) - 0.5) * (style === 'long' ? 2.2 : 0.4); piv.position.set(Math.sin(a) * 0.11, 0.07, -Math.cos(a) * 0.1);
        part(piv, GE.box, hairM, 0.045, style === 'long' ? 0.44 : 0.3, 0.035, 0, -0.2, 0); piv.userData.ph = i * 0.9; h.add(piv); this.hair.push(piv);
      }
      if (style === 'long') [-1, 1].forEach(s => part(h, GE.box, hairM, 0.03, 0.2, 0.08, s * 0.125, -0.06, 0));
    }
  }

  _specials(L, sp, skin, shirt, teamColor) {
    const h = this.head, dark = M(0x101010);
    if (sp === 'batman') {
      part(h, GE.cap, dark, 0.14, 0.15, 0.145, 0, 0.0, -0.002); part(h, GE.cyl, dark, 0.13, 0.05, 0.135, 0, 0.0, -0.001);
      [-1, 1].forEach(s => { part(h, GE.cone, dark, 0.03, 0.12, 0.03, s * 0.07, 0.19, 0); part(h, GE.box, M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), 0.04, 0.012, 0.01, s * 0.045, 0.035, 0.13); });
      const cape = new THREE.Group(); cape.position.set(0, 0.5, -0.12); this.torso.add(cape);
      part(cape, GE.box, dark, 0.52, 0.95, 0.025, 0, -0.45, 0); this.cape = cape;
    }
    if (sp === 'skullcap') { part(h, GE.cap, M(0xffffff), 0.13, 0.08, 0.13, 0, 0.09, 0); part(h, GE.sph, M(0xffffff), 0.02, 0.02, 0.02, 0, 0.17, 0); }
    if (sp === 'goat') {
      part(h, GE.box, M(0xf0e8d4), 0.065, 0.08, 0.13, 0, -0.06, 0.12); part(h, GE.sph, dark, 0.012, 0.01, 0.01, -0.02, -0.04, 0.19); part(h, GE.sph, dark, 0.012, 0.01, 0.01, 0.02, -0.04, 0.19);
      part(h, GE.cone, M(0xd8cfb6), 0.025, 0.09, 0.025, 0, -0.16, 0.14).rotation.x = Math.PI;
      [-1, 1].forEach(s => { const hn = part(h, GE.cone, M(0x5a4a30), 0.032, 0.17, 0.032, s * 0.06, 0.17, -0.02); hn.rotation.z = -s * 0.5; hn.rotation.x = -0.3; part(h, GE.sph, M(0xe9e1cc), 0.07, 0.025, 0.04, s * 0.15, 0.03, -0.01).rotation.z = s * 0.4; });
    }
    if (sp === 'devil') {
      [-1, 1].forEach(s => { const hn = part(h, GE.cone, M(0x1a0505), 0.035, 0.22, 0.035, s * 0.07, 0.19, 0.0); hn.rotation.z = -s * 0.45; hn.rotation.x = -0.15; part(h, GE.cone, skin, 0.03, 0.09, 0.02, s * 0.13, 0.03, 0).rotation.z = -s * 1.2; });
      part(h, GE.cone, M(0x1a0505), 0.03, 0.09, 0.03, 0, -0.14, 0.1).rotation.x = Math.PI;
      this.tailPivot = new THREE.Group(); this.tailPivot.position.set(0, 0.95, -0.1); this.body.add(this.tailPivot);
      part(this.tailPivot, GE.cyl, skin, 0.02, 0.5, 0.02, 0, -0.2, -0.1).rotation.x = 0.5; part(this.tailPivot, GE.cone, M(0x1a0505), 0.05, 0.12, 0.02, 0, -0.45, -0.22).rotation.x = 2.6;
      part(this.torso, GE.box, M(0x1a0505), 0.41, 0.06, 0.23, 0, 0.55, 0);
    }
    if (sp === 'agent') { part(h, GE.cyl, M(0x111111), 0.008, 0.07, 0.008, 0.125, -0.01, 0.0); part(h, GE.cyl, M(0x111111), 0.004, 0.2, 0.004, 0.12, -0.15, 0).rotation.z = 0.15; }
    if (this.kind === 'umpire') {
      part(h, GE.cyl, M(0xffffff), 0.2, 0.012, 0.2, 0, 0.1, 0); part(h, GE.cap, M(0xffffff), 0.14, 0.1, 0.14, 0, 0.1, 0);
    }
  }

  setGear(g) { // 'field' | 'bat' | 'bowl' | 'keeper'
    this.gear = g;
    this.helmet.visible = g === 'bat';
    this.pads.forEach(p => { p.visible = g === 'bat' || g === 'keeper'; });
    this.gloves.forEach(m => { m.visible = g === 'bat' || g === 'keeper'; m.scale.setScalar(g === 'keeper' ? 0.1 : 0.075); });
    this.batP.visible = g === 'bat';
  }

  place(x, z, facing) { this.root.position.set(x, 0, z); if (facing !== undefined) { this.facing = facing; this.root.rotation.y = facing; } this.target = null; }
  moveTo(x, z, speed) { this.target = { x, z }; if (speed) this.speed = speed; }
  faceTo(x, z) { this.facing = Math.atan2(x - this.root.position.x, z - this.root.position.z); }
  get moving() { return !!this.target; }
  play(name, o = {}) { this.anim = { name, t: 0, once: !!o.once, dur: o.dur || 1, loc: o.loc !== undefined ? o.loc : (name === 'idle' || name === 'fieldReady'), hold: o.hold, kind: o.kind }; if (o.aim !== undefined) this.swingAim = o.aim; if (o.kind) this.swingKind = o.kind; }
  get done() { return this.anim.once && this.anim.t >= this.anim.dur; }
  worldHand(out = new THREE.Vector3()) { this.handR.getWorldPosition(out); return out; }

  _reset() {
    const z = o => o.rotation.set(0, 0, 0);
    [this.legL, this.legR, this.kneeL, this.kneeR, this.armL, this.armR, this.elbowL, this.elbowR, this.torso, this.head, this.body].forEach(z);
    this.body.position.set(0, 0, 0); this.torso.scale.set(1, 1, 1); this.batP.rotation.set(0.05, 0, 0); this.batP.position.set(0.02, 0.95, 0.28);
  }

  update(dt) {
    this.time += dt; const a = this.anim; a.t += dt;
    // locomotion
    let moving = false;
    if (this.target) {
      const dx = this.target.x - this.root.position.x, dz = this.target.z - this.root.position.z, d = Math.hypot(dx, dz);
      if (d < 0.12) this.target = null;
      else { const s = Math.min(d, this.speed * dt); this.root.position.x += dx / d * s; this.root.position.z += dz / d * s; this.facing = Math.atan2(dx, dz); moving = true; }
    }
    let da = this.facing - this.root.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); this.root.rotation.y += da * Math.min(1, dt * 12);
    this._reset();
    const name = moving && a.loc ? 'run' : a.name, t = a.t, u = Math.min(1, a.t / a.dur);
    const P = POSES[name] || POSES.idle; P(this, t, u, a, moving);
    if (this.laugh) { this.head.rotation.z += Math.sin(this.time * 16) * 0.1; this.head.rotation.x += -0.2 + Math.sin(this.time * 12) * 0.08; this.body.position.y += Math.abs(Math.sin(this.time * 8)) * 0.02; }
    this.hair.forEach(p => { p.rotation.x = 0.12 + Math.sin(this.time * 2.2 + p.userData.ph) * 0.14 + (moving ? 0.4 : 0); p.rotation.z = Math.sin(this.time * 1.7 + p.userData.ph) * 0.07; });
    if (this.cape) this.cape.rotation.x = 0.08 + Math.sin(this.time * 3) * 0.05 + (moving ? 0.55 : 0);
    if (this.tailPivot) this.tailPivot.rotation.x = Math.sin(this.time * 3) * 0.2;
  }
}

// ---------- pose library ----------
const swingCurve = (u, back, fwd, follow) => {
  if (u < 0.3) return lerp(0, back, ease(u / 0.3));
  if (u < 0.55) return lerp(back, fwd, ease((u - 0.3) / 0.25));
  return lerp(fwd, follow, ease((u - 0.55) / 0.45));
};
const POSES = {
  idle(c, t) {
    c.torso.scale.y = 1 + Math.sin(t * 2) * 0.01; c.armL.rotation.z = 0.08 + Math.sin(t * 1.5) * 0.02; c.armR.rotation.z = -0.08 - Math.sin(t * 1.5) * 0.02; c.head.rotation.y = Math.sin(t * 0.5 + c.time) * 0.15;
  },
  fieldReady(c, t) {
    c.legL.rotation.x = -0.35; c.kneeL.rotation.x = 0.6; c.legR.rotation.x = 0.1; c.kneeR.rotation.x = 0.3; c.torso.rotation.x = 0.4; c.head.rotation.x = -0.3;
    c.armL.rotation.x = -0.5 + Math.sin(t * 3) * 0.05; c.armR.rotation.x = -0.5; c.elbowL.rotation.x = -0.5; c.elbowR.rotation.x = -0.5; c.body.position.y = -0.1;
  },
  run(c, t, u, a, m) {
    const ph = c.time * (6 + c.speed * 0.9), s = Math.sin(ph), k = Math.min(1.4, c.speed / 6);
    c.legL.rotation.x = s * 0.95 * k; c.legR.rotation.x = -s * 0.95 * k; c.kneeL.rotation.x = Math.max(0, -s) * 1.2 * k; c.kneeR.rotation.x = Math.max(0, s) * 1.2 * k;
    c.armL.rotation.x = -s * 0.9 * k; c.armR.rotation.x = s * 0.9 * k; c.elbowL.rotation.x = -0.9; c.elbowR.rotation.x = -0.9; c.torso.rotation.x = 0.16 * k; c.body.position.y = Math.abs(Math.cos(ph)) * 0.05;
    if (c.gear === 'bat') { c.armR.rotation.x = -0.6; c.batP.rotation.x = -0.4; c.batP.position.set(0.15, 0.95, 0.2); }
  },
  bowl(c, t, u, a) {
    const k = Math.min(1, t / a.dur), arm = -k * Math.PI * 2 + 0.3, lean = Math.sin(k * Math.PI);
    c.armR.rotation.x = arm; c.armL.rotation.x = -Math.PI * 0.75 * (1 - k) + 0.1 * k; c.torso.rotation.x = 0.55 * lean - 0.1; c.legL.rotation.x = -0.9 * lean; c.kneeL.rotation.x = 0.4 * lean;
    c.legR.rotation.x = 0.7 * lean; c.body.position.y = 0.12 * Math.sin(k * Math.PI * 0.8); c.torso.rotation.y = -0.4 * lean; c.elbowL.rotation.x = -0.3;
  },
  stance(c, t) {
    c.legL.rotation.x = -0.18; c.legR.rotation.x = 0.12; c.kneeL.rotation.x = 0.35; c.kneeR.rotation.x = 0.35; c.torso.rotation.x = 0.35; c.head.rotation.x = -0.3; c.head.rotation.y = 0.55;
    c.armL.rotation.x = -0.9; c.armR.rotation.x = -0.95; c.elbowL.rotation.x = -0.6; c.elbowR.rotation.x = -0.6; c.body.position.y = -0.08;
    c.batP.rotation.x = -0.15 + Math.sin(t * 2.2) * 0.04; c.batP.position.set(0.05, 0.85, 0.3); c.body.rotation.y = 0.5;
  },
  swing(c, t, u, a) {
    const kind = c.swingKind, aim = c.swingAim, K = { loft: [1.7, -1.5, -3.0], drive: [1.0, -1.2, -2.3], single: [0.3, -0.7, -0.9], defend: [0.1, -0.55, -0.55] }[kind] || [1, -1.2, -2.3];
    const ang = swingCurve(Math.min(1, u), K[0], K[1], K[2]), sw = Math.min(1, u), twist = (kind === 'defend' || kind === 'single' ? 0.15 : 0.9) * Math.sin(Math.min(1, sw * 1.4) * Math.PI * 0.5);
    c.body.position.y = -0.08; c.legL.rotation.x = -0.3 * sw; c.kneeL.rotation.x = 0.4 + 0.3 * sw; c.legR.rotation.x = 0.15; c.kneeR.rotation.x = 0.3;
    c.torso.rotation.x = 0.35; c.torso.rotation.y = twist * (0.6 + aim * 0.5); c.body.rotation.y = 0.5 - 0.7 * sw;
    c.batP.rotation.x = ang; c.batP.rotation.y = -aim * 0.5 * sw; c.batP.position.set(0.05, 0.9, 0.3);
    c.armL.rotation.x = ang * 0.55 - 0.3; c.armR.rotation.x = ang * 0.55 - 0.35; c.elbowL.rotation.x = -0.5; c.elbowR.rotation.x = -0.5; c.head.rotation.x = -0.3; c.head.rotation.y = 0.3;
  },
  catchBall(c, t) { c.armL.rotation.x = -2.6; c.armR.rotation.x = -2.6; c.legL.rotation.x = -0.2; c.kneeL.rotation.x = 0.3; c.torso.rotation.x = -0.1; c.head.rotation.x = -0.4; },
  keep(c, t) {
    c.body.position.y = -0.38; c.legL.rotation.x = -1.2; c.legR.rotation.x = -1.2; c.kneeL.rotation.x = 1.9; c.kneeR.rotation.x = 1.9; c.torso.rotation.x = 0.7; c.head.rotation.x = -0.6;
    c.armL.rotation.x = -1.2; c.armR.rotation.x = -1.2; c.elbowL.rotation.x = -0.4; c.elbowR.rotation.x = -0.4; c.legL.rotation.z = -0.15; c.legR.rotation.z = 0.15;
  },
  celebrate(c, t) {
    c.body.position.y = Math.abs(Math.sin(t * 7)) * 0.22; c.armL.rotation.x = -2.9 + Math.sin(t * 9) * 0.25; c.armR.rotation.x = -2.9 - Math.sin(t * 9) * 0.25; c.armL.rotation.z = 0.35; c.armR.rotation.z = -0.35; c.head.rotation.x = -0.25;
  },
  appeal(c, t) { c.armL.rotation.x = -2.9; c.armR.rotation.x = -2.9; c.armL.rotation.z = 0.3; c.armR.rotation.z = -0.3; c.torso.rotation.x = -0.15; c.head.rotation.x = -0.35; c.body.position.y = Math.abs(Math.sin(t * 8)) * 0.1; },
  dejected(c, t) { c.torso.rotation.x = 0.4; c.head.rotation.x = 0.5; c.armL.rotation.z = 0.1; c.armR.rotation.z = -0.1; c.body.position.y = -0.04; c.legL.rotation.x = 0.0; },
  signalOut(c, t) { c.armR.rotation.x = -3.1; c.elbowR.rotation.x = -0.05; c.head.rotation.y = 0.2; },
  signal4(c, t) { c.armR.rotation.x = -1.5; c.armR.rotation.z = Math.sin(t * 9) * 0.7 - 0.2; },
  signal6(c, t) { c.armR.rotation.x = -3.0; c.armL.rotation.x = -3.0; },
  notOut(c, t) { c.armL.rotation.x = -1.4; c.armR.rotation.x = -1.4; c.armL.rotation.z = 0.8; c.armR.rotation.z = -0.8; },
  throwBall(c, t, u) { const k = Math.min(1, u); c.armR.rotation.x = lerp(-2.8, 0.6, ease(k)); c.torso.rotation.x = lerp(-0.2, 0.5, k); c.legL.rotation.x = -0.5 * (1 - k); },
  pad(c, t, u) { c.body.position.y = Math.abs(Math.sin(u * 8)) * 0.06; c.torso.rotation.x = 0.3; c.legR.rotation.x = -0.3; c.armL.rotation.x = -0.4; c.armR.rotation.x = -0.4; c.head.rotation.x = 0.3; },
  collapse(c, t, u) {
    const k = ease(Math.min(1, u * 1.2)); c.body.position.set(0, 0.12 * k, 0); c.body.rotation.x = -1.5 * k; c.legL.rotation.x = -0.6 * k; c.kneeL.rotation.x = 0.8 * k; c.armL.rotation.x = -1.5 * k; c.armR.rotation.x = -1.2 * k; c.head.rotation.x = 0.4 * k;
    c.body.position.z = -0.4 * k;
  },
  walk(c, t) { POSES.run(c, t, 0, 0, true); },
};

function createUmpire() {
  const c = new Character({ look: { skin: 0xc89870, hair: 'short', hairC: 0x333333 }, id: 'ump', name: 'Umpire' }, 0xf6f6f6, { kind: 'umpire' });
  return c;
}

return { Character, createUmpire };
})();

/* ---- stadium ---- */
__M.stadium = (function(){
const { srgb, LI, FLOOD } = __M.compat;

const rr = (a, b) => a + Math.random() * (b - a);

function groundTexture() {
  const S = 2048, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  const m = v => (v + 76) / 152 * S; // world -> px
  for (let i = 0; i < 30; i++) { g.fillStyle = i % 2 ? '#3f8f3a' : '#4aa044'; g.fillRect(m(-76 + i * 5.07), 0, S / 30 + 1, S); }
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 3; g.setLineDash([14, 10]);
  g.beginPath(); g.arc(S / 2, S / 2, 27 / 152 * S, 0, 7); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#c9a56b'; g.fillRect(m(-1.55), m(-11.2), 3.1 / 152 * S, 22.4 / 152 * S);
  g.fillStyle = 'rgba(120,90,50,0.35)'; g.fillRect(m(-0.5), m(-6), 1 / 152 * S, 12 / 152 * S);
  g.strokeStyle = '#fff'; g.lineWidth = 3;
  const L = (x1, z1, x2, z2) => { g.beginPath(); g.moveTo(m(x1), m(z1)); g.lineTo(m(x2), m(z2)); g.stroke(); };
  for (const s of [-1, 1]) { L(-1.83, s * 8.84, 1.83, s * 8.84); L(-1.52, s * 10.06, 1.52, s * 10.06); L(-1.32, s * 10.06, -1.32, s * 8.84); L(1.32, s * 10.06, 1.32, s * 8.84); }
  const t = new THREE.CanvasTexture(c); srgb(t); t.anisotropy = 8; return t;
}
function adTexture() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 64; const g = c.getContext('2d');
  const ads = [['JHUNJHUNIYA PREMIER LEAGUE', '#c2185b'], ['LEGION WARRIORS', '#d32f2f'], ['MATRIX DEFENDERS', '#1e5bd8'], ['SIMP COLA', '#f9a825'], ['BAAL ENERGY', '#6a1b1b'], ['NPC MOBILES', '#00897b']];
  ads.forEach(([t, col], i) => { const w = 2048 / ads.length; g.fillStyle = col; g.fillRect(i * w, 0, w, 64); g.fillStyle = '#fff'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.fillText(t, i * w + w / 2, 42); });
  const t = new THREE.CanvasTexture(c); srgb(t); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return t;
}

function buildStadium(scene) {
  const grp = new THREE.Group(); scene.add(grp);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(76, 96), new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; grp.add(ground);
  const outer = new THREE.Mesh(new THREE.CircleGeometry(400, 32), new THREE.MeshStandardMaterial({ color: 0x28402a, roughness: 1 }));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.05; grp.add(outer);
  const rope = new THREE.Mesh(new THREE.TorusGeometry(70, 0.07, 6, 160), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  rope.rotation.x = Math.PI / 2; rope.position.y = 0.05; grp.add(rope);
  const hoard = new THREE.Mesh(new THREE.CylinderGeometry(72.6, 72.6, 1.1, 128, 1, true), new THREE.MeshStandardMaterial({ map: adTexture(), side: THREE.BackSide, emissive: 0x222222 }));
  hoard.position.y = 0.55; grp.add(hoard);

  // stands (stepped lathe)
  const pts = [new THREE.Vector2(73, 0)];
  const rows = 11;
  for (let k = 0; k < rows; k++) { const r = 73 + k * 2.6, y = 1.2 + k * 0.9; pts.push(new THREE.Vector2(r, y), new THREE.Vector2(r, y + 0.9), new THREE.Vector2(r + 2.6, y + 0.9)); }
  pts.push(new THREE.Vector2(101.6, 22), new THREE.Vector2(101.6, 0));
  const stands = new THREE.Mesh(new THREE.LatheGeometry(pts, 128), new THREE.MeshStandardMaterial({ color: 0x80858f, roughness: 0.9, side: THREE.DoubleSide }));
  stands.receiveShadow = true; grp.add(stands);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(101.6, 92, 1.2, 128, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a3f4b, side: THREE.DoubleSide, roughness: 0.6 }));
  roof.position.y = 22; grp.add(roof);

  // crowd (instanced)
  const per = [], bases = [];
  const body = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.75, 0.32), new THREE.MeshStandardMaterial({ roughness: 0.9 }), 6000);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.8 }), 6000);
  const dummy = new THREE.Object3D(), col = new THREE.Color(); let n = 0;
  const heads = [0xe0b08c, 0xc68a5a, 0x8d5a3a, 0xf0cfb0, 0xb98560];
  const shirts = [0xe53935, 0x2f7bff, 0xffffff, 0xf9a825, 0x43a047];
  for (let k = 0; k < rows && n < 5990; k++) {
    const r = 73 + k * 2.6 + 1.3, y = 1.2 + k * 0.9 + 0.9, cnt = Math.floor(2 * Math.PI * r / 1.12);
    for (let i = 0; i < cnt && n < 6000; i++) {
      if (Math.random() < 0.12) continue;
      const a = i / cnt * Math.PI * 2 + rr(-0.003, 0.003);
      dummy.position.set(Math.sin(a) * r, y + 0.38, Math.cos(a) * r); dummy.rotation.set(0, a + Math.PI, 0); dummy.updateMatrix();
      body.setMatrixAt(n, dummy.matrix); col.setHex(Math.random() < 0.42 ? shirts[0] : Math.random() < 0.72 ? shirts[1] : shirts[2 + Math.floor(Math.random() * 3)]); body.setColorAt(n, col);
      dummy.position.y = y + 0.95; dummy.updateMatrix(); head.setMatrixAt(n, dummy.matrix); col.setHex(heads[Math.floor(Math.random() * 5)]); head.setColorAt(n, col);
      per.push({ ph: Math.random() * 6.28, sp: rr(0.8, 1.3), ang: a }); bases.push(y); n++;
    }
  }
  body.count = head.count = n; body.instanceMatrix.setUsage(THREE.DynamicDrawUsage); head.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  body.frustumCulled = head.frustumCulled = false; grp.add(body, head);
  const crowd = {
    cheer: 0.1, target: 0.15, wave: -10, tt: 0,
    boost(l) { this.target = Math.max(this.target, l); },
    waveNow() { this.wave = 0; },
    update(dt) {
      this.tt += dt; this.target = Math.max(0.12, this.target - dt * 0.15); this.cheer += (this.target - this.cheer) * Math.min(1, dt * 2);
      if (this.wave >= 0) this.wave += dt * 2.2;
      const ba = body.instanceMatrix.array, ha = head.instanceMatrix.array, c = this.cheer, t = this.tt;
      for (let i = 0; i < n; i++) {
        const p = per[i]; let amp = 0.015 + c * 0.32, w = 0;
        if (this.wave >= 0) { let d = Math.abs(((p.ang - this.wave + 9.42) % 6.283) - 3.14); w = Math.max(0, 1 - d) * 0.45; }
        const bob = Math.abs(Math.sin(t * (4 + c * 5) * p.sp + p.ph)) * amp + w;
        ba[i * 16 + 13] = bases[i] + 0.38 + bob; ha[i * 16 + 13] = bases[i] + 0.95 + bob * 1.25;
      }
      body.instanceMatrix.needsUpdate = true; head.instanceMatrix.needsUpdate = true;
    },
  };

  // floodlight towers
  const lights = [], towerMat = new THREE.MeshStandardMaterial({ color: 0x555a66 }), panelMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xfff2cc, emissiveIntensity: 0 });
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, x = Math.sin(a) * 108, z = Math.cos(a) * 108;
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.4, 50, 8), towerMat); tw.position.set(x, 25, z); grp.add(tw);
    const pn = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 1), panelMat); pn.position.set(x, 52, z); pn.lookAt(0, 20, 0); grp.add(pn);
    const sp = new THREE.SpotLight(0xfff0d0, 0, 300, 0.6, 0.6, 1); sp.position.set(x * 0.95, 52, z * 0.95); sp.target.position.set(0, 0, 0); grp.add(sp, sp.target); lights.push(sp);
  }
  return { group: grp, crowd, floodlights: lights, panelMat };
}

// ---------------- sky / light / weather ----------------
const TIMES = {
  morning: { top: 0x4f8fd6, hor: 0xffe0b0, el: 30, az: -50, sun: 0xffe8c4, sunI: 2.3, hs: 0xbfd8ff, hg: 0x5d7a4a, hI: 0.9, stars: 0, flood: 0 },
  evening: { top: 0x27346a, hor: 0xff8f4d, el: 8, az: 70, sun: 0xff9250, sunI: 1.9, hs: 0x7a78b0, hg: 0x4a4030, hI: 0.75, stars: 0.12, flood: 0.35 },
  night: { top: 0x01030c, hor: 0x0c1838, el: 40, az: 25, sun: 0x9db6ff, sunI: 0.5, hs: 0x24366e, hg: 0x0d140d, hI: 0.45, stars: 1, flood: 1 },
};
const WEATH = {
  summer: { fog: 0.0015, grey: 0, sunMul: 1.15, clouds: 0.12, warm: 0xffe9bf, mist: 0 },
  cold: { fog: 0.0065, grey: 0.35, sunMul: 0.7, clouds: 0.5, warm: 0xc4d8ff, mist: 1 },
  cloudy: { fog: 0.0028, grey: 0.7, sunMul: 0.45, clouds: 1, warm: 0xe0e4ea, mist: 0 },
};

class Environment {
  constructor(scene) {
    this.scene = scene;
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: 'varying vec3 vP; uniform vec3 top; uniform vec3 hor; void main(){ float h = clamp(normalize(vP).y,0.0,1.0); gl_FragColor = vec4(mix(hor, top, pow(h,0.55)),1.0);} ',
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), this.skyMat); this.sky.renderOrder = -10; scene.add(this.sky);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 2); this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera; sc.left = -42; sc.right = 42; sc.top = 42; sc.bottom = -42; sc.near = 10; sc.far = 300; sc.updateProjectionMatrix(); this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.04;
    scene.add(this.sun, this.sun.target);
    this.disc = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })); scene.add(this.disc);
    const sp = new Float32Array(900); for (let i = 0; i < 300; i++) { const a = rr(0, 6.28), e = rr(0.05, 1.4), r = 480; sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, fog: false })); scene.add(this.stars);
    // clouds
    const cc = document.createElement('canvas'); cc.width = cc.height = 128; const g = cc.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    this.cloudTex = new THREE.CanvasTexture(cc); this.clouds = [];
    for (let i = 0; i < 46; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0 })); const a = rr(0, 6.28), d = rr(200, 420); m.position.set(Math.cos(a) * d, rr(110, 220), Math.sin(a) * d); m.scale.set(rr(120, 240), rr(40, 80), 1); m.userData.sp = rr(0.5, 2); scene.add(m); this.clouds.push(m); }
    // mist (cold)
    const mp = new Float32Array(300 * 3); for (let i = 0; i < 300; i++) { mp[i * 3] = rr(-90, 90); mp[i * 3 + 1] = rr(0.5, 5); mp[i * 3 + 2] = rr(-90, 90); }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    this.mist = new THREE.Points(mg, new THREE.PointsMaterial({ map: this.cloudTex, size: 26, transparent: true, opacity: 0, depthWrite: false, color: 0xdfe8f2 })); scene.add(this.mist);
    scene.fog = new THREE.FogExp2(0xffffff, 0.002); this.t = 0;
  }
  apply(time, weather, stadium) {
    const T = TIMES[time] || TIMES.evening, W = WEATH[weather] || WEATH.summer, grey = new THREE.Color(0x8a919b);
    const top = new THREE.Color(T.top).lerp(grey, W.grey * (time === 'night' ? 0.3 : 0.8)), hor = new THREE.Color(T.hor).lerp(grey, W.grey * (time === 'night' ? 0.3 : 0.7));
    if (time !== 'night') { top.lerp(new THREE.Color(W.warm), 0.15); }
    this.skyMat.uniforms.top.value.copy(top); this.skyMat.uniforms.hor.value.copy(hor);
    this.scene.fog.color.copy(hor).multiplyScalar(time === 'night' ? 0.8 : 0.95); this.scene.fog.density = W.fog * (time === 'night' ? 1.3 : 1);
    const el = T.el * Math.PI / 180, az = T.az * Math.PI / 180, d = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    this.sun.position.copy(d).multiplyScalar(120); this.sun.color.setHex(T.sun); this.sun.intensity = T.sunI * W.sunMul * LI;
    this.sun.target.position.set(0, 0, 0);
    this.disc.position.copy(d).multiplyScalar(450); this.disc.material.color.setHex(time === 'night' ? 0xe8eeff : time === 'evening' ? 0xffb070 : 0xfff4d0); this.disc.scale.setScalar(time === 'night' ? 0.8 : 1.1); this.disc.visible = weather !== 'cloudy' || time === 'evening';
    this.hemi.color.setHex(T.hs); this.hemi.groundColor.setHex(T.hg); this.hemi.intensity = T.hI * (weather === 'cloudy' ? 1.25 : 1) * LI;
    this.stars.material.opacity = T.stars * (weather === 'cloudy' ? 0.2 : 1); this.stars.visible = T.stars > 0;
    this.clouds.forEach((c, i) => { c.material.opacity = (i / this.clouds.length < W.clouds ? 1 : 0) * (time === 'night' ? 0.2 : time === 'evening' ? 0.55 : 0.8) * (weather === 'cloudy' ? 1 : 0.7); c.material.color.copy(time === 'evening' ? new THREE.Color(0xffc7a0) : time === 'night' ? new THREE.Color(0x2a3350) : new THREE.Color(weather === 'cloudy' ? 0xb9bec7 : 0xffffff)); });
    this.mist.material.opacity = W.mist * (time === 'night' ? 0.25 : 0.32);
    if (stadium) { stadium.floodlights.forEach(l => { l.intensity = T.flood * FLOOD; }); stadium.panelMat.emissiveIntensity = T.flood * 2.2; }
    this.timeKey = time; this.weatherKey = weather;
  }
  update(dt, camPos) {
    this.t += dt; this.sky.position.copy(camPos); this.stars.position.copy(camPos);
    this.clouds.forEach(c => { c.position.x += c.userData.sp * dt; if (c.position.x > 450) c.position.x = -450; });
    if (this.mist.material.opacity > 0) this.mist.position.x = Math.sin(this.t * 0.05) * 6;
  }
}

return { buildStadium, Environment };
})();

/* ---- world ---- */
__M.world = (function(){
const { Character, createUmpire } = __M.characters;
const { buildStadium, Environment } = __M.stadium;
const { Flight, BALL_R, STUMP_Z } = __M.physics;
const { WEATHER_FX, TEAMS } = __M.data;
const { srgb, REV } = __M.compat;

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const HOME = { strike: { x: 0.35, z: 9.15 }, nonStrike: { x: 1.3, z: -9.7 }, keeper: { x: -0.55, z: 12.6 }, umpire: { x: -0.9, z: -12.4 } };

class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches; this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
    const q = typeof location !== 'undefined' ? (location.search || '') : '', lq = /lq=1/.test(q) || (coarse && !/hq=1/.test(q)); this.renderer.shadowMap.enabled = !lq; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (REV < 152) this.renderer.outputEncoding = THREE.sRGBEncoding; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1200); this.camPos = V3(0, 25, 90); this.camLook = V3(0, 3, 0);
    this.stadium = buildStadium(this.scene); this.crowd = this.stadium.crowd;
    this.env = new Environment(this.scene); if (lq) this.env.sun.castShadow = false; this.fx = { ...WEATHER_FX.summer };
    this.chars = {}; this.active = new Set(); this.umpire = createUmpire(); this.scene.add(this.umpire.root); this.umpire.place(HOME.umpire.x, HOME.umpire.z, 0);
    this._buildStumps(); this._buildBall();
    this.speed = 1; this.slow = 1; this.clock = 0; this.timers = []; this.debris = [];
    this.camMode = 'orbit'; this.camPref = 'classic'; this.orbitA = 0; this.fdir = V3(0, 0, -1); this.shakeAmt = 0; this.fovT = 50; this.lastBall = V3();
    this.hawk = null; this.timeKey = 'evening'; this.weatherKey = 'summer';
    this.resize(); addEventListener('resize', () => this.resize()); addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
  }
  resize() { const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }

  setEnvironment(time, weather) {
    this.timeKey = time; this.weatherKey = weather; this.fx = { ...WEATHER_FX[weather] };
    this.env.apply(time, weather, this.stadium);
    this.renderer.toneMappingExposure = time === 'night' ? 1.25 : 1.05;
  }

  // ---------- characters ----------
  prepare(teams) {
    for (const k of ['A', 'B']) for (const p of teams[k]) {
      if (this.chars[p.id]) { this.scene.remove(this.chars[p.id].root); }
      const c = new Character(p, TEAMS[k].color); c.root.visible = false; this.scene.add(c.root); this.chars[p.id] = c;
    }
  }
  hideAll() { Object.values(this.chars).forEach(c => { c.root.visible = false; c.target = null; c.watch = null; }); this.active.clear(); this.active.add(this.umpire); }
  show(p, gear, x, z, facing, anim = 'idle') { const c = this.chars[p.id]; c.root.visible = true; c.setGear(gear); c.place(x, z, facing); c.play(anim); c.watch = null; this.active.add(c); return c; }
  ch(p) { return this.chars[p.id]; }

  // ---------- stumps & ball ----------
  _buildStumps() {
    this.stumps = {};
    for (const [end, z] of [['bat', STUMP_Z], ['bowl', -STUMP_Z]]) {
      const g = new THREE.Group(); g.position.set(0, 0, z); this.scene.add(g);
      const items = [], mat = new THREE.MeshStandardMaterial({ color: 0xf1e3b8, roughness: 0.5 });
      for (let i = -1; i <= 1; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.71, 8), mat); m.position.set(i * 0.1143 / 1, 0.355, 0); m.castShadow = true; g.add(m); items.push({ m, home: m.position.clone() }); }
      for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 6), new THREE.MeshStandardMaterial({ color: 0xd9433a })); m.rotation.z = Math.PI / 2; m.position.set(i * 0.1143 - 0.057, 0.72, 0); g.add(m); items.push({ m, home: m.position.clone(), rot: m.rotation.clone(), bail: true }); }
      this.stumps[end] = { g, items, hit: false };
    }
  }
  resetStumps() {
    for (const s of Object.values(this.stumps)) { s.hit = false; s.items.forEach(it => { it.m.position.copy(it.home); it.m.rotation.set(0, 0, it.bail ? Math.PI / 2 : 0); it.v = null; }); }
  }
  hitStumps(end = 'bat') {
    const s = this.stumps[end]; s.hit = true;
    s.items.forEach(it => { it.v = V3((Math.random() - 0.5) * 2, it.bail ? 2.5 + Math.random() * 2 : 0.5 + Math.random(), (end === 'bat' ? 1 : -1) * (1.5 + Math.random() * 2.5)); it.w = V3(Math.random() * 6, Math.random() * 3, Math.random() * 6); });
  }
  _buildBall() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#c8102e'; g.fillRect(0, 0, 64, 32); g.strokeStyle = '#f4efe0'; g.lineWidth = 2; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(0, 16); g.lineTo(64, 16); g.stroke();
    const t = srgb(new THREE.CanvasTexture(c));
    this.ballMesh = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 14, 10), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4, emissive: 0x330000 })); this.ballMesh.castShadow = true; this.ballMesh.scale.setScalar(1.7); this.scene.add(this.ballMesh);
    this.trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 24 }, () => V3())), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); this.scene.add(this.trail); this.trailPts = []; this.trail.visible = false;
    this.ball = { mode: 'none', t: 0, del: null, flight: null, holder: null, tween: null, checkStumps: false, keeperCatch: false, stumpHit: false, keeper: null };
    this.ballMesh.visible = false;
  }
  ballPos() { return this.ballMesh.position; }
  releaseDelivery(del) { Object.assign(this.ball, { mode: 'path', t: 0, del, flight: null, holder: null, checkStumps: false, keeperCatch: false, stumpHit: false }); this.ballMesh.visible = true; this.ballMesh.position.copy(del.pos(0)); this.trailPts = []; }
  launch(pos, vel, opts = {}) {
    Object.assign(this.ball, { mode: 'flight', flight: new Flight(pos, vel, this.fx), holder: null, checkStumps: !!opts.checkStumps, keeperCatch: !!opts.keeperCatch });
    if (opts.nodrag) this.ball.flight.drag = 0; this.ballMesh.visible = true; this.trail.visible = !!opts.trail;
  }
  continueDelivery(opts = {}) { const b = this.ball, p = b.del.pos(b.del.total), v = b.del.velAt(b.del.total); this.launch(p, v, opts); }
  hold(char) { Object.assign(this.ball, { mode: 'held', holder: char, flight: null }); this.trail.visible = false; }
  holdAt(p) { Object.assign(this.ball, { mode: 'static', holder: null, flight: null }); this.ballMesh.position.copy(p); }
  tweenBall(to, dur, arc = 1.5) { const b = this.ball; b.tween = { from: this.ballMesh.position.clone(), to: to.clone(), t: 0, dur, arc }; b.mode = 'tween'; b.flight = null; }
  hideBall() { this.ball.mode = 'none'; this.ballMesh.visible = false; this.trail.visible = false; }

  // ---------- timers (sim time) ----------
  wait(sec) { return new Promise(res => this.timers.push({ at: this.clock + sec, res })); }
  waitUntil(fn, max = 20) { return new Promise(res => this.timers.push({ fn, at: this.clock + max, res })); }

  // ---------- camera ----------
  setCam(mode, snap = false) { this.camMode = mode; if (snap) this._snap = true; }
  shake(a) { this.shakeAmt = Math.max(this.shakeAmt, a); }
  _camTarget(dt) {
    const m = this.camMode, B = this.ballMesh.position, bat = HOME.strike; let pos = V3(), look = V3(), fov = 50, k = 3;
    const striker = this.striker, bowler = this.bowlerChar;
    switch (m) {
      case 'orbit': this.orbitA += dt * 0.07; pos.set(Math.sin(this.orbitA) * 112, 34, Math.cos(this.orbitA) * 112); look.set(0, 4, 0); fov = 50; k = 4; break;
      case 'toss': pos.set(3.2, 2.0, 5); look.set(0, 1.3, 0); fov = 45; k = 3; break;
      case 'side': pos.set(19, 5, bowler ? bowler.root.position.z * 0.4 : -3); look.set(0, 1.4, bowler ? bowler.root.position.z * 0.4 : -3); fov = 50; k = 3; break;
      case 'bat': {
        if (this.camPref === 'tv') { pos.set(0.4, 4.2, -19); look.set(0, 1.0, 8); fov = 40; }
        else if (this.camPref === 'high') { pos.set(0, 9, 20); look.set(0, 0.5, -4); fov = 52; }
        else { pos.set(1.0, 2.7, 15.6); look.set(0.2, 1.1, -4); fov = 46; }
        k = 2.4; break;
      }
      case 'bowler': pos.set(0.5, 3.2, Math.min(-14, (bowler ? bowler.root.position.z : -22) - 6)); look.set(0, 1.0, 9); fov = 46; k = 2.5; break;
      case 'follow': {
        const f = this.ball.flight; if (f) { const h = V3(f.vel.x, 0, f.vel.z); if (h.lengthSq() > 4) { h.normalize(); this.fdir.lerp(h, Math.min(1, dt * 3)); } }
        const d = this.fdir.clone().normalize();
        pos.copy(B).addScaledVector(d, -11); pos.y = Math.max(2.4, B.y * 0.5 + 3); look.copy(B).addScaledVector(d, 5); look.y = Math.max(0.8, B.y * 0.7); fov = 56; k = 4; break;
      }
      case 'wide': pos.set(0, 14, 36); look.set(0, 0.5, -22); fov = 58; k = 1.6; break;
      case 'hawk': pos.set(3.4, 1.5, 16.5); look.set(0, 0.6, 4.5); fov = 40; k = 2.2; break;
      case 'celebrate': { const c = striker; const p = c ? c.root.position : V3(0, 0, 9); pos.set(p.x + 2.6, 1.7, p.z + 3.6); look.set(p.x, 1.4, p.z); fov = 42; k = 2.5; break; }
      case 'wicket': pos.set(-3.2, 1.8, -4); look.set(0, 0.8, 9.6); fov = 44; k = 3; break;
      case 'fielder': { const c = this.focus; const p = c ? c.root.position : V3(); pos.set(p.x * 0.8 + 3, 2.6, p.z * 0.8 + 6); look.set(p.x, 1.2, p.z); fov = 48; k = 3; break; }
      default: pos.set(0, 10, 40); look.set(0, 1, 0);
    }
    // keep camera inside the bowl
    const r = Math.hypot(pos.x, pos.z); if (r > 98 && m !== 'orbit') { pos.x *= 98 / r; pos.z *= 98 / r; } if (pos.y < 0.8) pos.y = 0.8;
    return { pos, look, fov, k };
  }
  _updateCamera(dt) {
    const t = this._camTarget(dt), a = this._snap ? 1 : 1 - Math.exp(-dt * t.k); this._snap = false;
    this.camPos.lerp(t.pos, a); this.camLook.lerp(t.look, Math.min(1, a * 1.4)); this.fovT = t.fov;
    this.camera.position.copy(this.camPos);
    if (this.shakeAmt > 0.001) { this.camera.position.x += (Math.random() - 0.5) * this.shakeAmt; this.camera.position.y += (Math.random() - 0.5) * this.shakeAmt; this.shakeAmt *= Math.exp(-dt * 6); }
    this.camera.lookAt(this.camLook);
    const asp = this.camera.aspect || 1.7, goal = asp < 1.3 ? Math.min(88, this.fovT * Math.pow(1.3 / asp, 0.7)) : this.fovT;   // wider vertical FOV on portrait phones
    if (Math.abs(this.camera.fov - goal) > 0.05) { this.camera.fov += (goal - this.camera.fov) * Math.min(1, dt * 3); this.camera.updateProjectionMatrix(); }
  }

  // ---------- Hawk-Eye ----------
  showHawk(del, spec) {
    this.clearHawk(); const g = new THREE.Group(), pts = []; for (let i = 0; i <= 40; i++) pts.push(del.pos(del.total * i / 40));
    const mk = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o });
    const path = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.025, 6), mk(0xffd400)); g.add(path);
    const end = pts[pts.length - 1], proj = [end.clone(), V3(spec.projX, spec.projY, STUMP_Z)];
    const pr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(proj), 8, 0.02, 6), mk(0xff8a00, 0.9)); g.add(pr);
    const pitchOK = spec.pitching === 'IN LINE', impOK = spec.impact === 'IN LINE';
    const pitch = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 20), mk(pitchOK ? 0x20d060 : 0xff3030)); pitch.position.set(del.B.x, 0.03, del.B.z);
    const imp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), mk(impOK ? 0x20d060 : 0xff3030)); imp.position.copy(end);
    const hitCol = spec.wickets === 'HITTING' ? 0x20d060 : spec.wickets === 'MISSING' ? 0xff3030 : 0xffa500;
    const wk = new THREE.Mesh(new THREE.BoxGeometry(0.2286, 0.711, 0.04), mk(hitCol, 0.4)); wk.position.set(0, 0.355, STUMP_Z);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), mk(hitCol)); hit.position.set(spec.projX, spec.projY, STUMP_Z);
    g.add(pitch, imp, wk, hit); this.scene.add(g); this.hawk = { g, path, pr, pitch, imp, wk, hit };
    [pr, pitch, imp, wk, hit].forEach(o => { o.visible = false; });
    return this.hawk;
  }
  clearHawk() { if (this.hawk) { this.scene.remove(this.hawk.g); this.hawk = null; } }

  // ---------- running between the wickets ----------
  async runBatters(a, b, n, runTime) {
    for (let i = 0; i < n; i++) {
      const ha = { x: a.root.position.x, z: a.root.position.z }, hb = { x: b.root.position.x, z: b.root.position.z };
      a.setGear('bat'); b.setGear('bat'); a.play('idle'); b.play('idle');
      const dz = Math.abs(ha.z - hb.z), sp = Math.max(4, dz / runTime);
      a.moveTo(hb.x - 0.3, hb.z + (hb.z > 0 ? -0.3 : 0.3), sp); b.moveTo(ha.x + 0.3, ha.z + (ha.z > 0 ? -0.3 : 0.3), sp);
      await this.waitUntil(() => !a.moving && !b.moving, 6);
    }
  }

  // ---------- main update ----------
  update(realDt) {
    const dt = realDt * this.speed * this.slow; this.clock += dt;
    this.crowd.update(realDt); this.env.update(realDt, this.camPos);
    for (const c of this.active) {
      if (c.watch && !c.moving) c.faceTo(c.watch.x, c.watch.z);
      c.update(dt);
    }
    this._updateBall(dt); this._updateDebris(dt);
    this._updateCamera(realDt);
    // timers
    if (this.timers.length) {
      const keep = [];
      for (const t of this.timers) { if ((t.fn && t.fn()) || this.clock >= t.at) t.res(true); else keep.push(t); }
      this.timers = keep;
    }
    this.renderer.render(this.scene, this.camera);
  }
  _updateBall(dt) {
    const b = this.ball, m = this.ballMesh;
    if (b.mode === 'path') { b.t = Math.min(b.del.total + 0.0001, b.t + dt); b.del.pos(b.t, m.position); }
    else if (b.mode === 'flight') {
      const f = b.flight, pz = f.pos.z; f.step(dt); m.position.copy(f.pos); m.rotation.x += dt * 20;
      if (b.checkStumps && pz < STUMP_Z && f.pos.z >= STUMP_Z - 0.02) {
        if (Math.abs(f.pos.x) < 0.17 && f.pos.y < 0.78) { this.hitStumps('bat'); b.stumpHit = true; f.vel.multiplyScalar(0.3); f.vel.z = Math.abs(f.vel.z); }
        b.checkStumps = false;
      }
      if (b.keeperCatch && f.pos.z > 12.2 && b.keeper) { this.hold(b.keeper); b.keeper.play('catchBall', { once: true, dur: 0.6, loc: false }); b.keeperCatch = false; }
      if (this.trail.visible) { this.trailPts.push(f.pos.clone()); if (this.trailPts.length > 24) this.trailPts.shift(); const arr = this.trail.geometry.attributes.position; for (let i = 0; i < 24; i++) { const p = this.trailPts[Math.min(i, this.trailPts.length - 1)] || f.pos; arr.setXYZ(i, p.x, p.y, p.z); } arr.needsUpdate = true; }
    } else if (b.mode === 'held' && b.holder) { b.holder.worldHand(m.position); m.position.y += 0.05; }
    else if (b.mode === 'tween') {
      const tw = b.tween; tw.t += dt / tw.dur; const u = Math.min(1, tw.t);
      m.position.lerpVectors(tw.from, tw.to, u); m.position.y += Math.sin(u * Math.PI) * tw.arc; if (u >= 1) { b.mode = 'static'; b.tweenDone = true; }
    }
  }
  _updateDebris(dt) {
    for (const s of Object.values(this.stumps)) {
      if (!s.hit) continue;
      s.items.forEach(it => { if (!it.v) return; it.v.y -= 9.81 * dt; it.m.position.addScaledVector(it.v, dt); it.m.rotation.x += it.w.x * dt; it.m.rotation.z += it.w.z * dt; if (it.m.position.y < 0.02) { it.m.position.y = 0.02; it.v.multiplyScalar(0.4); it.v.y = Math.abs(it.v.y) * 0.3; it.w.multiplyScalar(0.6); } });
    }
  }
}

return { HOME, World };
})();

/* ---- ui ---- */
__M.ui = (function(){
const { TEAMS } = __M.data;
const { zoneKey, zoneLevel, ZONE_NAMES, BAT } = __M.ai;

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));

class UI {
  constructor(audio) {
    this.au = audio; this.radar = $('radar').getContext('2d'); this.aim = 0; this.sel = { overs: 10, time: 'evening', weather: 'summer', voice: 'off' };
    this.layout(); addEventListener('resize', () => this.layout()); addEventListener('orientationchange', () => setTimeout(() => this.layout(), 200));
    this._tm = {};
  }
  // ---------- menu ----------
  initMenu(onChange, onStart) {
    const seg = (id, key, num) => {
      $(id).querySelectorAll('button').forEach(b => b.onclick = () => {
        $(id).querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on');
        this.sel[key] = num ? +b.dataset.v : b.dataset.v; this.au.unlock(); this.au.play('click'); onChange(this.sel);
      });
    };
    seg('segOvers', 'overs', true); seg('segTime', 'time'); seg('segWeather', 'weather'); seg('segVoice', 'voice');
    $('btnStart').onclick = () => { this.au.unlock(); this.au.lang = this.sel.voice; this.au.startMusic(); this.syncSound(); onStart({ ...this.sel, name: ($('inName').value || '').trim() || 'New Player' }); };
  }
  show(id, on = true) { $(id).classList.toggle('hidden', !on); }
  syncSound() {
    $('btnSound').textContent = this.au.sfx ? '🔊' : '🔇'; $('btnMusic').textContent = this.au.music ? '🎵' : '🎵✕';
    $('btnVoice').textContent = '🗣️ ' + { off: 'off', en: 'EN', hi: 'हिं' }[this.au.lang];
  }
  layout() {
    try {
      const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches, b = document.body;
      b.classList.toggle('compact', coarse || innerWidth < 900 || innerHeight < 520); b.classList.toggle('portrait', innerHeight > innerWidth); b.classList.toggle('touch', coarse);
    } catch (e) { /* ignore */ }
  }
  bindTop(h) {
    $('btnSpeed').onclick = h.speed; $('btnCam').onclick = h.cam;
    $('btnSound').onclick = () => { this.au.sfx = !this.au.sfx; this.au.setVolume(this.au.sfx ? 0.8 : 0); this.syncSound(); };
    $('btnVoice').onclick = () => { this.au.lang = { off: 'en', en: 'hi', hi: 'off' }[this.au.lang]; if (this.au.lang === 'off' && window.speechSynthesis) speechSynthesis.cancel(); this.syncSound(); this.toast({ off: 'Commentary off', en: 'Commentary: English', hi: 'कमेंट्री: हिन्दी' }[this.au.lang]); };
    $('btnMusic').onclick = () => { this.au.setMusic(!this.au.music); this.syncSound(); };
    $('btnFull').onclick = () => {
      const d = document, e = d.documentElement;
      if (!(d.fullscreenElement || d.webkitFullscreenElement)) { (e.requestFullscreen || e.webkitRequestFullscreen || (() => {})).call(e); try { screen.orientation.lock('landscape').catch(() => {}); } catch (x) { /* ignore */ } }
      else (d.exitFullscreen || d.webkitExitFullscreen || (() => {})).call(d);
    };
    $('btnRot').onclick = () => document.body.classList.add('norot');
    document.querySelectorAll('#controls [data-shot]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); h.shot(b.dataset.shot); }));
    $('aim').oninput = e => h.aim(+e.target.value / 100);
    $('reviewBtn').onclick = h.review;
  }
  setSpeedLabel(t) { $('btnSpeed').textContent = t; }
  setAimSlider(v) { $('aim').value = Math.round(v * 100); }

  // ---------- toss ----------
  async toss(userName, winnerPick) {
    this.show('toss'); const msg = $('tossMsg'), coin = $('coin'), btns = $('tossBtns');
    coin.className = ''; msg.textContent = `${userName}, Captain Goldclad is up for the toss. Call it!`; btns.style.display = 'flex';
    const call = await new Promise(res => btns.querySelectorAll('button').forEach(b => b.onclick = () => res(b.dataset.call)));
    btns.style.display = 'none'; const heads = Math.random() < 0.5; this.au.play('toss');
    coin.style.setProperty('--end', heads ? '1800deg' : '1980deg'); void coin.offsetWidth; coin.className = 'flip';
    msg.textContent = 'Coin in the air…'; await sleep(2200);
    const won = (call === 'heads') === heads; msg.textContent = `It's ${heads ? 'HEADS' : 'TAILS'}! ` + (won ? 'Legion Warriors win the toss.' : 'Matrix Defenders win the toss.');
    await sleep(1200); let dec;
    if (won) {
      msg.textContent = 'Captain Goldclad: what do we do?'; btns.innerHTML = '<button class="big" data-d="bat">BAT FIRST</button><button class="big" data-d="bowl">BOWL FIRST</button>'; btns.style.display = 'flex';
      dec = await new Promise(res => btns.querySelectorAll('button').forEach(b => b.onclick = () => res(b.dataset.d)));
      btns.style.display = 'none';
    } else { dec = Math.random() < 0.5 ? 'bat' : 'bowl'; msg.textContent = `Matrix Defenders elect to ${dec} first.`; await sleep(1800); }
    this.show('toss', false); btns.innerHTML = '<button class="big" data-call="heads">HEADS</button><button class="big" data-call="tails">TAILS</button>';
    return { winner: won ? 'A' : 'B', decision: dec };
  }

  // ---------- HUD ----------
  showHud(on) { this.show('hud', on); }
  score(inn, teams, overs, userBat) {
    const T = TEAMS[inn.bat]; $('sbTeam').textContent = T.name.toUpperCase(); $('scoreboard').style.borderLeftColor = T.css;
    $('sbRuns').textContent = inn.runs; $('sbWkts').textContent = inn.wkts;
    $('sbOvers').textContent = `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`; $('sbInfo').textContent = 'CRR ' + (inn.balls ? (inn.runs * 6 / inn.balls).toFixed(2) : '0.00') + ` · of ${overs}`;
    if (inn.target) { const need = inn.target - inn.runs, left = overs * 6 - inn.balls; $('sbTarget').textContent = `Need ${Math.max(0, need)} from ${left} balls · RRR ${left > 0 ? (Math.max(0, need) * 6 / left).toFixed(2) : '-'}`; }
    else $('sbTarget').textContent = '';
  }
  batters(inn) {
    const row = (c, on) => c ? `<div class="${on ? 'on' : ''}"><span>${esc(c.p.name)}${on ? ' *' : ''}</span><span>${c.runs} (${c.balls})</span></div>` : '';
    $('batcard').innerHTML = row(inn.striker, true) + row(inn.nonStriker, false);
  }
  bowler(b, st) {
    if (!b) return; const stars = b.bowl.stars ? '★'.repeat(b.bowl.stars) : 'unrated';
    $('bowlcard').innerHTML = `<div><span>${esc(b.name)}</span><span class="stars">${stars}</span></div><div><span>${b.bowl.type}${b.bowl.hand === 'L' ? ' (left)' : ''}</span><span>${st ? `${Math.floor(st.balls / 6)}.${st.balls % 6}-${st.runs}-${st.wkts}` : ''}</span></div>`;
  }
  thisOver(list) { $('thisover').innerHTML = list.map(x => { const c = x === 'W' ? 'w' : x === 4 ? 'f' : x === 6 ? 's' : 'r'; return `<div class="bd ${c}">${x === 0 ? '•' : x}</div>`; }).join(''); }
  reviews(r, userKey) { $('revA').textContent = `${TEAMS.A.short} reviews: ${r.A}`; $('revB').textContent = `${TEAMS.B.short} reviews: ${r.B}`; }
  controlsVisible(on) { $('controls').classList.toggle('hidden', !on); $('radarWrap').classList.toggle('hidden', !on); }
  partner(on) { $('partner').classList.toggle('hidden', !on); }
  say(text, speak = true) { $('capText').textContent = text; if (speak) { this.au.speak(text); } }
  comment(text) { const c = $('commentary'); c.textContent = text; c.classList.add('show'); clearTimeout(this._tm.c); this._tm.c = setTimeout(() => c.classList.remove('show'), 3500); }
  toast(text) { const t = $('toast'); t.textContent = text; t.classList.add('show'); clearTimeout(this._tm.t); this._tm.t = setTimeout(() => t.classList.remove('show'), 2400); }
  banner(text, color = '#fff', sub = '') { const b = $('banner'); b.innerHTML = esc(text) + (sub ? `<small>${esc(sub)}</small>` : ''); b.style.color = color; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
  risk(stars) {
    const r = $('riskTag'); r.className = ''; if (stars === null) return;
    const m = { 3: ['r3', '3★ BOWLER — DEFEND ONLY'], 2: ['r2', '2★ — RISKY! BIG SHOT = 50/50'], 0: ['r0', 'UNRATED — HIT FREELY'] }[stars];
    if (m) { r.classList.add('show', m[0]); r.textContent = m[1]; }
  }
  timing(on, frac = 0) { const t = $('timing'); t.classList.toggle('show', on); $('timingBar').style.width = (frac * 100) + '%'; }
  reviewButton(on, left) { $('reviewBtn').classList.toggle('hidden', !on); $('reviewLeft').textContent = left !== undefined ? `(${left} left)` : ''; }

  // ---------- radar ----------
  drawRadar(counts, positions, aimDeg, userBat) {
    const g = this.radar, W = 230, cx = 115, cy = 118, R = 102, s = R / 74; g.clearRect(0, 0, W, W);
    g.fillStyle = 'rgba(30,90,40,.55)'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    for (let k = -3; k <= 4; k++) {
      const lvl = zoneLevel(counts[k] || 0), col = { red: '255,60,60', amber: '255,190,40', green: '60,230,120' }[lvl];
      const a0 = (-90 + 45 * k - 22.5) * Math.PI / 180, a1 = (-90 + 45 * k + 22.5) * Math.PI / 180;
      g.fillStyle = `rgba(${col},${lvl === 'red' ? 0.45 : 0.22})`; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke();
    }
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(cx - 2, cy - 9, 4, 18);
    for (const f of positions) { g.fillStyle = '#ffd54f'; g.beginPath(); g.arc(cx + (f.x - BAT.x) * s, cy + (f.z - BAT.z) * s, 4, 0, 7); g.fill(); g.strokeStyle = '#000'; g.stroke(); }
    if (userBat) {
      const a = (-90 + aimDeg) * Math.PI / 180; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); g.lineWidth = 1;
      const k = zoneKey(aimDeg), n = counts[k] || 0, lvl = zoneLevel(n), t = $('radarTxt');
      t.className = lvl === 'red' ? 'bad' : lvl === 'green' ? 'good' : ''; t.textContent = lvl === 'red' ? `UNSAFE: ${ZONE_NAMES[k]} crowded` : lvl === 'amber' ? `CAREFUL: ${ZONE_NAMES[k]}` : `SAFE: ${ZONE_NAMES[k]}`;
      return lvl;
    }
    $('radarTxt').className = ''; $('radarTxt').textContent = 'FIELD ADVISOR'; return 'green';
  }

  // ---------- decision / hawk ----------
  async decision(kind, sub = '', kicker = 'THIRD UMPIRE', ms = 2200) {
    const d = $('decision'); $('dKick').textContent = kicker; const m = $('dMain'); m.textContent = kind === 'out' ? 'OUT' : 'NOT OUT'; m.className = 'd-main ' + (kind === 'out' ? 'out' : 'not'); $('dSub').textContent = sub;
    d.classList.remove('hidden'); this.au.play(kind === 'out' ? 'out' : 'notout'); await sleep(ms); d.classList.add('hidden');
  }
  hawk(on) { $('hawk').classList.toggle('hidden', !on); if (on) ['hkP', 'hkI', 'hkW', 'hkO'].forEach(i => { $(i).textContent = '—'; $(i).className = ''; }); }
  hawkSet(id, text, cls) { const e = $(id); e.textContent = text; e.className = cls || ''; }

  // ---------- user bowling ----------
  pickBowlType() {
    this.show('bowlPick'); return new Promise(res => $('bowlTypes').querySelectorAll('button').forEach(b => b.onclick = () => { this.show('bowlPick', false); this.au.play('click'); res(b.dataset.type); }));
  }
  aimGame(skipKey) {
    const box = $('aimGame'), mk = $('aimMarker'); box.classList.remove('hidden'); let stage = 0, v = 0.5, dir = 1, last = performance.now(), out = [], speed = 1.5, raf, done;
    const titles = ['Click / SPACE to lock your LINE', 'Now lock your LENGTH'], hints = ['Centre = off-stump line', 'Centre = good length · far right = yorker'];
    const set = () => { $('aimTitle').textContent = titles[stage]; $('aimHint').textContent = hints[stage]; }; set();
    const tick = now => { const dt = (now - last) / 1000; last = now; v += dir * speed * dt; if (v > 1) { v = 1; dir = -1; } if (v < 0) { v = 0; dir = 1; } mk.style.left = (v * 100) + '%'; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const lock = () => { out.push(v); stage++; speed += 0.5; if (stage >= 2) { cancelAnimationFrame(raf); box.classList.add('hidden'); removeEventListener('keydown', key); box.onclick = null; done(out); } else set(); };
    const key = e => { if (e.code === 'Space') { e.preventDefault(); lock(); } };
    addEventListener('keydown', key); box.onclick = lock; return new Promise(r => { done = r; });
  }

  // ---------- dashboard ----------
  dash(html, buttons) {
    $('dashBody').innerHTML = html; this.show('dash'); const bs = document.createElement('div'); bs.className = 'btns';
    $('dashBody').appendChild(bs);
    return new Promise(res => buttons.forEach(([label, val]) => { const b = document.createElement('button'); b.textContent = label; b.className = 'big'; b.onclick = () => { this.show('dash', false); res(val); }; bs.appendChild(b); }));
  }
  drawOvers(id, perOver, color) {
    const c = $(id); if (!c) return; const g = c.getContext('2d'), W = c.width = c.clientWidth * 2, H = c.height = 300; g.clearRect(0, 0, W, H);
    const mx = Math.max(10, ...perOver.map(o => o.runs)), bw = W / Math.max(10, perOver.length); g.font = '22px sans-serif'; g.textAlign = 'center';
    perOver.forEach((o, i) => { const h = (o.runs / mx) * (H - 50); g.fillStyle = color; g.fillRect(i * bw + 6, H - 24 - h, bw - 12, h); g.fillStyle = '#fff'; g.fillText(o.runs, i * bw + bw / 2, H - 28 - h); g.fillStyle = '#a9b4d6'; g.fillText(i + 1, i * bw + bw / 2, H - 4); if (o.w) { g.fillStyle = '#ff5252'; for (let k = 0; k < o.w; k++) { g.beginPath(); g.arc(i * bw + bw / 2, H - 40 - h - 24 - k * 16, 6, 0, 7); g.fill(); } } });
  }
}

return { sleep, UI };
})();

/* ---- game ---- */
__M.game = (function(){
const { CONFIG, TEAMS, buildTeams } = __M.data;
const { makePlan, setField, zoneCounts, zoneKey, ZONE_NAMES, zoneLevel, pick } = __M.ai;
const { HOME } = __M.world;
const { sleep } = __M.ui;
const { pickLine, ZONE_HI } = __M.lines;

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

class Game {
  constructor(world, ui, audio) {
    this.w = world; this.ui = ui; this.au = audio; this.speedSel = 2; this.aim = 0; this.press = null; this.canSwing = false; this.keys = new Set();
    this.reviews = { A: CONFIG.reviewsPerTeam, B: CONFIG.reviewsPerTeam }; this.counts = {}; this.field = { pos: [] }; this.userBat = false; this.canAim = false;
    this.cams = ['classic', 'tv', 'high']; this.running = false; this.log = [];
    this._bindInput(); this._tick = this._tick.bind(this); requestAnimationFrame(this._tick);
  }

  // ---------------- input ----------------
  tr(en, hi) { return this.au.lang === 'hi' && hi ? hi : en; }
  zn(k) { return this.au.lang === 'hi' ? ZONE_HI[k] : ZONE_NAMES[k]; }
  // show a commentary line on screen and voice it (mp3 if provided, else speech) in the chosen language
  commentate(key, o = {}) {
    const text = o.text || pickLine(this.au.lang === 'hi' ? 'hi' : 'en', key);
    if (!o.silent) this.ui.comment(text); this.au.voiceEvent(key, text);
  }
  _bindInput() {
    const cv = document.getElementById('c'); let drag = null;           // touch / mouse drag = aim
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, aim: this.aim }; });
    cv.addEventListener('pointermove', e => { if (!drag || !this.canAim) return; this.aim = Math.max(-1, Math.min(1, drag.aim + (e.clientX - drag.x) / (Math.max(320, innerWidth) * 0.3))); this.ui.setAimSlider(this.aim); });
    addEventListener('pointerup', () => { drag = null; }); addEventListener('pointercancel', () => { drag = null; });
    addEventListener('keydown', e => {
      if (e.repeat) return; this.keys.add(e.code);
      const shot = { KeyX: 'defend', KeyC: 'single', KeyV: 'loft', Space: this.keys.has('ArrowUp') || this.keys.has('KeyW') ? 'loft' : 'drive' }[e.code];
      if (shot) { this.shot(shot); if (e.code === 'Space') e.preventDefault(); }
      if (e.code === 'KeyR') this.reviewClick();
      if (e.code === 'KeyB') this.cycleCam();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    this.ui.bindTop({ speed: () => this.cycleSpeed(), cam: () => this.cycleCam(), shot: k => this.shot(k), aim: v => { this.aim = v; }, review: () => this.reviewClick() });
  }
  cycleSpeed() { this.speedSel = this.speedSel === 1 ? 2 : this.speedSel === 2 ? 4 : 1; this.ui.setSpeedLabel(this.speedSel + 'x'); this.ui.toast(`AI-ball speed ${this.speedSel}x`); }
  cycleCam() { const i = (this.cams.indexOf(this.w.camPref) + 1) % this.cams.length; this.w.camPref = this.cams[i]; this.ui.toast('Camera: ' + this.cams[i]); }
  _tick(now) {
    const dt = Math.min(0.05, ((now - (this._last || now)) / 1000)); this._last = now;
    if (this.canAim) {
      const l = this.keys.has('ArrowLeft') || this.keys.has('KeyA'), r = this.keys.has('ArrowRight') || this.keys.has('KeyD');
      if (l) this.aim = Math.max(-1, this.aim - dt * 1.7); if (r) this.aim = Math.min(1, this.aim + dt * 1.7); if (l || r) this.ui.setAimSlider(this.aim);
    }
    if (this.running && this.field.pos.length) this.ui.drawRadar(this.counts, this.field.pos, this.aim * 85, this.canAim);
    if (this.canSwing && this.w.ball.mode === 'path') this.ui.timing(true, this.w.ball.t / this.w.ball.del.total);
    requestAnimationFrame(this._tick);
  }
  shot(kind) {
    const W = this.w, b = W.ball; if (!this.canSwing || this.press || b.mode !== 'path') return;
    const total = b.del.total, t = b.t, contact = Math.max(0.09, Math.min(0.4, total - t));
    this.press = { kind, ts: t, aim: this.aim }; this.au.play('click', 0.3);
    W.ch(this.inn.striker.p).play('swing', { once: true, dur: contact / 0.55, kind, aim: this.aim, loc: false });
  }
  reviewClick() { if (this.reviewResolve) { this.reviewResolve(true); this.reviewResolve = null; } }

  // ---------------- match ----------------
  async start(cfg) {
    this.cfg = cfg; const T = this.teams = buildTeams(cfg.name); const W = this.w;
    W.prepare(T); W.setEnvironment(cfg.time, cfg.weather); this.ui.show('menu', false); this.au.startCrowd();
    W.hideAll(); W.show(T.A[1], 'field', 0.8, 0.3, 0.47, 'idle'); W.setCam('toss', true);
    const toss = await this.ui.toss(cfg.name); this.toss = toss;
    const first = (toss.winner === 'A') === (toss.decision === 'bat') ? 'A' : 'B', second = first === 'A' ? 'B' : 'A';
    this.running = true; this.ui.showHud(true); this.ui.reviews(this.reviews); this.ui.setSpeedLabel(this.speedSel + 'x'); this.ui.syncSound();
    this.ui.say(this.tr(`${TEAMS[first].name} will bat first. Let's play!`, `${TEAMS[first].name} पहले बल्लेबाज़ी करेगी। चलो खेलते हैं!`));
    this.inn1 = await this.playInnings(first, null);
    await this.ui.dash(this.dashHtml(false), [['START SECOND INNINGS ▶', 'go']]);
    this.inn2 = await this.playInnings(second, this.inn1.runs + 1);
    await this.finish();
  }

  newCard(p) { return { p, runs: 0, balls: 0, fours: 0, sixes: 0, out: '', plan: p.isUser ? null : makePlan(p.max, p.simp), pi: 0 }; }

  async playInnings(batKey, target) {
    const T = this.teams, W = this.w, bowlKey = batKey === 'A' ? 'B' : 'A', order = T.order[batKey];
    const cards = order.map(p => this.newCard(p));
    const inn = this.inn = { bat: batKey, bowl: bowlKey, runs: 0, wkts: 0, balls: 0, target, cards, striker: cards[0], nonStriker: cards[1], next: 2, perOver: [], fow: [], bowlStats: {}, thisOver: [], done: false, userOut: false };
    this.userBat = batKey === 'A'; this.curCamPlaced = false;
    W.hideAll(); this.ui.score(inn, T, this.cfg.overs); this.ui.batters(inn); this.ui.thisOver([]); this.ui.partner(false);
    this.ui.say(this.userBat ? this.tr(`${this.cfg.name}, you're opening. Read the bowler's stars!`, `${this.cfg.name}, तुम ओपनिंग कर रहे हो। गेंदबाज़ के स्टार देखकर खेलना!`) : this.tr('We are bowling. Bowl tight, boys!', 'हम गेंदबाज़ी कर रहे हैं। कसकर गेंदें डालो, दोस्तों!'));
    this.ui.banner(TEAMS[batKey].name.toUpperCase(), TEAMS[batKey].css, target ? `Target ${target}` : 'FIRST INNINGS'); await sleep(1600);
    for (let o = 0; o < this.cfg.overs && !inn.done; o++) {
      await this.startOver(o);
      for (let b = 0; b < 6 && !inn.done; b++) await this.ball();
      await this.endOver(o);
    }
    inn.done = true; W.hideBall(); this.canSwing = false; this.canAim = false; this.ui.risk(null); return inn;
  }

  async startOver(o) {
    const inn = this.inn, T = this.teams, W = this.w, bw = this.bowler = T.bowlers[inn.bowl][o % 5];
    inn.overRuns = 0; inn.overW = 0; inn.thisOver = []; this.ui.thisOver([]);
    inn.bowlStats[bw.id] = inn.bowlStats[bw.id] || { name: bw.name, balls: 0, runs: 0, wkts: 0 };
    this.userBowlType = null;
    // fielders
    const f = this.field = setField(); this.counts = zoneCounts(f.pos); const keeper = T.keeper[inn.bowl];
    const fielders = T.order[inn.bowl].filter(p => p !== bw && p !== keeper), first = !this.fieldPlaced; this.fieldPlaced = true;
    W.bowlerChar = W.ch(bw);
    fielders.forEach((p, i) => {
      const fp = f.pos[i % f.pos.length], c = W.ch(p);
      if (!c.root.visible || first || inn.balls === 0) { W.show(p, 'field', fp.x, fp.z, Math.PI, 'fieldReady'); }
      else c.moveTo(fp.x, fp.z, 7);
      c.watch = { x: HOME.strike.x, z: HOME.strike.z }; c.home = { x: fp.x, z: fp.z };
    });
    W.show(keeper, 'keeper', HOME.keeper.x, HOME.keeper.z, Math.PI, 'keep'); W.keeperChar = W.ch(keeper); W.ball.keeper = W.keeperChar;
    const left = bw.bowl.hand === 'L'; W.show(bw, 'bowl', left ? -0.5 : 0.5, -24, 0, 'idle');
    this.placeBatters(); W.umpire.root.visible = true; W.umpire.place(HOME.umpire.x, HOME.umpire.z, 0); W.umpire.play('idle');
    this.ui.bowler(bw, inn.bowlStats[bw.id]); this.ui.score(inn, T, this.cfg.overs); this.ui.batters(inn);
    this.ui.risk(this.userBat ? bw.bowl.stars : null);
    if (bw.isUser) {
      this.ui.say(this.tr('Your over! Pick a bowling type.', 'आपका ओवर! गेंदबाज़ी का प्रकार चुनिए।')); this.userBowlType = await this.ui.pickBowlType();
    } else if (this.userBat) this.captainAdvice();
    this.ui.comment(this.tr(`Over ${o + 1}: ${bw.name} to bowl`, `ओवर ${o + 1}: ${bw.name} गेंदबाज़ी करेंगे`) + (bw.bowl.stars ? ` (${'★'.repeat(bw.bowl.stars)})` : ''));
    if (o > 0) this.au.play('overdone');
  }
  captainAdvice() {
    const st = this.bowler.bowl.stars, c = this.counts; let worst = -9, wk = 0; for (const k in c) if (c[k] > worst && +k !== 4) { worst = c[k]; wk = +k; }
    let best = 0, bk = 0, bv = 99; for (const k of [0, 1, -1, 2, -2]) if (c[k] < bv) { bv = c[k]; bk = k; }
    const nm = this.bowler.name, hi = this.au.lang === 'hi';
    let t = st === 3 ? (hi ? `${nm} 3-स्टार गेंदबाज़ है! सिर्फ़ डिफ़ेंड करो और सिंगल लो — बड़ा शॉट खेला तो आउट!` : `${nm} is 3-star! Only DEFEND and take singles — a big shot means you're OUT.`)
      : st === 2 ? (hi ? `${nm} 2-स्टार है। बड़ा शॉट 50-50 है — जोखिम भरा!` : `${nm} is 2-star. Big shots are 50/50 — risky!`) : (hi ? `${nm} अनरेटेड है — जमकर मारो!` : `${nm} is unrated — smash him!`);
    if (worst >= 2.8) t += hi ? ` ${this.zn(wk)} में फ़ील्डर ज़्यादा हैं — वहाँ मत खेलो; ${this.zn(bk)} की तरफ़ खेलो।` : ` ${this.zn(wk)} is crowded — avoid it; go ${this.zn(bk)}.`;
    this.ui.say(t); this.au.play('tip', 0.5);
  }

  placeBatters() {
    const inn = this.inn, W = this.w, s = inn.striker, n = inn.nonStriker;
    const sc = W.show(s.p, 'bat', HOME.strike.x, HOME.strike.z, Math.PI, 'stance'); W.striker = sc;
    const nc = W.show(n.p, 'bat', HOME.nonStrike.x, HOME.nonStrike.z, 0, 'idle');
    sc.watch = null; nc.watch = null; this.ui.partner(this.userBat && !s.p.isUser && !inn.userOut && n.p.isUser);
  }

  async endOver(o) {
    const inn = this.inn; inn.perOver.push({ runs: inn.overRuns, w: inn.overW });
    [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
    this.ui.batters(inn); await this.w.wait(0.6);
  }

  // ---------------- scoring ----------------
  commit(res) {
    const inn = this.inn, S = inn.striker, bw = this.bowler, st = inn.bowlStats[bw.id], runs = res.runs || 0;
    inn.balls++; S.balls++; st.balls++;
    if (!res.wicket) {
      inn.runs += runs; S.runs += runs; st.runs += runs; inn.overRuns += runs; if (runs === 4) S.fours++; if (runs === 6) S.sixes++;
    }
    inn.thisOver.push(res.wicket ? 'W' : runs);
    if (res.wicket) {
      st.wkts++; inn.wkts++; inn.overW++; S.out = res.desc; inn.fow.push({ score: inn.runs, wk: inn.wkts, name: S.p.name, over: `${Math.floor(inn.balls / 6)}.${inn.balls % 6}` });
      if (S.p.isUser) { inn.userOut = true; }
      if (inn.wkts >= 10 || inn.next >= inn.cards.length) inn.done = true;
      else { inn.striker = inn.cards[inn.next++]; }
    } else if (res.consumePlan !== false && S.plan) S.pi++;
    if (!res.wicket && runs % 2 === 1) [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
    if (inn.target && inn.runs >= inn.target) inn.done = true;
    this.ui.score(inn, this.teams, this.cfg.overs); this.ui.batters(inn); this.ui.thisOver(inn.thisOver); this.ui.bowler(bw, st);
  }

  // ---------------- dashboard ----------------
  batTable(inn) {
    const rows = inn.cards.filter(c => c.balls > 0 || c.out || c === inn.striker || c === inn.nonStriker).map(c => {
      const out = c.out || ((c === inn.striker || c === inn.nonStriker) ? 'not out' : 'did not bat');
      return `<tr><td>${esc(c.p.name)}<br><small style="color:#8fa0cc">${esc(out)}</small></td><td><b>${c.runs}</b></td><td>${c.balls}</td><td>${c.fours}</td><td>${c.sixes}</td><td>${c.balls ? (c.runs * 100 / c.balls).toFixed(0) : '-'}</td></tr>`;
    }).join('');
    return `<table><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>${rows}</table>`;
  }
  bowlTable(inn) {
    const rows = Object.values(inn.bowlStats).map(b => `<tr><td>${esc(b.name)}</td><td>${Math.floor(b.balls / 6)}.${b.balls % 6}</td><td>${b.runs}</td><td><b>${b.wkts}</b></td><td>${b.balls ? (b.runs * 6 / b.balls).toFixed(1) : '-'}</td></tr>`).join('');
    return `<table><tr><th>Bowler</th><th>O</th><th>R</th><th>W</th><th>Econ</th></tr>${rows}</table>`;
  }
  innBlock(inn, cls, cv) {
    const fow = inn.fow.map(f => `${f.score}/${f.wk} (${esc(f.name)}, ${f.over})`).join(' · ') || '—';
    return `<div class="${cls}"><h3>${TEAMS[inn.bat].name}: ${inn.runs}/${inn.wkts} (${Math.floor(inn.balls / 6)}.${inn.balls % 6} ov)</h3>${this.batTable(inn)}<small style="color:#8fa0cc">FOW: ${fow}</small><h3>Bowling — ${TEAMS[inn.bowl].name}</h3>${this.bowlTable(inn)}<canvas id="${cv}"></canvas></div>`;
  }
  dashHtml(final) {
    const a = this.inn1, b = final ? this.inn2 : null; let head;
    if (!final) head = `<h1>INNINGS BREAK</h1><div class="res">${TEAMS[a.bat].name} ${a.runs}/${a.wkts} · Target ${a.runs + 1} in ${this.cfg.overs} overs</div>`;
    else head = `<h1>MATCH RESULT</h1><div class="res">${this.resultText}</div><div>⭐ Player of the Match: <b>${esc(this.potm)}</b></div>`;
    const html = `${head}<div class="cols">${this.innBlock(a, a.bat === 'A' ? 'tm-a' : 'tm-b', 'cv1')}${b ? this.innBlock(b, b.bat === 'A' ? 'tm-a' : 'tm-b', 'cv2') : ''}</div>`;
    setTimeout(() => { this.ui.drawOvers('cv1', a.perOver, a.bat === 'A' ? '#e53935' : '#2f7bff'); if (b) this.ui.drawOvers('cv2', b.perOver, b.bat === 'A' ? '#e53935' : '#2f7bff'); }, 50);
    return html;
  }
  async finish() {
    const a = this.inn1, b = this.inn2; this.canSwing = false; let txt, userWon = null;
    if (b.runs >= b.target) { txt = `${TEAMS[b.bat].name} won by ${10 - b.wkts} wicket${10 - b.wkts === 1 ? '' : 's'}`; userWon = b.bat === 'A'; }
    else if (b.runs === b.target - 1) txt = 'MATCH TIED!';
    else { txt = `${TEAMS[a.bat].name} won by ${a.runs - b.runs} runs`; userWon = a.bat === 'A'; }
    this.resultText = txt;
    let best = null, bs = -1; for (const inn of [a, b]) { inn.cards.forEach(c => { const s = c.runs + 0; if (s > bs) { bs = s; best = c.p.name + ` (${c.runs})`; } }); Object.values(inn.bowlStats).forEach(x => { const s = x.wkts * 22; if (s > bs) { bs = s; best = x.name + ` (${x.wkts} wkts)`; } }); }
    this.potm = best; this.au.play(userWon === false ? 'lose' : 'win'); this.commentate(userWon === false ? 'lose' : 'win');
    this.ui.showHud(false); this.w.setCam('orbit'); this.w.crowd.boost(1);
    const r = await this.ui.dash(this.dashHtml(true), [['PLAY AGAIN', 'again']]); if (r === 'again') location.reload();
  }
}

return { Game };
})();

/* ---- play ---- */
__M.play = (function(){
const { Game } = __M.game;
const { CONFIG, TEAMS } = __M.data;
const { HOME } = __M.world;
const { Delivery, ballisticVel, groundVelocity, simulateStop, HIT_Z } = __M.physics;
const { rnd, pick, wpick, aiShotAngle, zoneKey, zoneLevel, resolveUserShot, timingQuality, bowlQuality, adjustForBowling, makeLbw, pickWicketType, BAT } = __M.ai;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const G = Game.prototype;
const dirOf = a => { const r = a * Math.PI / 180; return { x: Math.sin(r), z: -Math.cos(r) }; };
const ropeDist = (p, d) => { const b = p.x * d.x + p.z * d.z, c = p.x * p.x + p.z * p.z - 4900; return -b + Math.sqrt(b * b - c); };

// ---------------- delivery construction ----------------
G.buildDelivery = function (bw, btype, scen, spec, uLine, uLen) {
  const fx = this.w.fx, left = bw.bowl.hand === 'L', spin = ['spin', 'off', 'leg', 'carrom'].includes(btype);
  const R = V(left ? -0.5 : 0.5, spin ? 1.95 : 2.12, -10.0);
  let speed, bz, turn = 0, swing = 0, pace = 0.82, bx = uLine !== null && uLine !== undefined ? uLine : rnd(-0.45, 0.45);
  switch (btype) {
    case 'swing': speed = rnd(22, 25); bz = rnd(5.8, 7.2); swing = (left ? -1 : 1) * rnd(0.3, 0.55); break;
    case 'off': speed = rnd(15, 18); bz = rnd(4.6, 6.2); turn = rnd(0.8, 2.0); pace = 0.7; break;
    case 'leg': speed = rnd(15, 18); bz = rnd(4.6, 6.2); turn = -rnd(0.8, 2.0); pace = 0.7; break;
    case 'spin': speed = rnd(15, 18); bz = rnd(4.6, 6.2); turn = pick([-1, 1]) * rnd(0.8, 1.8); pace = 0.7; break;
    case 'carrom': speed = rnd(16, 19); bz = rnd(5, 6.5); turn = pick([-1, 1]) * rnd(1.4, 2.6); pace = 0.72; break;
    default: speed = rnd(23, 27); bz = rnd(5.6, 7.4);
  }
  if (uLen !== null && uLen !== undefined) bz = uLen;
  let end;
  if (scen === 'wide') { bx = pick([-1, 1]) * rnd(1.1, 1.5); end = { x: bx * 1.1, y: rnd(0.7, 1.0) }; }
  else if (scen === 'bowled') { bz = spin ? 6.6 : 8.0; bx = rnd(-0.12, 0.12); end = { x: rnd(-0.06, 0.06), y: 0.24 }; }
  else if (scen === 'lbw') { bz = 6.4; bx = spec.pitchX; end = { x: spec.impX, y: spec.impY }; }
  else if (scen === 'simp') { bz = 7.0; bx = 0.3; end = { x: 0.33, y: 0.55 }; }
  else end = { x: Math.max(-0.9, Math.min(0.9, bx + turn * 0.12)), y: rnd(0.7, 1.1) };
  bz = Math.min(8.3, Math.max(4.2, bz));
  return new Delivery({ R, bx, bz, speed, swing: scen === 'normal' ? swing : 0, turn: 0, pace, end }, fx);
};

// ---------------- review flow ----------------
G.askReview = function (team) {
  return new Promise(res => {
    const t = setTimeout(() => { if (this.reviewResolve) this.reviewResolve(false); }, 7500);
    this.reviewResolve = v => { clearTimeout(t); this.ui.reviewButton(false); this.reviewResolve = null; res(v); };
    this.ui.reviewButton(true, this.reviews[team]); this.ui.say('Review? Press the REVIEW button (or R)!', false);
  });
};
G.lbwSequence = async function (spec, del, S, bw) {
  const W = this.w, ui = this.ui, inn = this.inn; W.speed = 1;
  this.au.play('appeal'); this.commentate('lbw'); W.crowd.boost(0.5); ui.banner(this.tr('HOWZAT?!', 'हाउज़ैट?!'), '#fff');
  W.ch(bw).play('appeal', { loc: false }); W.keeperChar.play('appeal', { loc: false }); W.setCam('wicket'); await W.wait(1.6);
  W.umpire.play('idle'); ui.comment('The umpire is thinking…'); await W.wait(1.0);
  const out = spec.decisionOut; W.umpire.play(out ? 'signalOut' : 'notOut');
  ui.banner(out ? 'GIVEN OUT' : 'NOT OUT', out ? '#ff5252' : '#35e06a', 'On-field decision'); await W.wait(1.5);
  const side = out ? inn.bat : inn.bowl; let wants = false;
  if (this.reviews[side] > 0) {
    if (side === 'A') wants = await this.askReview('A');
    else { const p = spec.umpireCall ? 0.4 : out ? (spec.trulyOut ? 0.15 : 0.65) : (spec.trulyOut ? 0.75 : 0.2); wants = Math.random() < p; if (wants) ui.toast(`${TEAMS[side].name} take a review!`); }
  }
  W.umpire.play('idle'); if (!wants) return out;
  this.reviews[side]--; ui.reviews(this.reviews); this.au.play('review'); this.commentate('review'); ui.banner(this.tr('REVIEW!', 'रिव्यू!'), '#00c2ff', TEAMS[side].name); await W.wait(1.3);
  W.setCam('hawk'); const hk = W.showHawk(del, spec); ui.hawk(true); ui.hawkSet('hkO', out ? 'OUT' : 'NOT OUT', '');
  await W.wait(1.0); hk.pitch.visible = true; ui.hawkSet('hkP', spec.pitching, spec.pitching === 'IN LINE' ? 'g' : 'r');
  await W.wait(1.3); hk.imp.visible = true; ui.hawkSet('hkI', spec.impact, spec.impact === 'IN LINE' ? 'g' : 'r');
  await W.wait(1.3); [hk.pr, hk.wk, hk.hit].forEach(o => { o.visible = true; });
  ui.hawkSet('hkW', spec.wickets, spec.wickets === 'HITTING' ? 'g' : spec.wickets === 'MISSING' ? 'r' : 'o'); await W.wait(1.7);
  let finalOut, retained; if (spec.umpireCall) { finalOut = out; retained = true; } else { finalOut = spec.trulyOut; retained = finalOut !== out; }
  if (retained) { this.reviews[side]++; ui.reviews(this.reviews); }
  ui.hawk(false);
  await ui.decision(finalOut ? 'out' : 'not', spec.umpireCall ? "UMPIRE'S CALL — on-field decision stands" : finalOut !== out ? 'Decision overturned!' : 'Decision stands', 'THIRD UMPIRE', 2800);
  if (!finalOut) this.commentate('notout'); W.clearHawk(); return finalOut;
};

// ---------------- helpers ----------------
G.fielderChars = function () {
  const T = this.teams, W = this.w, inn = this.inn;
  return T.order[inn.bowl].filter(p => p !== this.bowler && p !== T.keeper[inn.bowl]).map(p => W.ch(p)).filter(c => c.root.visible);
};
G.resetFielders = function () {
  for (const c of this.fielderChars()) if (c.home && Math.hypot(c.root.position.x - c.home.x, c.root.position.z - c.home.z) > 0.5) { c.moveTo(c.home.x, c.home.z, 6.5); c.play('fieldReady'); }
  const k = this.w.keeperChar; if (k) { k.play('keep'); k.place(HOME.keeper.x, HOME.keeper.z, Math.PI); }
};
G.nearestFielder = function (x, z, ang) {
  let best = null, bd = 1e9;
  for (const c of this.fielderChars()) {
    const p = c.root.position; let d = Math.hypot(p.x - x, p.z - z);
    if (ang !== undefined) { const a = Math.atan2(p.x - BAT.x, -(p.z - BAT.z)) * 180 / Math.PI; let da = Math.abs(a - ang); da = Math.min(da, 360 - da); d = da + Math.hypot(p.x - BAT.x, p.z - BAT.z) * 0.15; }
    if (d < bd) { bd = d; best = c; }
  }
  return best;
};
G.fieldAndThrow = async function (fc, near = 0.9) {
  const W = this.w; fc.play('fieldReady');
  await W.waitUntil(() => { const b = W.ballPos(); fc.moveTo(b.x, b.z, 8.5); return Math.hypot(b.x - fc.root.position.x, b.z - fc.root.position.z) < near; }, 9);
  fc.target = null; W.hold(fc); fc.play('throwBall', { once: true, dur: 0.4, loc: false }); await W.wait(0.3);
  const d = Math.hypot(fc.root.position.x - HOME.keeper.x, fc.root.position.z - HOME.keeper.z);
  W.tweenBall(V(HOME.keeper.x, 1.0, HOME.keeper.z), 0.45 + d * 0.012, 2.2); await W.waitUntil(() => W.ball.mode !== 'tween', 5); W.hold(W.keeperChar);
};

// ---------------- the ball ----------------
G.ball = async function () {
  const inn = this.inn, W = this.w, ui = this.ui, S = inn.striker, bw = this.bowler, stars = bw.bowl.stars, T = this.teams;
  const userBat = S.p.isUser, userBowl = bw.isUser, involved = userBat || userBowl;
  W.speed = involved ? 1 : this.speedSel; W.slow = 1; this.press = null; this.canSwing = false; this.canAim = userBat && !inn.userOut;
  ui.controlsVisible(userBat); ui.risk(userBat ? stars : null); ui.timing(false);
  W.resetStumps(); W.clearHawk(); W.hideBall(); this.resetFielders(); this.placeBatters(); W.striker = W.ch(S.p);
  const bwc = W.bowlerChar = W.ch(bw), sc = W.ch(S.p), left = bw.bowl.hand === 'L';
  const btype = userBowl ? this.userBowlType : bw.bowl.type;
  let uLine = null, uLen = null, Q = 0.6;
  if (userBowl) {
    W.setCam('bowler'); const [l, n] = await ui.aimGame(); uLine = (l - 0.5) * 1.8; uLen = 4.2 + n * 4.3; Q = bowlQuality(uLine, uLen);
    ui.comment(Q > 0.8 ? 'Perfect delivery!' : Q < 0.35 ? 'Loose delivery…' : 'Decent ball');
  }
  // -- intent for computer batters
  let intent = null;
  if (!userBat) { let o = S.plan[S.pi]; if (o === undefined) o = 'W'; if (userBowl) o = adjustForBowling(o, Q); intent = { o }; if (o === 'W') intent.wt = S.p.simp ? 'simp' : pickWicketType(); }
  let scen = 'normal';
  if (userBat) scen = wpick([['normal', 76], ['bowled', 9], ['lbw', 9], ['wide', 6]]);
  else if (intent.o === 'W') scen = { bowled: 'bowled', lbw: 'lbw', simp: 'simp' }[intent.wt] || 'normal';
  else if (intent.o === 0 && Math.random() < 0.15) scen = 'wide';
  const spec = scen === 'lbw' ? makeLbw() : null, del = this.buildDelivery(bw, btype, scen, spec, uLine, uLen), total = del.total;
  // -- run-up
  const spin = ['spin', 'off', 'leg', 'carrom'].includes(btype), startZ = spin ? -17 : -25;
  bwc.setGear('bowl'); bwc.place(left ? -0.55 : 0.55, startZ, 0); bwc.play('idle'); bwc.moveTo(left ? -0.5 : 0.5, -10.8, spin ? 4.4 : 7);
  W.setCam(userBowl ? 'bowler' : 'side'); this.au.play('bowl'); await W.wait(0.5);
  if (!userBowl) { await W.waitUntil(() => bwc.root.position.z > (spin ? -14.5 : -17.5) || !bwc.moving, 8); W.setCam('bat'); }
  await W.waitUntil(() => !bwc.moving, 8);
  bwc.play('bowl', { once: true, dur: 0.55, loc: false }); await W.wait(0.3);
  W.releaseDelivery(del); this.canSwing = userBat && !inn.userOut;
  W.wait(0.3).then(() => { bwc.play('idle'); bwc.moveTo(left ? -0.9 : 0.9, -6.5, 3.5); });
  // -- computer batter swing
  let aiKind = null, angle = 0;
  if (!userBat) {
    const o = intent.o, wt = intent.wt; angle = aiShotAngle(this.counts);
    if (o === 'W') aiKind = wt === 'caught' || wt === 'caughtbehind' ? 'drive' : wt === 'bowled' ? 'drive' : null;
    else if (scen === 'wide') aiKind = null; else aiKind = o === 0 ? 'defend' : o === 1 ? 'single' : o === 6 ? 'loft' : 'drive';
    if (aiKind) {
      const early = intent.o === 'W' && wt === 'bowled', at = total - 0.16 - (early ? 0.4 : 0);
      await W.waitUntil(() => W.ball.t >= at, 6); sc.play('swing', { once: true, dur: 0.16 / 0.55, kind: aiKind, aim: angle / 85, loc: false });
    }
  }
  await W.waitUntil(() => W.ball.t >= total - 1e-3, 8); this.canSwing = false; ui.timing(false);
  const cp = del.pos(total);
  // -- what happened?
  let oc;
  if (userBat) {
    let kind = 'none', q = 'miss';
    if (this.press) { kind = this.press.kind; const off = this.press.ts - (total - 0.16); q = timingQuality(off); if (off > 0.1) q = 'miss'; }
    if (scen === 'wide' && kind !== 'none') q = 'miss';
    angle = (this.press ? this.press.aim : this.aim) * 85; const crowded = zoneLevel(this.counts[zoneKey(angle)] || 0) === 'red';
    const r = resolveUserShot({ kind, q, stars, crowded, scen }); let wt = r.wicket ? r.wicket.type : null;
    if (wt) { if (scen === 'lbw' && (wt === 'bowled' || wt === 'lbw')) wt = 'lbw'; else if (scen === 'bowled' && wt === 'lbw') wt = 'bowled'; else if (scen === 'normal' && (wt === 'bowled' || wt === 'lbw')) wt = 'caught'; else if (scen === 'wide' && wt !== 'caughtbehind') wt = 'caughtbehind'; }
    if (!wt && (scen === 'lbw' || scen === 'bowled') && r.runs === 0 && !r.blocked && (kind === 'none' || q === 'miss')) wt = scen;
    oc = { runs: r.runs, wt, kind, q, angle, blocked: r.blocked, risk: r.risk, crowded };
    if (stars === 3 && (kind === 'drive' || kind === 'loft')) ui.say('I told you — 3-star bowler, only defend!');
  } else oc = { runs: intent.o === 'W' ? 0 : intent.o, wt: intent.o === 'W' ? intent.wt : null, kind: aiKind, angle };
  const fin = await this.playOutcome(oc, { del, total, cp, scen, spec, S, bw, bwc, sc, T });
  // -- commit
  const res = { runs: fin.runs || 0, wicket: !!fin.wicket, desc: fin.desc, consumePlan: !fin.lbwNotOut };
  const dismissedChar = W.ch(S.p);
  this.commit(res);
  const cm = this.commentaryFor(fin, S, bw);
  if (fin.wicket) ui.comment(cm.text); else if (!fin.spoken) this.commentate(cm.key);
  if (res.wicket) { dismissedChar.root.visible = false; if (S.p.isUser) { ui.say('Out! Nice try. Your teammates will carry on.'); ui.controlsVisible(false); } }
  if (res.runs === 50 || S.runs >= 50 && S.runs - res.runs < 50 && !res.wicket) { this.au.play('fifty'); this.commentate('fifty'); ui.banner(this.tr('FIFTY!', 'पचासा!'), '#ffc83d', S.p.name); }
  if (S.runs >= 100 && S.runs - res.runs < 100 && !res.wicket) { this.au.play('hundred'); this.commentate('hundred'); ui.banner(this.tr('HUNDRED!', 'शतक!'), '#ffc83d', S.p.name); }
  await W.wait(0.4); W.hideBall(); W.slow = 1; W.setCam('bat');
  if (!inn.done) await W.wait(0.5);
};

G.commentaryFor = function (fin, S, bw) {
  if (fin.wicket) return { key: 'wicket', text: this.tr(`OUT! ${S.p.name} ${fin.desc}`, `आउट! ${S.p.name} (${fin.desc})`) };
  const r = fin.runs;
  if (fin.lbwNotOut) return { key: 'notout' };
  if (r === 6) return { key: 'six' }; if (r === 4) return { key: 'four' };
  if (r === 0) return { key: fin.blocked ? 'defend' : fin.beaten ? 'beaten' : 'dot' };
  return { key: r === 1 ? 'single' : r === 2 ? 'two' : 'three' };
};

// ---------------- visuals for each outcome ----------------
G.playOutcome = async function (oc, c) {
  const W = this.w, ui = this.ui, au = this.au, { del, total, cp, scen, spec, S, bw, bwc, sc } = c, fx = W.fx, T = this.teams, inn = this.inn;
  const keeper = T.keeper[inn.bowl], wtxt = { bowled: `b ${bw.name}`, lbw: `lbw b ${bw.name}`, caughtbehind: `c ${keeper.name} b ${bw.name}`, simp: `ouch! b ${bw.name}` };
  const wicketFX = (ms = 1800) => { au.play('wicket'); W.crowd.boost(0.7); W.shake(0.12); bwc.play('celebrate', { loc: false }); W.keeperChar.play('celebrate', { loc: false }); ui.banner(this.tr('WICKET!', 'विकेट!'), '#ff4d4d', S.p.name); this.commentate('wicket'); };
  const decide = async (desc) => { await W.wait(0.8); await ui.decision('out', `${S.p.name} ${desc}`, 'WICKET', 1700); };

  if (oc.wt === 'bowled') {
    W.continueDelivery({ checkStumps: true }); await W.waitUntil(() => W.ball.stumpHit || (W.ball.flight && W.ball.flight.stopped), 3);
    W.setCam('wicket'); wicketFX(); await decide(wtxt.bowled); return { runs: 0, wicket: true, desc: wtxt.bowled };
  }
  if (oc.wt === 'lbw') {
    au.play('bat', 0.6); W.launch(cp, V(rnd(-0.6, 0.6), 0.9, -rnd(0.8, 1.6))); sc.play('pad', { once: true, dur: 0.6, loc: false });
    const out = await this.lbwSequence(spec, del, S, bw);
    if (out) { wicketFX(); return { runs: 0, wicket: true, desc: wtxt.lbw }; }
    W.hideBall(); bwc.play('dejected', { loc: false }); return { runs: 0, wicket: false, lbwNotOut: true };
  }
  if (oc.wt === 'simp') {
    W.launch(cp, V(0, 1.4, -2.2)); sc.play('collapse', { once: true, dur: 1.1, loc: false }); au.play('simp'); W.shake(0.2); ui.banner(this.tr('OUCH!', 'आउच!'), '#ffd54f', 'Simp Gulley'); this.commentate('simp'); W.crowd.boost(0.5); await W.wait(2.4);
    ui.comment(this.tr('Simp Gulley is out for a duck — the ball found a very sensitive spot!', 'सिंप गुल्ली शून्य पर आउट — गेंद सीधी नाज़ुक जगह पर लगी!')); await decide(wtxt.simp); return { runs: 0, wicket: true, desc: wtxt.simp };
  }
  if (oc.wt === 'caughtbehind') {
    au.play('bat'); const tgt = V(HOME.keeper.x, 1.0, HOME.keeper.z - 0.1); W.launch(cp, ballisticVel(cp, tgt, 0.3), { keeperCatch: true, nodrag: true });
    await W.waitUntil(() => W.ball.mode === 'held', 3); wicketFX(); await decide(wtxt.caughtbehind); return { runs: 0, wicket: true, desc: wtxt.caughtbehind };
  }
  if (oc.wt === 'caught') {
    au.play('bat'); const fc = this.nearestFielder(0, 0, oc.angle), p = fc.root.position, tgt = V(p.x, 1.7, p.z), dist = Math.hypot(p.x - cp.x, p.z - cp.z), Tm = 1.4 + dist * 0.05;
    W.launch(cp, ballisticVel(cp, tgt, Tm), { nodrag: true, trail: true }); W.setCam('follow'); W.crowd.boost(0.4); fc.faceTo(cp.x, cp.z); fc.play('catchBall', { loc: false });
    await W.wait(Tm - 0.05); W.hold(fc); fc.play('celebrate', { loc: false }); const desc = `c ${fc.player.name} b ${bw.name}`;
    wicketFX(); W.setCam('fielder'); W.focus = fc; await decide(desc); return { runs: 0, wicket: true, desc };
  }
  // ----- no wicket -----
  if (oc.kind === 'none' || oc.q === 'miss' || !oc.kind) {                     // beaten / left
    W.continueDelivery({ keeperCatch: true }); if (oc.q === 'miss' && oc.kind && oc.kind !== 'none') ui.comment(this.tr('Missed it!', 'चूक गए!'));
    await W.waitUntil(() => W.ball.mode === 'held', 3); au.play('groan', 0.4); await W.wait(0.5); return { runs: 0, wicket: false, beaten: oc.q === 'miss' && !!oc.kind && oc.kind !== 'none' };
  }
  if (oc.runs === 0) {                                                          // blocked at feet
    au.play('bat', 0.7); W.launch(cp, V(rnd(-1.5, 1.5), 1.0, -rnd(1.5, 3.5))); await W.wait(1.3); return { runs: 0, wicket: false, blocked: true };
  }
  au.play('bat'); W.crowd.boost(0.25); const d = dirOf(oc.angle), rope = ropeDist(cp, d), runs = oc.runs;
  if (runs === 6) {
    const dist = rope + rnd(4, 11), tgt = V(cp.x + d.x * dist, 0.2, cp.z + d.z * dist), Tm = 2.0 + dist * 0.017;
    W.launch(cp, ballisticVel(cp, tgt, Tm), { nodrag: true, trail: true }); W.setCam('follow'); W.slow = 0.35; setTimeout(() => { W.slow = 1; }, 500);
    await W.waitUntil(() => W.ball.flight.crossed || W.ball.flight.stopped, 8);
    au.play('six'); this.commentate('six'); ui.banner(this.tr('SIX!', 'छक्का!'), '#ffc83d'); W.crowd.boost(1); W.crowd.waveNow(); W.shake(0.1); W.umpire.play('signal6'); au.cheerLevel(1);
    await W.waitUntil(() => W.ball.flight.stopped || W.ball.flight.t > Tm + 0.3, 6); W.hideBall(); W.setCam('wide'); await W.wait(1.8); W.umpire.play('idle'); au.cheerLevel(0.2);
    return { runs: 6, wicket: false, spoken: true };
  }
  if (runs === 4) {
    const v = groundVelocity(cp, oc.angle, rope + 1.5, fx); W.launch(cp, v); W.setCam('follow');
    const chaser = this.nearestFielder(cp.x + d.x * rope * 0.6, cp.z + d.z * rope * 0.6); chaser.play('fieldReady');
    await W.waitUntil(() => { const b = W.ballPos(); chaser.moveTo(b.x, b.z, 8.5); return W.ball.flight.crossed || W.ball.flight.stopped; }, 8);
    au.play('four'); this.commentate('four'); ui.banner(this.tr('FOUR!', 'चौका!'), '#4aa8ff'); W.crowd.boost(0.85); W.umpire.play('signal4'); au.cheerLevel(0.8);
    await W.wait(1.0); W.setCam('wide'); await W.wait(1.6); W.umpire.play('idle'); W.hideBall(); au.cheerLevel(0.2); return { runs: 4, wicket: false, spoken: true };
  }
  // 1, 2, 3 runs
  const dist = runs === 1 ? rnd(18, 32) : runs === 2 ? rnd(38, 52) : rnd(54, 64), v = groundVelocity(cp, oc.angle, dist, fx);
  W.launch(cp, v); W.setCam('follow'); setTimeout(() => { if (W.camMode === 'follow') W.setCam('wide'); }, 1500 / Math.max(1, W.speed));
  const pred = simulateStop(cp, v, fx).pos, chaser = this.nearestFielder(pred.x, pred.z), other = W.ch(inn.nonStriker.p);
  await Promise.all([W.runBatters(sc, other, runs, CONFIG.runTime), this.fieldAndThrow(chaser)]);
  return { runs, wicket: false };
};

return {  };
})();

/* ---- main ---- */
__M.main = (function(){
const { World } = __M.world;
const { UI } = __M.ui;
const { AudioManager } = __M.audio;
const { Game } = __M.game;
const { buildTeams } = __M.data;

const canvas = document.getElementById('c');
const audio = new AudioManager();
const ui = new UI(audio);
let world;
try { world = new World(canvas); } catch (e) { document.getElementById('loading').textContent = 'WebGL is not available: ' + e.message; throw e; }
const game = new Game(world, ui, audio);
window.__jpl = { world, game, ui };

world.prepare(buildTeams('You'));
world.setEnvironment('evening', 'summer');
world.setCam('orbit', true);
ui.initMenu(sel => world.setEnvironment(sel.time, sel.weather), cfg => game.start(cfg).catch(err => { console.error(err); ui.toast('Error: ' + err.message); }));

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try { world.update(dt); } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
document.getElementById('loading').classList.add('hidden');

return {  };
})();
})();
