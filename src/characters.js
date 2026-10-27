import * as THREE from 'three';

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

export class Character {
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

export function createUmpire() {
  const c = new Character({ look: { skin: 0xc89870, hair: 'short', hairC: 0x333333 }, id: 'ump', name: 'Umpire' }, 0xf6f6f6, { kind: 'umpire' });
  return c;
}
