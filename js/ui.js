// ── UI-Rendering und DOM-Manipulation ───────────────────────────────

// ── Rezeptliste ─────────────────────────────────────────────
function renderList() {
  const container = document.getElementById('list-container');
  container.innerHTML = '';

  window.categories.forEach((cat, ci) => {
    const div = document.createElement('div');
    div.className = 'category open';
    div.innerHTML = `
      <div class="category-header" onclick="toggleCategory(this)">
        <span class="category-title">
          ${catEmoji(cat.label)} ${cat.label}
          <span class="category-count">${cat.recipes.length}</span>
        </span>
        <span class="category-arrow">▾</span>
      </div>
      <div class="category-items">
        ${cat.recipes.map(r => recipeRow(r)).join('')}
      </div>`;
    container.appendChild(div);
  });
  updateFab();
}

function catEmoji(label) {
  const map = { 'Mealprep':'🥡', 'Brotzeit':'🍞', 'Fine Dining':'🍽️', 'Snacks':'🥜', 'Frühstück':'🌅', 'Backen':'🧁' };
  return map[label] || '🍲';
}

function recipeRow(r) {
  const selected = new Set(JSON.parse(localStorage.getItem('selected') || '[]'));
  const isChecked = selected.has(r.Rezeptname);
  return `
    <div class="recipe-row">
      <div class="recipe-check" onclick="toggleSelect(event, '${esc(r.Rezeptname)}')">
        <div class="checkbox ${isChecked ? 'checked' : ''}" id="cb-${esc(r.Rezeptname)}"></div>
      </div>
      <div class="recipe-info" onclick="showDetail('${esc(r.Rezeptname)}')">
        <div class="recipe-name">${r.Rezeptname}</div>
        <div class="recipe-macros">${r.Kalorien} kcal · ${r.Proteine}g Protein</div>
      </div>
      <div class="recipe-tap" onclick="showDetail('${esc(r.Rezeptname)}')">›</div>
    </div>`;
}

function esc(s) { return s.replace(/'/g, "\\'"); }

function toggleCategory(header) {
  header.parentElement.classList.toggle('open');
}

// ── Selektion ─────────────────────────────────────────────
function toggleSelect(e, name) {
  e.stopPropagation();
  const selected = new Set(JSON.parse(localStorage.getItem('selected') || '[]'));
  
  if (selected.has(name)) { selected.delete(name); }
  else { selected.add(name); }
  
  localStorage.setItem('selected', JSON.stringify([...selected]));
  window.selected = selected;
  
  const cb = document.getElementById('cb-' + name);
  if (cb) cb.className = 'checkbox ' + (selected.has(name) ? 'checked' : '');
  
  updateBadge();
  updateFab();
}

// ── Rezeptdetail ───────────────────────────────────────────
function renderDetail() {
  const r = window.currentRecipe;
  document.getElementById('detail-container').innerHTML = `
    <div class="macro-grid">
      <div class="macro-card">
        <div class="macro-label">Kalorien</div>
        <div class="macro-value">${r.Kalorien}<span style="font-size:13px;font-weight:400;color:var(--text-muted)"> kcal</span></div>
      </div>
      <div class="macro-card highlight">
        <div class="macro-label">Proteine</div>
        <div class="macro-value">${r.Proteine}<span style="font-size:13px;font-weight:400;color:var(--text-muted)"> g</span></div>
      </div>
      <div class="macro-card">
        <div class="macro-label">Kohlenhydrate</div>
        <div class="macro-value">${r.Kohlenhydrate}<span style="font-size:13px;font-weight:400;color:var(--text-muted)"> g</span></div>
      </div>
      <div class="macro-card">
        <div class="macro-label">Fett</div>
        <div class="macro-value">${r.Fett}<span style="font-size:13px;font-weight:400;color:var(--text-muted)"> g</span></div>
      </div>
    </div>

    <div class="section-title">Zutaten</div>
    <ul class="ingredient-list">
      ${Object.entries(r['Zutaten und Mengen']).map(([z, m]) =>
        `<li class="ingredient-row"><span>${z}</span><span class="ingredient-amount">${m}</span></li>`
      ).join('')}
    </ul>

    <div class="section-title">Zubereitung</div>
    <div class="instructions">${r.Zubereitung}</div>
  `;
}

// ── Einkaufsliste ───────────────────────────────────────────
function renderShopping() {
  const selected = new Set(JSON.parse(localStorage.getItem('selected') || '[]'));
  const persons = parseInt(localStorage.getItem('persons') || '2');
  const selectedRecipes = window.allRecipes.filter(r => selected.has(r.Rezeptname));

  // Zutaten aggregieren
  const totals = {};
  selectedRecipes.forEach(r => {
    Object.entries(r['Zutaten und Mengen']).forEach(([zutat, menge]) => {
      const parts = menge.split(' ');
      const amount = parseFloat(parts[0]);
      const unit = parts.slice(1).join(' ');
      if (totals[zutat]) {
        totals[zutat].amount += amount * persons;
      } else {
        totals[zutat] = { amount: amount * persons, unit };
      }
    });
  });

  // Kategorisieren
  const byCategory = {};
  const uncategorized = {};
  Object.entries(totals).forEach(([zutat, data]) => {
    let found = false;
    for (const [cat, items] of Object.entries(window.mapping)) {
      if (items.includes(zutat)) {
        if (!byCategory[cat]) byCategory[cat] = {};
        byCategory[cat][zutat] = data;
        found = true; break;
      }
    }
    if (!found) uncategorized[zutat] = data;
  });

  const formatAmount = (amount, unit) => {
    const rounded = Number.isInteger(amount) ? amount : parseFloat(amount.toFixed(1));
    return `${rounded} ${unit}`;
  };

  let html = `
    <div class="persons-row">
      <span class="persons-label">Anzahl Personen</span>
      <div class="persons-controls">
        <button class="persons-btn" onclick="changePersons(-1)">−</button>
        <span class="persons-count" id="persons-count">${persons}</span>
        <button class="persons-btn" onclick="changePersons(1)">+</button>
      </div>
    </div>`;

  const catOrder = Object.keys(window.mapping);
  [...catOrder, '__rest__'].forEach(cat => {
    const items = cat === '__rest__' ? uncategorized : byCategory[cat];
    if (!items || Object.keys(items).length === 0) return;
    const title = cat === '__rest__' ? 'Sonstiges' : cat;
    html += `<div class="shopping-category">
      <div class="shopping-cat-title">${title}</div>
      ${Object.entries(items).sort((a,b) => a[0].localeCompare(b[0])).map(([z, d]) =>
        `<div class="shopping-item"><span>${z}</span><span class="shopping-amount">${formatAmount(d.amount, d.unit)}</span></div>`
      ).join('')}
    </div>`;
  });

  html += `<button class="copy-btn" onclick="copyList()">Liste kopieren</button>`;

  html += `<div class="selected-recipes">
    <div class="section-title" style="margin-top:0">Ausgewählte Rezepte</div>
    ${selectedRecipes.map(r => `<span class="selected-recipe-chip">${r.Rezeptname}</span>`).join('')}
  </div>`;

  document.getElementById('shopping-container').innerHTML = html;
}
