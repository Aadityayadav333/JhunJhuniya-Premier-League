import * as THREE from 'three';
import { Game } from './game.js';
import { CONFIG, TEAMS } from './data.js';
import { HOME } from './world.js';
import { Delivery, ballisticVel, groundVelocity, simulateStop, HIT_Z } from './physics.js';
import { rnd, pick, wpick, aiShotAngle, zoneKey, zoneLevel, resolveUserShot, timingQuality, bowlQuality, adjustForBowling, makeLbw, pickWicketType, BAT } from './ai.js';

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
