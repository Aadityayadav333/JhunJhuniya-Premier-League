import { World } from './world.js';
import { UI } from './ui.js';
import { AudioManager } from './audio.js';
import { Game } from './game.js';
import './play.js';
import { buildTeams } from './data.js';

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
