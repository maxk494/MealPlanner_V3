// ── State Management ──────────────────────────────────────

let allRecipes = [];
let categories = [];
let mapping = {};
let selected = new Set(JSON.parse(localStorage.getItem('selected') || '[]'));
let persons = parseInt(localStorage.getItem('persons') || '2');
let currentRecipe = null;

// ── Hauptinitialisierung ───────────────────────────────────
async function init() {
  try {
    const { mapping, categories } = await loadData();
    window.mapping = mapping;
    window.categories = categories;
    window.allRecipes = categories.flatMap(c => c.recipes);
    window.selected = selected;
    
    renderList();
    updateBadge();
  } catch(e) {
    console.error('Fehler beim Laden der Daten:', e);
  }
}

// ── State Update Functions ─────────────────────────────────
function saveSelected() {
  localStorage.setItem('selected', JSON.stringify([...selected]));
}

function updateBadge() {
  const badge = document.getElementById('header-badge');
  badge.textContent = window.selected.size;
  badge.style.display = window.selected.size > 0 && history[history.length-1] === 'list' ? 'block' : 'none';
}

function updateFab() {
  const fab = document.getElementById('fab-bar');
  fab.className = 'fab-bar' + (window.selected.size > 0 ? ' visible' : '');
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
