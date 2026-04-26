// ── Screen-Navigation ───────────────────────────────────────────
let history = ['list'];

function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

function goBack() {
  history.pop();
  const prev = history[history.length - 1];
  switchScreen(prev);
  if (prev === 'list') {
    document.getElementById('header-title').textContent = '🍲 Rezepte';
    document.getElementById('btn-back').style.display = 'none';
    updateBadge();
    updateFab();
  } else if (prev === 'shopping') {
    document.getElementById('header-title').textContent = '🛒 Einkaufsliste';
  }
}

function showDetail(name) {
  window.currentRecipe = window.allRecipes.find(r => r.Rezeptname === name);
  if (!window.currentRecipe) return;
  
  history.push('detail');
  renderDetail();
  switchScreen('detail');
  document.getElementById('header-title').textContent = '';
  document.getElementById('btn-back').style.display = 'flex';
  document.getElementById('header-badge').style.display = 'none';
}

function showShopping() {
  history.push('shopping');
  renderShopping();
  switchScreen('shopping');
  document.getElementById('header-title').textContent = '🛒 Einkaufsliste';
  document.getElementById('btn-back').style.display = 'flex';
  document.getElementById('header-badge').style.display = 'none';
}
