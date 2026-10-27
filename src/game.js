import * as THREE from 'three';
import { CONFIG, TEAMS, buildTeams } from './data.js';
import { makePlan, setField, zoneCounts, zoneKey, ZONE_NAMES, zoneLevel, pick } from './ai.js';
import { HOME } from './world.js';
import { sleep } from './ui.js';
import { pickLine, ZONE_HI } from './lines.js';

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export class Game {
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
