import { TEAMS } from './data.js';
import { zoneKey, zoneLevel, ZONE_NAMES, BAT } from './ai.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export class UI {
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
