// shots.js — deterministic ?shot= scene setups for the 4 screenshots.
// Each scene uses a fixed seed/state, no randomness, and sets window.__shotReady.

function presetCard(suit, value) {
  return makeCard(suit, value, 'shot-' + suit + '-' + value);
}

function setupCoverScene() {
  newGame(20261123);
  G.phase = 'play';
  G.turn = 7;
  G.life.you = 24; G.life.foe = 7;
  G.shield.you = 3;
  G.ember = 6;
  // Nearly-complete constellation: player owns row 1 (cells 0,1), rival owns cell 2's line threat.
  G.chart[0] = { owner: 'you', value: 9, suit: 'ember', icon: '🔥', color: '#e23b2e' };
  G.chart[1] = { owner: 'you', value: 7, suit: 'ember', icon: '🔥', color: '#e23b2e' };
  G.chart[3] = { owner: 'foe', value: 6, suit: 'tide', icon: '💧', color: '#2e7fe2' };
  G.chart[4] = { owner: 'foe', value: 8, suit: 'tide', icon: '💧', color: '#2e7fe2' };
  G.chart[6] = { owner: 'you', value: 4, suit: 'gale', icon: '🌀', color: '#2e9e4f' };
  G.chart[8] = { owner: 'foe', value: 5, suit: 'stone', icon: '⛰️', color: '#8a5a2e' };
  // Rival telegraphs cell 2 (the winning block) — red ? ghost.
  G.rivalPlan = { cell: 2, card: presetCard('tide', 9) };
  G.hand = [
    presetCard('ember', 9), presetCard('tide', 7), presetCard('stone', 8),
    presetCard('gale', 6), presetCard('ember', 5), presetCard('tide', 3),
  ];
  G.selected = 0; // the big Ember 9 is selected — the final star, mid-flight
  G.foeHandCount = 5;
  G.log = [
    '✦ You place a <b>EMBER 7</b> star on cell 2.',
    '✦ ASTRAEA places a <b>TIDE 8</b> star on cell 5.',
    '✦ <b>COLUMN complete!</b> You heal <b>6</b>.',
    '⚔ ASTRAEA\'s TIDE 8 deals <b>8</b> damage to you.',
    '— Turn <b>7</b>: +2 🔥 Ember, draw 2. —',
  ];
  renderAll();
  // The selected card flies toward the empty winning cell.
  const cardEls = document.querySelectorAll('#hand .card');
  if (cardEls[0]) {
    const fly = cardEls[0].cloneNode(true);
    fly.classList.add('flying');
    fly.style.left = '560px'; fly.style.top = '180px';
    document.getElementById('app').appendChild(fly);
  }
  floatDamage('-8', 880, 120);
  document.getElementById('callouts').classList.remove('hidden');
}

function setupTitleScene() {
  newGame(20261123);
  G.phase = 'title';
  renderAll();
}

function setupWinScene() {
  newGame(20261123);
  G.phase = 'play';
  G.life.foe = 0;
  G.stats.turns = 9; G.stats.damageDealt = 34; G.stats.cardsPlayed = 14; G.stats.linesCompleted = 3;
  endGame('win');
  renderAll();
}

function setupLossScene() {
  newGame(20261123);
  G.phase = 'play';
  G.life.you = 0;
  G.stats.turns = 11; G.stats.damageDealt = 22; G.stats.cardsPlayed = 16; G.stats.linesCompleted = 2;
  endGame('loss');
  renderAll();
}

function applyShot() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return false;
  if (shot === 'cover') setupCoverScene();
  else if (shot === 'title') setupTitleScene();
  else if (shot === 'win') setupWinScene();
  else if (shot === 'loss') setupLossScene();
  else return false;
  window.__shotReady = true;
  return true;
}
