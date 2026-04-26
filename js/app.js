// ── State Management ──────────────────────────────────────
const DATA_FILES = [
  { file: './data/d2_mealprep.json',    label: 'Mealprep' },
  { file: './data/d6_brotzeit.json',    label: 'Brotzeit' },
  { file: './data/d7_finedining.json',  label: 'Fine Dining' },
  { file: './data/d3_snacks.json',      label: 'Snacks' },
  { file: './data/d4_fruehstueck.json', label: 'Frühstück' },
  { file: './data/d5_backen.json',      label: 'Backen' }
];

let allRecipes = [];
let categories = [];
let mapping = {};
let selected = new Set(JSON.parse(localStorage.getItem('selected') || '[]'));
let persons = parseInt(localStorage.getItem('persons') || '2');
let currentRecipe = null;
let history = ['list'];

// ── Hauptinitialisierung ───────────────────────────────────
async function init() {
  try {
    const { mapping, categories } = await loadData();
    window.mapping = mapping;
    window.categories = categories;
    window.allRecipes = categories.flatMap(c => c.recipes);
    
    dataQuality(window.allRecipes, window.mapping);
    renderList();
    updateBadge();
  } catch(e) {
    document.getElementById('list-container').innerHTML =
      '<div class="loading">Fehler beim Laden der Daten.</div>';
  }
}

// ── State Update Functions ─────────────────────────────────
function saveSelected() {
  localStorage.setItem('selected', JSON.stringify([...selected]));
}

function updateBadge() {
  const badge = document.getElementById('header-badge');
  badge.textContent = selected.size;
  badge.style.display = selected.size > 0 && history[history.length-1] === 'list' ? 'block' : 'none';
}

function updateFab() {
  const fab = document.getElementById('fab-bar');
  fab.className = 'fab-bar' + (selected.size > 0 ? ' visible' : '');
}

// ── Event Handlers ───────────────────────────────────────────
function clearSelection() {
  selected.clear();
  saveSelected();
  document.querySelectorAll('.checkbox.checked').forEach(el => el.classList.remove('checked'));
  updateBadge();
  updateFab();
}

function changePersons(delta) {
  persons = Math.max(1, Math.min(10, persons + delta));
  localStorage.setItem('persons', persons);
  document.getElementById('persons-count').textContent = persons;
  renderShopping();
}

// ── Service Worker ───────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// ── Bootstrap ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
