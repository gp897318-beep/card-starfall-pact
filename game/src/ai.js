// ai.js — ASTRAEA, the rival stargazer. Her choices are readable and counterable:
// she telegraphs her next cell (a red ? ghost) a full turn before she plays it,
// so you can block her constellation by taking that cell first.

// Score a cell for an owner: completing a line is best, blocking the enemy next.
function scoreCellFor(owner, cell) {
  const enemy = owner === 'you' ? 'foe' : 'you';
  let score = 0;
  for (const line of LINES) {
    if (line.cells.indexOf(cell) < 0) continue;
    let mine = 0, theirs = 0, empty = 0;
    for (const i of line.cells) {
      const s = G.chart[i];
      if (!s) empty++;
      else if (s.owner === owner) mine++;
      else theirs++;
    }
    if (mine === 2 && empty === 1) score += 100; // complete my line
    if (theirs === 2 && empty === 1) score += 90; // block their line
    if (mine === 1 && theirs === 0) score += 12;
    if (theirs === 1 && mine === 0) score += 6;
    if (line.kind === 'row') score += 4; // rows pay damage
    if (cell === 4) score += 5; // centre is the key star
  }
  return score;
}

function bestCellFor(owner) {
  const empties = emptyCells();
  if (!empties.length) return -1;
  let best = empties[0], bestScore = -1;
  for (const c of empties) {
    const s = scoreCellFor(owner, c);
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return best;
}

// Pick a rival card: the strongest she can afford, preferring Ember for damage.
function pickRivalCard() {
  const affordable = [];
  // Simulate a small rival hand from her deck values: draw from foeDeck top as her hand.
  const hand = [];
  for (let i = 0; i < Math.min(G.foeHandCount, 6); i++) {
    hand.push(G.foeDeck[i] || makeCard('ember', 5, 'rival' + i));
  }
  for (const c of hand) if (c.cost <= G.foeEmber) affordable.push(c);
  if (!affordable.length) return null;
  affordable.sort((a, b) => {
    const va = a.value + (a.suit === 'ember' ? 2 : 0);
    const vb = b.value + (b.suit === 'ember' ? 2 : 0);
    return vb - va;
  });
  return affordable[0];
}

// The telegraphed plan: computed at the start of the player's turn, shown as a
// red ? ghost on the chart and a banner, so the player can block it.
function planRivalMove() {
  const cell = bestCellFor('foe');
  if (cell < 0) return null;
  const card = pickRivalCard();
  if (!card) return null;
  return { cell: cell, card: card };
}

function rivalTakeTurn() {
  if (G.over) return;
  let plan = G.rivalPlan;
  // If the player blocked her planned cell, she re-plans (visibly).
  if (!plan || G.chart[plan.cell]) {
    const cell = bestCellFor('foe');
    const card = pickRivalCard();
    if (cell < 0 || !card) { addLog('ASTRAEA passes — the chart is full of stars.'); return; }
    plan = { cell: cell, card: card };
    addLog('ASTRAEA re-plans her star…');
  }
  // Remove the played card from her simulated hand (top of foeDeck).
  const idx = G.foeDeck.indexOf(plan.card);
  if (idx >= 0) G.foeDeck.splice(idx, 1);
  placeStar('foe', plan.card, plan.cell);
  G.rivalPlan = null;
  if (G.over) return;
  // ASTRAEA sometimes plays a second, weaker star when she has ember to spare.
  if (G.foeEmber >= 2 && emptyCells().length > 0 && Math.random() < 0.5) {
    const cell2 = bestCellFor('foe');
    const card2 = pickRivalCard();
    if (cell2 >= 0 && card2 && card2.cost <= G.foeEmber) {
      const idx2 = G.foeDeck.indexOf(card2);
      if (idx2 >= 0) G.foeDeck.splice(idx2, 1);
      placeStar('foe', card2, cell2);
    }
  }
}
