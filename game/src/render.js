// render.js — DOM rendering: HUD, star chart, hands, legend, log, screens.
function el(id) { return document.getElementById(id); }

function drawStarsBg() {
  const cv = el('starsBg');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const rng = mulberry32(42);
  ctx.clearRect(0, 0, 1280, 800);
  for (let i = 0; i < 220; i++) {
    const x = rng() * 1280, y = rng() * 800, r = rng() * 1.6 + 0.4;
    ctx.globalAlpha = 0.25 + rng() * 0.65;
    ctx.fillStyle = rng() < 0.85 ? '#ffffff' : '#ffd75e';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function cardHtml(card, idx) {
  const unaff = card.cost > G.ember ? ' unaffordable' : '';
  const sel = G.selected === idx ? ' selected' : '';
  return '<div class="card suit-' + card.suit + sel + unaff + '" data-idx="' + idx + '">' +
    '<div class="cost">' + card.cost + '</div>' +
    '<div class="val">' + card.value + '</div>' +
    '<div class="suitic">' + card.icon + '</div>' +
    '<div class="suitname" style="color:' + card.color + '">' + card.suitName + '</div>' +
    '<div class="rule">' + card.rule + '<br><b>' + card.bonus + '</b></div>' +
    '<div class="key">' + (idx + 1) + '</div></div>';
}

function renderHand() {
  const hand = el('hand');
  hand.innerHTML = G.hand.map(cardHtml).join('');
  const foe = el('foeCards');
  let minis = '';
  for (let i = 0; i < Math.min(G.foeHandCount, 7); i++) minis += '<span class="minicard">✦</span>';
  foe.innerHTML = minis + ' <span style="font-size:13px;color:#ff9a9a">×' + G.foeHandCount + '</span>';
}

function renderChart() {
  const chart = el('chart');
  let html = '';
  for (let i = 0; i < 9; i++) {
    const s = G.chart[i];
    let cls = 'cell';
    let inner = '';
    if (s) {
      cls += s.owner === 'you' ? ' you' : ' foe';
      inner = '<span class="owner-tag">' + (s.owner === 'you' ? 'YOU' : 'ASTRAEA') + '</span>' +
        '<span class="starval">' + s.value + '</span>' +
        '<span class="starsuit">' + s.icon + '</span>';
    } else {
      cls += ' empty';
      if (G.selected >= 0 && G.phase === 'play') cls += ' armed';
      if (G.rivalPlan && G.rivalPlan.cell === i && G.phase === 'play') {
        inner = '<span class="ghost">?</span>';
      }
    }
    html += '<div class="' + cls + '" data-cell="' + i + '">' + inner + '</div>';
  }
  chart.innerHTML = html;
}

function renderHud() {
  el('lifeYou').textContent = G.life.you;
  el('lifeFoe').textContent = G.life.foe;
  el('shieldYou').textContent = G.shield.you > 0 ? '🛡' + G.shield.you : '';
  el('shieldFoe').textContent = G.shield.foe > 0 ? '🛡' + G.shield.foe : '';
  el('turnbox').textContent = 'Turn ' + G.turn;
  el('emberbox').textContent = '🔥 Ember ' + G.ember + ' / ' + MAX_EMBER;
  el('deckinfo').textContent = 'Deck ' + G.deck.length + ' · Discard ' + G.discard.length + ' · Chart ' + emptyCells().length + ' empty';
  // Telegraph lives in the chart subtitle line, right under THE STAR CHART,
  // so it can never cover the chart itself.
  const sub = el('chartsub');
  if (G.phase === 'play' && G.rivalPlan && !G.chart[G.rivalPlan.cell]) {
    sub.innerHTML = '⚠ <b style="color:#ff8080">ASTRAEA is eyeing cell ' + (G.rivalPlan.cell + 1) +
      ' — a ' + G.rivalPlan.card.suitName + ' ' + G.rivalPlan.card.value +
      ' star! Block it or brace!</b>';
  } else {
    sub.textContent = 'Both sides place stars here — complete a line to unleash its reward!';
  }
}

function renderLog() {
  el('log').innerHTML = G.log.map(function (l) { return '<div class="logline">' + l + '</div>'; }).join('');
}

function statsHtml() {
  return 'Turns played: <b>' + G.stats.turns + '</b> &nbsp;·&nbsp; Damage dealt: <b>' +
    G.stats.damageDealt + '</b> &nbsp;·&nbsp; Cards played: <b>' + G.stats.cardsPlayed +
    '</b> &nbsp;·&nbsp; Constellations completed: <b>' + G.stats.linesCompleted + '</b>';
}

function renderScreens() {
  el('titleScreen').classList.toggle('hidden', G.phase !== 'title');
  el('winScreen').classList.toggle('hidden', G.phase !== 'win');
  el('lossScreen').classList.toggle('hidden', G.phase !== 'loss');
  if (G.phase === 'win') el('winStats').innerHTML = statsHtml();
  if (G.phase === 'loss') el('lossStats').innerHTML = statsHtml();
  el('endTurnBtn').disabled = G.phase !== 'play';
}

function renderAll() {
  if (!G) return;
  renderHud();
  renderHand();
  renderChart();
  renderLog();
  renderScreens();
}

function floatDamage(text, x, y) {
  const f = el('dmgfloat');
  f.textContent = text;
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  f.style.display = 'block';
  setTimeout(function () { f.style.display = 'none'; }, 1200);
}
