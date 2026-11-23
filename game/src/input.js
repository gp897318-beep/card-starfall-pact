// input.js — click + keyboard input.
function selectCard(idx) {
  if (G.phase !== 'play' || G.over) return;
  const card = G.hand[idx];
  if (!card) return;
  if (card.cost > G.ember) { addLog('Not enough 🔥 Ember for that star.'); renderLog(); return; }
  G.selected = (G.selected === idx) ? -1 : idx;
  sfxClick();
  renderAll();
}

function clickCell(cell) {
  if (G.phase !== 'play' || G.over) return;
  if (G.selected < 0) {
    addLog('Pick a card from your hand first, then a star cell.');
    renderLog();
    return;
  }
  const card = G.hand[G.selected];
  if (!card) { G.selected = -1; renderAll(); return; }
  if (G.chart[cell]) { addLog('That cell already holds a star.'); renderLog(); return; }
  const before = G.life.foe;
  const placed = placeStar('you', card, cell);
  if (!placed) return;
  G.selected = -1;
  sfxPlace();
  const dmg = before - G.life.foe;
  if (dmg > 0) floatDamage('-' + dmg, 640, 300);
  renderAll();
  checkEnd();
  if (G.phase === 'play') renderAll();
}

function bindInput() {
  document.getElementById('hand').addEventListener('click', function (e) {
    const cardEl = e.target.closest('.card');
    if (cardEl) selectCard(parseInt(cardEl.getAttribute('data-idx'), 10));
  });
  document.getElementById('chart').addEventListener('click', function (e) {
    const cellEl = e.target.closest('.cell');
    if (cellEl) clickCell(parseInt(cellEl.getAttribute('data-cell'), 10));
  });
  document.getElementById('endTurnBtn').addEventListener('click', function () {
    if (G.phase === 'play') { sfxClick(); endTurn(); renderAll(); }
  });
  document.getElementById('restartBtn').addEventListener('click', function () {
    newGame((Math.random() * 1e9) | 0);
    G.phase = 'play';
    G.rivalPlan = planRivalMove();
    renderAll();
  });
  document.getElementById('muteBtn').addEventListener('click', function () {
    const m = toggleMute();
    this.textContent = m ? 'SOUND: OFF (M)' : 'SOUND: ON (M)';
  });
  document.getElementById('startBtn').addEventListener('click', function () {
    G.phase = 'play';
    G.rivalPlan = planRivalMove();
    sfxPlace();
    renderAll();
  });
  document.getElementById('againWinBtn').addEventListener('click', function () { restartFresh(); });
  document.getElementById('againLossBtn').addEventListener('click', function () { restartFresh(); });
  document.addEventListener('keydown', function (e) {
    if (e.key >= '1' && e.key <= '7') selectCard(parseInt(e.key, 10) - 1);
    else if (e.key === ' ' || e.key === 'Enter') {
      if (G.phase === 'title') { G.phase = 'play'; G.rivalPlan = planRivalMove(); renderAll(); }
      else if (G.phase === 'play') { e.preventDefault(); endTurn(); renderAll(); }
    } else if (e.key === 'r' || e.key === 'R') { restartFresh(); }
    else if (e.key === 'm' || e.key === 'M') {
      const m = toggleMute();
      document.getElementById('muteBtn').textContent = m ? 'SOUND: OFF (M)' : 'SOUND: ON (M)';
    }
  });
}

function restartFresh() {
  newGame((Math.random() * 1e9) | 0);
  G.phase = 'play';
  G.rivalPlan = planRivalMove();
  renderAll();
}
