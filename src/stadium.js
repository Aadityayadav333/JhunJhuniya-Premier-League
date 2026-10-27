import * as THREE from 'three';
import { srgb, LI, FLOOD } from './compat.js';

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

export function buildStadium(scene) {
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

export class Environment {
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
