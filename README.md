# PROJECT: JHUNJHUNIYA PREMIER LEAGUE — MOBILE 3D CRICKET GAME

Build a **mobile-first 3D cricket game that runs entirely in a mobile web browser**, in the same style and architecture as my earlier 3D browser game.

Use:
* HTML5, CSS3, Vanilla JavaScript
* Three.js + WebGL
* Web Audio API / HTML5 Audio for mp3 sound
* localStorage for saves
* No frameworks, no build step. Three.js must be bundled locally (vendor/three.min.js), no CDN.

Primary platform: Android and iOS phones in LANDSCAPE mode. Deploy as a static HTTPS website (Netlify). Do NOT design around mouse/keyboard (keyboard shortcuts are optional extras).

---------------------------------------------------------------
# 1. CORE CONCEPT
---------------------------------------------------------------
A 3D cricket game, "JhunJhuniya Premier League" (JPL). The person using the game is a player: they enter their NAME on the first screen and that name becomes the "New Player" in Team A (Legion Warriors). Two teams of 11. Every named character has a fixed score range, a look, and (for some) a bowling rating. The match is comedic and arcade-style but the RULES SYSTEM below must be implemented exactly.

---------------------------------------------------------------
# 2. GAME FLOW
---------------------------------------------------------------
Home → Enter Name → Match Setup → TOSS → Innings 1 → Innings break → Innings 2 → Result screen.

Match Setup screen: overs (default 5, options 2/5/10), theme (Morning / Evening / Night / Auto), weather (Summer / Cold / Cloudy / Rainy / Foggy / Random), graphics (Low/Medium/High, default Medium), sound on/off.

TOSS:
* Animated 3D coin flip with coin sound mp3.
* User calls Heads/Tails. Winner chooses Bat or Bowl. If the user's team loses the toss, the opposing bot picks randomly.
* Show a toss result card and a commentary voice line.

---------------------------------------------------------------
# 3. TEAMS (exact rosters)
---------------------------------------------------------------
Each batter has a SCORE RANGE (min 0, max shown). Each bowler has a STAR RATING (3-star, 2-star, or unrated) and a bowling style.

## TEAM A — LEGION WARRIORS
1. Goldclad (Captain) — range 0–100 — stylish long hair with animated hair movement, tall, slight beard
2. Kaushik Ji — 0–20 — ordinary guy
3. Mensation — 0–20 — stylish guy
4. Brofessor — 0–50 — dark caped-vigilante getup with a bat-style mask, muscular (ORIGINAL design, do not copy any studio's exact costume)
5. Mick — 0–30 — long hair, no beard
6. Desi Kaali Goli — 0–20 — completely black silhouette character, no facial features
7. Nachi Bhai — 0–50 — handsome, curly hair, beard
8. Hemant — 0–35 — simple guy with a moustache
9. Gaurav Bhati — 0–50 — tall, good beard
10. Zulfiqar — 0–10 — elderly, white beard, traditional cap
11. NEW PLAYER (the user's registered name) — NO score limit — normal look

Team A bowlers:
* Hemant — 2-star, fast
* Gaurav Bhati — 2-star, fast
* Zulfiqar — fast, LEFT-arm (unrated)
* New Player — user chooses style (fast / medium / spin) at setup
* Nachi Bhai — 3-star, right-arm fast

## TEAM B — MATRIX DEFENDERS
1. Nidhi Dalli — 0–10 — girl character
2. Awkward Bakri — 0–25 — cartoon goat character
3. Bango Daddu — 0–20 — old "boomer" uncle look
4. Simp Gulley — SPECIAL RULE: always dismissed on his first ball no matter what (slapstick comedy animation where the ball hits him and he collapses; keep it cartoonish) — nerd look
5. Agent S. — 0–50 — suited agent in sunglasses and earpiece (original design, not the film character)
6. The Illuminati — 0–60 — strange guy with a single eye (triangle-hat/one-eye look)
7. NPC — 0–20 — character who always looks like he is laughing
8. Bearded Sage — 0–30 — white-bearded older guy (placeholder name, rename freely)
9. Candid Exchange — 0–40 — normal player look
10. Professor Chashma — 0–25 — glasses, looks like a teacher (placeholder name, rename freely)
11. Baal — 0–100 — looks like a devil (horns, red skin, tail — cartoon, not scary)

Team B bowlers:
1. Bearded Sage — range 0–30 (bowling rating: 2-star)
2. Candid Exchange — range 0–40 (unrated)
3. Professor Chashma — range 0–25 (unrated)
4. Baal — range 0–100 (3-star)
(The star ratings for Team B bowlers are my defaults — make them configurable in one data file.)

Put ALL player data (name, team, range, look params, bowler rating, style) in a single easily-editable object (data/players.js or top of game.js).

---------------------------------------------------------------
# 4. SCORE RANGE SYSTEM
---------------------------------------------------------------
* When a batter walks in, roll targetRuns = random integer between 0 and their range max (inclusive). That is the MAXIMUM they can score this innings.
* Runs come from actual shots (singles, twos, fours, sixes). When the batter reaches targetRuns, they get out on a natural-looking dismissal at the next opportunity (caught, bowled, LBW, run out).
* A target of 0 means out on the first or second ball.
* The USER's batter (when the user is controlling the striker) is also bound by the range of whichever character is on strike. The "New Player" has NO limit.
* Make this configurable: "Strict" (hard cap) or "Soft" (cap applies but a 10% chance to survive extra balls).
* Show each batter's range on a small card when they come to the crease.

---------------------------------------------------------------
# 5. BOWLER STAR RULES (CORE GAMEPLAY — IMPLEMENT EXACTLY)
---------------------------------------------------------------
When the USER is batting, rules depend on the bowler's rating:

## 3-STAR BOWLER
* The batter must DEFEND. Only dot balls and SINGLES are possible.
* If the user attempts a 4 or a 6 (aggressive shot), they are ALWAYS out — LBW, caught, or bowled (pick the one that fits the shot direction/timing).

## 2-STAR BOWLER
* Risk/reward. When the user plays an aggressive shot, roll the dice: default 50% chance of a successful 4/6, 50% chance of wicket (caught / LBW). Probabilities configurable.
* Defensive shots and singles are safe. The game hints it is "better to avoid 4s and 6s".

## UNRATED BOWLER
* The user can attack brutally. Aggressive shots succeed with high probability (default 90%+), boundaries are frequent.

When the BOTS bat (the user is bowling), outcomes are decided by the same star logic applied in reverse (a 3-star bowler is very hard to score against: mostly dots/singles with wicket chances; unrated bowlers get hit for boundaries), always still obeying each batter's score range.

---------------------------------------------------------------
# 6. SMART SAFE-ZONE ADVISOR
---------------------------------------------------------------
Fielders are placed around the 3D ground (set field changes every over or when the captain "sets the field").
* A small HUD radar / mini field map shows fielders and colours each zone: GREEN = safe, YELLOW = risky, RED = dangerous (crowded with fielders).
* An advisor message + optional voice line warns the user, e.g. "Leg side is packed — avoid it!", "Gap on the off side, go there for a single."
* Hitting aggressively into a RED zone raises the chance of a catch dismissal; hitting into a GREEN gap makes boundaries easier (when the bowler's star rule allows).
* Fielder positions must really affect the shot result (not only visuals).

---------------------------------------------------------------
# 7. STRIKER / NON-STRIKER & RUNNING
---------------------------------------------------------------
* Two batters on the pitch at all times: striker and non-striker. Both are visible in 3D.
* The non-striker is a BOT. The user controls only the striker.
* Taking an odd number of runs (1 or 3) swaps ends — the striker becomes the non-striker. Show the running animation for both batters.
* End of over: strike rotates automatically.
* Optional: call-and-run indicator ("Run!" / "Stay!") for tight singles; a run-out chance on risky runs.

---------------------------------------------------------------
# 8. BATTING CONTROLS (MOBILE)
---------------------------------------------------------------
* Large touch buttons or swipe gestures:
  - Direction: swipe or pad to choose shot direction (off side / straight / leg side / etc.)
  - Shot type buttons: DEFEND, SINGLE (nudge), DRIVE, PULL/HOOK, LOFT (aggressive)
  - Timing: tap at the right moment as the ball arrives (timing window affects result)
* Do not interfere with normal phone scrolling gestures unnecessarily; lock page scroll while playing.
* Controls must be readable and large (high contrast, no tiny buttons).

BOWLING (when the user's team bowls):
* Pick the bowler from the list (respect the over limit per bowler: max overs / 5 by default).
* Choose line and length on a pitch overlay, choose speed (fast/medium/slow) or spin direction, tap to release.
* Bot batters respond using their range, targetRuns and the star rules.

---------------------------------------------------------------
# 9. MATCH RULES
---------------------------------------------------------------
* 6 legal balls per over; overs configurable. 10 wickets, innings ends when all out or overs finish.
* Extras (optional toggle): wides, no-balls with free hit.
* Chase: second innings has a target; show required run rate and balls left.
* Dismissals: bowled, caught, LBW, run out, stumped. Each needs a 3D animation and umpire signal.
* Result screen: winner, margin, top scorer, best bowler, and "Player of the Match".

---------------------------------------------------------------
# 10. THEMES (TIME OF DAY)
---------------------------------------------------------------
* MORNING: bright warm light, long soft shadows, light mist, blue sky.
* EVENING: golden/orange sunset sky, low sun, long dramatic shadows.
* NIGHT: dark sky, floodlights ON (visible light towers), stadium glow, moon/stars, bright ball visibility trick.
* Auto: picks by device clock.
Implement with lighting colours/intensity, sky colour, fog colour, and light-tower emissive materials. Theme switch must work from Settings.

---------------------------------------------------------------
# 11. WEATHER
---------------------------------------------------------------
* SUMMER: bright sun, heat shimmer, dry pitch → more bounce/pace, slightly higher batting scoring chances.
* COLD: pale light, visible breath fog / mist particles, players in jackets/caps (optional), swing-friendly → slightly harder to bat.
* CLOUDY: grey sky, soft light, ball swings more → bowlers get a small bonus.
* RAINY: rain particle system, wet-pitch sound; slippery fielding (more misfields); optional short rain-delay screen.
* FOGGY: reduced visibility (fog distance) — use fog only as a visual and mild difficulty effect.
Weather effects must be lightweight (particles, fog, lighting). Weather + theme combine freely (e.g. Cold + Night).

---------------------------------------------------------------
# 12. AUDIO (MP3 VOICE EFFECTS)
---------------------------------------------------------------
Use mp3 files in assets/audio/. Load them via Web Audio/HTML5 Audio, preload essentials, and handle mobile autoplay rules (unlock audio on the first user tap).

Required sound list (file names are suggestions):
* ui_click.mp3, intro_music.mp3, toss_coin.mp3
* ambience_crowd_loop.mp3 (louder on boundaries/wickets)
* bat_hit_light.mp3, bat_hit_hard.mp3, ball_bounce.mp3, stumps_hit.mp3
* cheer_four.mp3, cheer_six.mp3, appeal.mp3, wicket_celebration.mp3, umpire_out.mp3
* weather loops: rain_loop.mp3, wind_loop.mp3
* COMMENTARY voice lines (3 variants each so it doesn't repeat): toss_won, four, six, wicket, dot_ball, single, over_complete, milestone_10/20/50/100, win, loss, danger_zone_leg_side, danger_zone_off_side, bowler_3star_warning, bowler_2star_warning, simp_gulley_first_ball (comedy)
Requirements:
* Master volume + separate music/effects/commentary sliders and a mute button.
* The game MUST still run if an mp3 is missing: fall back silently, or use the browser speechSynthesis API for commentary text.
* I will supply or generate the mp3 files; create the folder structure with a placeholder list (assets/audio/README.txt listing every filename expected).
* Keep total audio size mobile-friendly (compress, mono where possible).

---------------------------------------------------------------
# 13. 3D VISUALS & CHARACTERS
---------------------------------------------------------------
* Stadium: pitch, outfield, boundary rope, stands with simple crowd (instanced billboards/low-poly), scoreboard screen, light towers, sight screens.
* Low-poly stylised characters built from primitives (same approach as my earlier game): body, head, limbs, hair, beard, mask, horns, glasses, cap, etc. per the look descriptions in section 3. Team A kit colour vs Team B kit colour.
* Animations: batting stance, defend, drive, pull, loft, run between wickets, bowling run-up and delivery, fielder dive/catch/throw, wicket celebration, umpire signals (out, four, six), hair movement for Goldclad.
* Ball physics: simple but believable trajectory (pitch bounce, swing, spin), trail effect on fast shots.
* Camera: behind-the-bowler batting view by default, smooth follow of the ball after the shot, replay camera for wickets and sixes.
* Mobile performance: low-poly, instancing for crowd, limited shadows, graphics quality setting (Low/Medium/High), 30+ fps target on normal phones.

---------------------------------------------------------------
# 14. UI
---------------------------------------------------------------
* Live scoreboard (score/wickets, overs, run rate, target), current striker/non-striker with runs/balls.
* This-over ball tracker (dots, 1, 4, 6, W).
* Batter intro card showing the score range.
* Bowler card showing star rating (★★★ / ★★ / none) and style.
* Mini field map with colour-coded safe zones.
* Full scorecard screen, wagon wheel after the innings (optional).
* Everything readable on a phone in landscape.

---------------------------------------------------------------
# 15. SAVE & PRIVACY
---------------------------------------------------------------
* localStorage: player name, settings (theme, weather, graphics, volumes), match history/best scores.
* No location needed, no server calls, no analytics. Do not store anything sensitive.

---------------------------------------------------------------
# 16. FILE STRUCTURE
---------------------------------------------------------------
index.html, style.css, game.js (logically modular), data/players.js, vendor/three.min.js, assets/audio/ (mp3 + README list), assets/textures/ (optional). A simple prototype may keep everything in index.html + style.css + game.js, but keep the code organised into clear sections: Data, Audio, Weather/Theme, Characters, Field & Fielding AI, Batting Engine, Bowling Engine, Rules Engine (star rules + score range), Match Flow, UI, Save.

---------------------------------------------------------------
# 17. DEVELOPMENT ORDER (DO NOT BUILD EVERYTHING AT ONCE)
---------------------------------------------------------------
PHASE 1: Mobile landscape UI, Three.js stadium, pitch, basic characters, camera.
PHASE 2: Name entry, match setup, toss, innings flow, scoreboard.
PHASE 3: Batting engine (controls, shots, timing), striker/non-striker, running between wickets.
PHASE 4: Rules engine — star-rating rules, score ranges, dismissals, Simp Gulley rule.
PHASE 5: Fielding, safe-zone advisor, field placements, catches.
PHASE 6: Bowling mode for the user's team + bot batters.
PHASE 7: Themes (morning/evening/night) and weather.
PHASE 8: Audio system and commentary.
PHASE 9: Full character looks/animations, replays, polish, performance, saves.

FIRST DELIVERABLE: a fully working playable prototype of ONE match (user bats first against the Team B bowlers with the star rules, score ranges, striker/non-striker, safe-zone hints, one theme, one weather, and basic sounds) before adding the rest.

---------------------------------------------------------------
# FINAL REQUIREMENTS
---------------------------------------------------------------
* Write real, working, production-quality code — no pseudocode where implementation is possible.
* The rules in sections 4, 5 and 6 are the heart of the game: implement them precisely and make the probabilities configurable in one place.
* Mobile-first, landscape, touch controls, responsive, battery-conscious.
* Deliver a ZIP I can open, run (localhost) and deploy to Netlify. Include only ONE short README with run/deploy instructions.
