import * as THREE from 'three';

export const G = 9.81;
export const BALL_R = 0.07;
export const HIT_Z = 8.6;          // plane where bat meets ball
export const STUMP_Z = 10.06;      // batting-end stumps
export const ROPE_R = 70;

export function ballisticVel(p0, p1, T) {
  return new THREE.Vector3((p1.x - p0.x) / T, (p1.y - p0.y) / T + 0.5 * G * T, (p1.z - p0.z) / T);
}

// Free flight: gravity, quadratic drag, bounce, rolling friction, hoarding collision
export class Flight {
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

export function simulateStop(pos, vel, fx, maxT = 12) {
  const f = new Flight(pos, vel, fx);
  while (!f.stopped && f.t < maxT) f.step(1 / 60);
  return f;
}

// Launch speed so a ground ball (with a small hop) travels ~dist metres before stopping
export function groundVelocity(p0, angleDeg, dist, fx) {
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
export class Delivery {
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
export function samplePath(del, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) pts.push(del.pos(del.total * i / n)); return pts;
}
