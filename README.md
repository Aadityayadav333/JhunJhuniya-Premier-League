# JhunJhuniya Premier League  (3D cricket · Three.js)

## Run it
**Just double-click `index.html`** (Chrome / Edge / Firefox). Three.js is bundled in `lib/`, so it works offline with no server.
- Slow PC? open `index.html?lq=1` (shadows off).
- Editing the code: change files in `src/`, then run `python3 build.py` to regenerate `game.bundle.js`.
- Optional: `start.bat` / `start.sh` serve the folder at http://localhost:8000.

## Controls (batting, desktop)
| Key | Shot |
|---|---|
| X | Defend |
| C | Single (push) |
| SPACE | Drive (aims for 4) |
| V or ↑+SPACE | Loft (aims for 6) |
| ← → / A D | Aim direction (watch the radar) |
| R | Review (when prompted) · B = change camera |

Press the shot just before the ball reaches you (timing bar) — perfect / good / late / miss.

## Rules
- 3-star bowler: defend + singles only. Any 4/6 attempt = wicket.
- 2-star bowler: 4/6 is a gamble (~50/50, tweak `CONFIG.twoStarSuccess` in `src/data.js`).
- Unrated bowler: hit freely.
- Radar: red = crowded/unsafe zone, green = safe. Captain Goldclad advises every over.
- Computer batters score a random total inside their range (0-100 for Goldclad etc.), built from singles/twos/fours/sixes.
- Simp Gulley is always out first ball. 2 DRS reviews per team (LBW, with ball-tracking & Umpire's Call).
- When you bowl, pick a type, then lock LINE and LENGTH (click / SPACE).

## Commentary & audio
- Start screen (or the 🗣️ button in-game) lets you pick commentary: **Off / English / हिन्दी**. 🎵 toggles background music, 🔊 mutes everything.
- Commentary text shows on screen in the chosen language. Add your own mp3s and they are played instead of the browser voice:
  English `voice_<event>_1.mp3`, Hindi `hi_voice_<event>_1.mp3` (events: four, six, wicket, lbw, review, out, notout, simp, dot, defend, beaten, single, two, three, fifty, hundred, win, lose). Full list in `assets/audio/README.txt`.
- No mp3? The browser's text-to-speech reads the lines in `src/lines.js` (edit them freely). Hindi speech needs a Hindi voice on the device (most Android phones and Windows/Chrome have one).
- Sound effects and `bgm.mp3` (music loop) go in the same folder.

## Mobile
- Works on phones/tablets in a browser: landscape recommended (a rotate hint appears in portrait). ⛶ = fullscreen.
- Touch controls: big DEFEND / SINGLE / DRIVE / LOFT buttons; **drag a finger left/right on the screen** (or use the slider) to aim.
- Phones start in low-quality mode (no shadows) for smooth play; add `?hq=1` to the URL to force shadows on.

## Customising
- Players, ranges, looks, bowlers and tuning numbers: `src/data.js`
- Commentary lines: `src/lines.js` · Audio file names: `src/audio.js`
- Time of day (morning / evening / night) and weather (summer / cold / cloudy) are chosen on the start screen and change lighting, fog, floodlights and ball behaviour.
