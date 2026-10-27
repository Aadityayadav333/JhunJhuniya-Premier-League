import * as THREE from 'three';
import { Character, createUmpire } from './characters.js';
import { buildStadium, Environment } from './stadium.js';
import { Flight, BALL_R, STUMP_Z } from './physics.js';
import { WEATHER_FX, TEAMS } from './data.js';
import { srgb, REV } from './compat.js';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const HOME = { strike: { x: 0.35, z: 9.15 }, nonStrike: { x: 1.3, z: -9.7 }, keeper: { x: -0.55, z: 12.6 }, umpire: { x: -0.9, z: -12.4 } };

export class World {
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
