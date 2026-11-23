// cards.js — deck and card definitions for STARFALL PACT.
// Suits are told apart by colour AND shape (icon), never by text alone.
const SUITS = {
  ember: { name: 'EMBER', icon: '🔥', color: '#e23b2e', bonus: '+2 damage', rule: 'Deal value + 2 damage.' },
  tide:  { name: 'TIDE',  icon: '💧', color: '#2e7fe2', bonus: 'heal 2',    rule: 'Deal value damage. Heal 2.' },
  stone: { name: 'STONE', icon: '⛰️', color: '#8a5a2e', bonus: '+3 shield', rule: 'Deal value damage. Gain 3 shield.' },
  gale:  { name: 'GALE',  icon: '🌀', color: '#2e9e4f', bonus: 'draw 1',     rule: 'Deal value damage. Draw 1 card.' },
};
const SUIT_KEYS = ['ember', 'tide', 'stone', 'gale'];

// Seeded RNG (mulberry32) so shot scenes and playtests are deterministic.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCard(suit, value, id) {
  const s = SUITS[suit];
  return {
    id: id,
    suit: suit,
    suitName: s.name,
    icon: s.icon,
    color: s.color,
    value: value,
    cost: Math.max(1, Math.ceil(value / 3)),
    rule: s.rule,
    bonus: s.bonus,
  };
}

// 36-card deck: star values 1..9 in each of the 4 suits.
function buildDeck(seed) {
  const rng = mulberry32(seed || 20261123);
  const deck = [];
  let id = 0;
  for (const suit of SUIT_KEYS) {
    for (let v = 1; v <= 9; v++) deck.push(makeCard(suit, v, 'c' + (id++)));
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
  }
  return deck;
}

function suitBonusText(suit) { return SUITS[suit].bonus; }
