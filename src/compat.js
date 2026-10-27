import * as THREE from 'three';
// Works with Three.js r149 (bundled in /lib) and r152+ / r160
export const REV = parseInt(THREE.REVISION, 10) || 160;
export const LI = REV >= 155 ? 1 : 1 / Math.PI;     // light intensity scale (legacy vs physical lights)
export const FLOOD = REV >= 155 ? 90 : 0.45;        // floodlight spot intensity
export function srgb(t) { if (REV >= 152) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; return t; }
