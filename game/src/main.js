// main.js — bootstrap + scripted autopilot used by playtests.
// Normal play: no ?shot=, the real game. ?shot= scenes are in shots.js.
window.addEventListener('DOMContentLoaded', function () {
  drawStarsBg();
  newGame(20261123);
  bindInput();
  if (!applyShot()) {
    renderAll();
    window.__shotReady = true;
  }
});

// Autopilot: play a full game with a seeded RNG. mode 'smart' plays well,
// mode 'weak' plays badly (low cards, never blocks) so a loss is reachable.
// Returns { result: 'win'|'loss'|'stuck', turns, damageDealt }.
window.__auto = function (seed, mode) {
  const rng = mulberry32(seed || 1);
  newGame(seed || 1);
  G.phase = 'play';
  G.rivalPlan = planRivalMove();
  renderAll();
  let guard = 0;
  while (!G.over && guard < 400) {
    guard++;
    // Player turn: place up to 2 cards while ember allows.
    let placed = 0;
    while (placed < 2 && !G.over) {
      const afford = G.hand.map(function (c, i) { return { c: c, i: i }; })
        .filter(function (x) { return x.c.cost <= G.ember; });
      if (!afford.length) break;
      afford.sort(function (a, b) {
        return mode === 'weak' ? a.c.value - b.c.value : b.c.value - a.c.value;
      });
      const pick = afford[0];
      let cell = -1;
      if (mode === 'weak') {
        const empt = emptyCells();
        cell = empt[Math.floor(rng() * empt.length)];
      } else {
        // Smart: complete own line first, else block rival, else best cell.
        cell = bestCellFor('you');
      }
      if (cell < 0) break;
      G.selected = pick.i;
      placeStar('you', pick.c, cell);
      placed++;
      if (G.over) break;
    }
    if (G.over) break;
    endTurn();
    renderAll();
  }
  return {
    result: G.phase === 'win' ? 'win' : (G.phase === 'loss' ? 'loss' : 'stuck'),
    turns: G.turn,
    damageDealt: G.stats.damageDealt,
    lifeYou: G.life.you,
    lifeFoe: G.life.foe,
  };
};
