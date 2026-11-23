// state.js — game state, turn flow and the star-chart rules.
const LINES = [
  { cells: [0, 1, 2], kind: 'row', label: 'ROW' },
  { cells: [3, 4, 5], kind: 'row', label: 'ROW' },
  { cells: [6, 7, 8], kind: 'row', label: 'ROW' },
  { cells: [0, 3, 6], kind: 'column', label: 'COLUMN' },
  { cells: [1, 4, 7], kind: 'column', label: 'COLUMN' },
  { cells: [2, 5, 8], kind: 'column', label: 'COLUMN' },
  { cells: [0, 4, 8], kind: 'diagonal', label: 'DIAGONAL' },
  { cells: [2, 4, 6], kind: 'diagonal', label: 'DIAGONAL' },
];
const MAX_LIFE = 30;
const MAX_EMBER = 10;

let G = null; // the live game state

function newGame(seed) {
  const deck = buildDeck(seed || 20261123);
  const hand = deck.splice(0, 6);
  const foeDeck = buildDeck((seed || 20261123) + 777);
  G = {
    seed: seed || 20261123,
    phase: 'title', // title | play | win | loss
    turn: 1,
    life: { you: MAX_LIFE, foe: MAX_LIFE },
    shield: { you: 0, foe: 0 },
    ember: 5,
    foeEmber: 5,
    deck: deck,
    foeDeck: foeDeck,
    hand: hand,
    foeHandCount: 6,
    discard: [],
    chart: [null, null, null, null, null, null, null, null, null],
    selected: -1, // index into hand, or -1
    rivalPlan: null, // {cell, card} telegraphed before it lands
    log: [],
    stats: { turns: 0, damageDealt: 0, cardsPlayed: 0, linesCompleted: 0, foeDamage: 0 },
    over: false,
  };
  addLog('The sky opens. <b>Place a star</b> to begin your pact.');
  return G;
}

function addLog(html) {
  if (!G) return;
  G.log.unshift(html);
  if (G.log.length > 7) G.log.length = 7;
}

function dealDamage(target, amount, source) {
  let left = amount;
  if (G.shield[target] > 0) {
    const absorbed = Math.min(G.shield[target], left);
    G.shield[target] -= absorbed;
    left -= absorbed;
    if (absorbed > 0) addLog('🛡 Shield absorbs <b>' + absorbed + '</b>.');
  }
  if (left > 0) {
    G.life[target] = Math.max(0, G.life[target] - left);
    if (target === 'foe') G.stats.damageDealt += left;
    else G.stats.foeDamage += left;
    addLog((source || '') + ' deals <b>' + left + '</b> damage to ' + (target === 'foe' ? 'ASTRAEA' : 'you') + '.');
  }
  checkEnd();
}

function heal(target, amount) {
  const before = G.life[target];
  G.life[target] = Math.min(MAX_LIFE, G.life[target] + amount);
  const healed = G.life[target] - before;
  if (healed > 0) addLog('✚ ' + (target === 'foe' ? 'ASTRAEA heals' : 'You heal') + ' <b>' + healed + '</b>.');
}

function drawCards(who, n) {
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (who === 'you') {
      if (G.deck.length === 0) { G.deck = G.discard.splice(0).reverse(); }
      if (G.deck.length === 0) break;
      if (G.hand.length >= 7) break;
      G.hand.push(G.deck.shift());
      drawn++;
    } else {
      if (G.foeDeck.length === 0) break;
      G.foeDeck.shift();
      if (G.foeHandCount < 7) G.foeHandCount++;
      drawn++;
    }
  }
  return drawn;
}

function emptyCells() {
  const out = [];
  for (let i = 0; i < 9; i++) if (!G.chart[i]) out.push(i);
  return out;
}

// A line is complete when all three cells hold stars of the SAME owner.
function findCompletedLines() {
  const done = [];
  for (const line of LINES) {
    const a = G.chart[line.cells[0]];
    const b = G.chart[line.cells[1]];
    const c = G.chart[line.cells[2]];
    if (a && b && c && a.owner === b.owner && b.owner === c.owner) {
      const sameSuit = a.suit === b.suit && b.suit === c.suit;
      done.push({ line: line, owner: a.owner, sameSuit: sameSuit });
    }
  }
  return done;
}

function applyLineReward(owner, line, sameSuit) {
  const kind = line.kind;
  let text = '';
  if (kind === 'row') {
    let dmg = 8 + (sameSuit ? 4 : 0);
    dealDamage(owner === 'you' ? 'foe' : 'you', dmg, '✦ ' + line.label + ' constellation');
    text = '✦ ' + line.label + ' complete! ' + (owner === 'you' ? 'You unleash' : 'ASTRAEA unleashes') + ' <b>' + dmg + ' damage</b>' + (sameSuit ? ' (same-suit +4!)' : '');
  } else if (kind === 'column') {
    let amount = 6 + (sameSuit ? 3 : 0);
    heal(owner, amount);
    text = '✦ ' + line.label + ' complete! ' + (owner === 'you' ? 'You heal' : 'ASTRAEA heals') + ' <b>' + amount + '</b>' + (sameSuit ? ' (same-suit +3!)' : '');
  } else {
    let n = 3 + (sameSuit ? 2 : 0);
    const drawn = drawCards(owner, n);
    text = '✦ ' + line.label + ' complete! ' + (owner === 'you' ? 'You draw' : 'ASTRAEA draws') + ' <b>' + drawn + ' cards</b>' + (sameSuit ? ' (same-suit +2!)' : '');
  }
  addLog(text);
  G.stats.linesCompleted++;
  return text;
}

function clearLine(line) {
  for (const i of line.cells) G.chart[i] = null;
}

// Place a card's star on a chart cell. Returns true on success.
function placeStar(owner, card, cell) {
  if (G.phase !== 'play' || G.over) return false;
  if (cell < 0 || cell > 8 || G.chart[cell]) return false;
  G.chart[cell] = { owner: owner, value: card.value, suit: card.suit, icon: card.icon, color: card.color };
  if (owner === 'you') {
    G.stats.cardsPlayed++;
    G.ember -= card.cost;
    G.hand.splice(G.hand.indexOf(card), 1);
    G.discard.push(card);
    let dmg = card.value + (card.suit === 'ember' ? 2 : 0);
    if (dmg > 0) dealDamage('foe', dmg, card.icon + ' ' + card.suitName + ' ' + card.value);
    if (card.suit === 'tide') heal('you', 2);
    if (card.suit === 'stone') { G.shield.you += 3; addLog('🛡 You gain <b>3 shield</b>.'); }
    if (card.suit === 'gale') drawCards('you', 1);
    addLog('✦ You place a <b>' + card.suitName + ' ' + card.value + '</b> star on cell ' + (cell + 1) + '.');
  } else {
    G.foeHandCount = Math.max(0, G.foeHandCount - 1);
    G.foeEmber -= card.cost;
    let dmg = card.value + (card.suit === 'ember' ? 2 : 0);
    if (dmg > 0) dealDamage('you', dmg, card.icon + ' ASTRAEA\'s ' + card.suitName + ' ' + card.value);
    if (card.suit === 'tide') heal('foe', 2);
    if (card.suit === 'stone') { G.shield.foe += 3; addLog('🛡 ASTRAEA gains <b>3 shield</b>.'); }
    if (card.suit === 'gale') drawCards('foe', 1);
    addLog('✦ ASTRAEA places a <b>' + card.suitName + ' ' + card.value + '</b> star on cell ' + (cell + 1) + '.');
  }
  if (G.over) return true;
  const done = findCompletedLines();
  for (const d of done) {
    applyLineReward(d.owner, d.line, d.sameSuit);
    clearLine(d.line);
    if (d.owner === 'you') sfxLine(); else sfxHit();
    if (G.over) break;
  }
  return true;
}

function checkEnd() {
  if (!G || G.over) return;
  if (G.life.foe <= 0) { endGame('win'); }
  else if (G.life.you <= 0) { endGame('loss'); }
}

function endGame(result) {
  G.over = true;
  G.phase = result === 'win' ? 'win' : 'loss';
  G.stats.turns = G.turn;
  if (result === 'win') { sfxWin(); addLog('★ <b>VICTORY!</b> The sky is yours.'); }
  else { sfxLose(); addLog('✦ <b>DEFEAT.</b> ASTRAEA outshines you.'); }
}

function startTurn() {
  // A full chart falls away and a new sky opens, so the game can never stall.
  if (emptyCells().length === 0) {
    G.chart = [null, null, null, null, null, null, null, null, null];
    addLog('✦ The chart is full — the stars fall and a <b>new sky</b> opens.');
  }
  G.turn++;
  G.ember = Math.min(MAX_EMBER, G.ember + 2);
  G.foeEmber = Math.min(MAX_EMBER, G.foeEmber + 2);
  drawCards('you', 2);
  drawCards('foe', 2);
  G.rivalPlan = planRivalMove();
  addLog('— Turn <b>' + G.turn + '</b>: +2 🔥 Ember, draw 2. —');
}

// Player ends the turn: the rival plays its telegraphed move, then a new turn starts.
function endTurn() {
  if (G.phase !== 'play' || G.over) return;
  G.selected = -1;
  rivalTakeTurn();
  if (G.over) return;
  startTurn();
  renderAll();
  checkEnd();
}
