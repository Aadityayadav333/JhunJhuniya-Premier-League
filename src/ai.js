import { CONFIG } from './data.js';

export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export function wpick(pairs) { // [[value, weight],...]
  const tot = pairs.reduce((s, p) => s + p[1], 0); let r = Math.random() * tot;
  for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; } return pairs[0][0];
}

// ---------- zones (angle: 0 = straight, + = off side, - = leg side) ----------
export const ZONE_NAMES = { 0: 'Straight', 1: 'Cover', 2: 'Point', 3: 'Third Man', 4: 'Behind', '-1': 'Mid-wicket', '-2': 'Square Leg', '-3': 'Fine Leg' };
export function zoneKey(deg) { let k = Math.round(deg / 45); if (k === -4) k = 4; return k; }
export const BAT = { x: 0.35, z: 9.2 };

// ---------- AI batter: a plan of ball outcomes that sums to a random score in [0,max] ----------
export function makePlan(max, simp) {
  if (simp) return ['W'];
  const target = Math.floor(Math.random() * (max + 1)), out = []; let left = target;
  while (left > 0 && out.length < 80) {
    const opts = [[0, 30], [1, 28], [2, 8], [4, 22], [6, 12]].filter(([r]) => r <= left);
    const r = wpick(opts); out.push(r); left -= r;
  }
  out.push('W'); return out;
}
export const pickWicketType = () => wpick([['bowled', 28], ['lbw', 24], ['caught', 38], ['caughtbehind', 10]]);

// ---------- fielding positions (batter-centred polar) ----------
export function setField() {
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
export function zoneCounts(pos) {
  const c = {}; for (let k = -3; k <= 4; k++) c[k] = 0;
  for (const f of pos) {
    const ang = Math.atan2(f.x - BAT.x, -(f.z - BAT.z)) * 180 / Math.PI;
    c[zoneKey(ang)] += f.r < 36 ? 1 : 0.9;
  }
  return c;
}
export function zoneLevel(n) { return n >= 2.8 ? 'red' : n >= 1.8 ? 'amber' : 'green'; }

export function aiShotAngle(counts) {
  const base = { 0: 3, 1: 2.5, '-1': 2.5, 2: 1.2, '-2': 1.2, 3: 0.5, '-3': 0.5 };
  const w = Object.entries(base).map(([k, b]) => [+k, b / (1 + counts[+k] * 1.4)]);
  const k = wpick(w); return k * 45 + rnd(-17, 17);
}

// ---------- the batting rules engine for the human player ----------
// kind: none|defend|single|drive|loft   q: perfect|good|late|miss   scen: normal|bowled|lbw|wide
export function resolveUserShot({ kind, q, stars, crowded, scen }) {
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

export function timingQuality(offset) {
  const a = Math.abs(offset);
  if (a <= CONFIG.swingPerfect) return 'perfect';
  if (a <= CONFIG.swingGood) return 'good';
  if (a <= CONFIG.swingLate) return 'late';
  return 'miss';
}

// ---------- human bowling: quality 0..1 from chosen line (x) and length (z) ----------
export function bowlQuality(lineX, lengthZ) {
  const lineErr = Math.min(1, Math.abs(lineX - 0.18) / 0.9), lenErr = Math.min(1, Math.min(Math.abs(lengthZ - 6.4), Math.abs(lengthZ - 8.0)) / 2.2);
  return Math.max(0, 1 - 0.55 * lineErr - 0.45 * lenErr);
}
export function adjustForBowling(outcome, Q) {
  if (outcome === 'W') return outcome;
  if (Q > 0.8) { const r = Math.random(); if (r < 0.1) return 'W'; if ((outcome === 4 || outcome === 6) && r < 0.55) return 0; }
  if (Q < 0.35 && (outcome === 0 || outcome === 1 || outcome === 2) && Math.random() < 0.35) return 4;
  return outcome;
}

// ---------- LBW specification & Hawk-Eye numbers ----------
export function makeLbw() {
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
