// ============================================================
//  JhunJhuniya Premier League - game data & tunable config
// ============================================================
export const CONFIG = {
  twoStarSuccess: 0.5,      // base chance a 4/6 attempt works vs a 2-star bowler
  unratedOutChance: 0.07,   // base dismissal chance vs unrated bowlers on a big shot
  crowdedZonePenalty: 0.28, // extra danger when hitting into a crowded zone
  reviewsPerTeam: 2,
  lbwUmpireAccuracy: 0.8,
  runTime: 1.35,            // seconds per run animation
  swingPerfect: 0.05, swingGood: 0.11, swingLate: 0.2, // timing windows (s)
};

export const TEAMS = {
  A: { key: 'A', name: 'Legion Warriors', short: 'LGW', color: 0xd32f2f, css: '#e53935' },
  B: { key: 'B', name: 'Matrix Defenders', short: 'MXD', color: 0x1e5bd8, css: '#2f7bff' },
};

// look keys: skin, hair(short|long|curly|quiff|bald|pony|side|none), hairC, beard(0..1.6), beardC,
// stache, glasses(round|rect|shades), sp(special), h(height), bulk(build), belly
// bowl: {type: fast|spin|leg|off|carrom, stars: 0-3, hand: 'R'|'L'}
export function buildTeams(userName) {
  const A = [
    { id: 'you', name: userName || 'New Player', max: Infinity, isUser: true, role: 'You',
      look: { skin: 0xc89b76, hair: 'short', hairC: 0x1a1a1a }, bowl: { type: 'fast', stars: 0, hand: 'R' } },
    { id: 'gold', name: 'Goldclad', role: 'Captain', max: 100,
      look: { skin: 0xc68a5a, hair: 'long', hairC: 0xd9a416, beard: 0.45, beardC: 0x6b4a14, h: 1.1 } },
    { id: 'brof', name: 'Brofessor', max: 50, look: { sp: 'batman', skin: 0xd9ad8a, bulk: 1.3, h: 1.05 } },
    { id: 'nachi', name: 'Nachi Bhai', max: 50, bowl: { type: 'fast', stars: 3, hand: 'R' },
      look: { skin: 0xd2a07a, hair: 'curly', hairC: 0x1b1210, beard: 0.7, beardC: 0x1b1210 } },
    { id: 'gaurav', name: 'Gaurav Bhati', max: 50, bowl: { type: 'fast', stars: 2, hand: 'R' },
      look: { skin: 0xbf8b62, hair: 'short', hairC: 0x111111, beard: 0.8, beardC: 0x151515, h: 1.17, bulk: 1.1 } },
    { id: 'hemant', name: 'Hemant', max: 35, bowl: { type: 'fast', stars: 2, hand: 'R' },
      look: { skin: 0xc99c78, hair: 'side', hairC: 0x2a1c12, stache: true } },
    { id: 'mick', name: 'Mick', max: 30, look: { skin: 0xe3b693, hair: 'long', hairC: 0x4a2f1b } },
    { id: 'kaushik', name: 'Kaushik Ji', max: 20, look: { skin: 0xc29a7a, hair: 'short', hairC: 0x222222 } },
    { id: 'mens', name: 'Mensation', max: 20, look: { skin: 0xe0b08c, hair: 'quiff', hairC: 0x0e0e0e, glasses: 'shades', beard: 0.2, beardC: 0x111111 } },
    { id: 'kaali', name: 'Desi Kaali Goli', max: 20, look: { sp: 'blank' } },
    { id: 'zulfi', name: 'Zulfiqar', max: 10, bowl: { type: 'fast', stars: 0, hand: 'L' },
      look: { sp: 'skullcap', skin: 0xc79a74, beard: 1.5, beardC: 0xf2f2f2, bulk: 0.95, h: 0.97 } },
  ];
  const B = [
    { id: 'nidhi', name: 'Nidhi Dalli', max: 10, look: { sp: 'girl', skin: 0xe8bb9a, hair: 'pony', hairC: 0x1a0f0a, h: 0.93 } },
    { id: 'bakri', name: 'Awkward Bakri', max: 25, bowl: { type: 'spin', stars: 0, hand: 'R' }, look: { sp: 'goat' } },
    { id: 'smith', name: 'Agent Smith', max: 50, bowl: { type: 'fast', stars: 2, hand: 'R' },
      look: { sp: 'agent', skin: 0xe6c3a4, hair: 'short', hairC: 0x111111, glasses: 'shades', h: 1.08 } },
    { id: 'baal', name: 'Baal', max: 100, bowl: { type: 'carrom', stars: 3, hand: 'R' }, look: { sp: 'devil', h: 1.12, bulk: 1.15 } },
    { id: 'illu', name: 'Illuminati', max: 60, look: { sp: 'cyclops', skin: 0xb9a98c, hair: 'bald' } },
    { id: 'candid', name: 'Candid Exchange', max: 40, look: { skin: 0xd1a07b, hair: 'short', hairC: 0x3a2a1d } },
    { id: 'daddu', name: 'Bango Daddu', max: 20, look: { sp: 'boomer', skin: 0xe2b99b, hair: 'bald', hairC: 0xdddddd, belly: 1, stache: true, h: 0.96 } },
    { id: 'gulley', name: 'Simp Gulley', max: 0, simp: true, look: { sp: 'nerd', skin: 0xf0cfb0, hair: 'side', hairC: 0x3b2a1a, glasses: 'round', h: 0.95, bulk: 0.85 } },
    { id: 'npc', name: 'NPC', max: 20, look: { sp: 'laugh', skin: 0xd8ae8a, hair: 'short', hairC: 0x2d2d2d } },
    { id: 'acharya', name: 'Acharya Ji', max: 30, bowl: { type: 'leg', stars: 2, hand: 'R' },
      look: { skin: 0xe4bc9c, hair: 'long', hairC: 0xf0f0f0, beard: 1.2, beardC: 0xf4f4f4, h: 1.02 } },
    { id: 'vikas', name: 'Vikas Sir', max: 25, bowl: { type: 'off', stars: 0, hand: 'R' },
      look: { skin: 0xcf9f78, hair: 'side', hairC: 0x2b2118, glasses: 'rect', stache: true } },
  ];
  A.forEach(p => { p.team = 'A'; });
  B.forEach(p => { p.team = 'B'; });
  const byId = (arr, id) => arr.find(p => p.id === id);
  const order = {
    A: ['you', 'gold', 'brof', 'nachi', 'gaurav', 'hemant', 'mick', 'kaushik', 'mens', 'kaali', 'zulfi'].map(i => byId(A, i)),
    B: ['nidhi', 'bakri', 'smith', 'baal', 'illu', 'candid', 'daddu', 'gulley', 'npc', 'acharya', 'vikas'].map(i => byId(B, i)),
  };
  const bowlers = {
    A: ['hemant', 'nachi', 'zulfi', 'you', 'gaurav'].map(i => byId(A, i)),
    B: ['smith', 'vikas', 'baal', 'acharya', 'bakri'].map(i => byId(B, i)),
  };
  const keeper = { A: byId(A, 'kaushik'), B: byId(B, 'candid') };
  return { A, B, order, bowlers, keeper };
}

export const TIMES = {
  morning: { label: 'Morning', icon: '🌅' },
  evening: { label: 'Evening', icon: '🌇' },
  night: { label: 'Night', icon: '🌙' },
};
export const WEATHERS = {
  summer: { label: 'Summer', icon: '☀️' },
  cold: { label: 'Cold', icon: '❄️' },
  cloudy: { label: 'Cloudy', icon: '☁️' },
};
// weather effect on ball physics
export const WEATHER_FX = {
  summer: { swing: 0.6, bounce: 0.55, roll: 2.2, turn: 1.15 },
  cold: { swing: 1.1, bounce: 0.5, roll: 3.0, turn: 0.85 },
  cloudy: { swing: 1.6, bounce: 0.52, roll: 2.7, turn: 1.0 },
};
