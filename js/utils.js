// ── Hilfsfunktionen ─────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function copyList() {
  const selected = new Set(JSON.parse(localStorage.getItem('selected') || '[]'));
  const persons = parseInt(localStorage.getItem('persons') || '2');
  const selectedRecipes = window.allRecipes.filter(r => selected.has(r.Rezeptname));
  
  const totals = {};
  selectedRecipes.forEach(r => {
    Object.entries(r['Zutaten und Mengen']).forEach(([zutat, menge]) => {
      const parts = menge.split(' ');
      const amount = parseFloat(parts[0]);
      const unit = parts.slice(1).join(' ');
      if (totals[zutat]) { totals[zutat].amount += amount * persons; }
      else { totals[zutat] = { amount: amount * persons, unit }; }
    });
  });

  let text = `Einkaufsliste für ${persons} Person${persons > 1 ? 'en' : ''}\n${'='.repeat(30)}\n`;
  const byCategory = {};
  const uncategorized = {};
  Object.entries(totals).forEach(([zutat, data]) => {
    let found = false;
    for (const [cat, items] of Object.entries(window.mapping)) {
      if (items.includes(zutat)) {
        if (!byCategory[cat]) byCategory[cat] = {};
        byCategory[cat][zutat] = data; found = true; break;
      }
    }
    if (!found) uncategorized[zutat] = data;
  });

  [...Object.keys(window.mapping), '__rest__'].forEach(cat => {
    const items = cat === '__rest__' ? uncategorized : byCategory[cat];
    if (!items || Object.keys(items).length === 0) return;
    text += `\n${cat === '__rest__' ? 'Sonstiges' : cat}:\n${'-'.repeat(30)}\n`;
    Object.entries(items).sort((a,b) => a[0].localeCompare(b[0])).forEach(([z, d]) => {
      const amt = Number.isInteger(d.amount) ? d.amount : parseFloat(d.amount.toFixed(1));
      text += ` [ ] ${z}: ${amt} ${d.unit}\n`;
    });
  });

  text += `\nAusgewählte Rezepte\n${'='.repeat(30)}\n`;
  selectedRecipes.forEach((r, i) => { text += ` [${i+1}] ${r.Rezeptname}\n`; });

  navigator.clipboard.writeText(text).then(() => showToast('Liste kopiert ✓')).catch(() => showToast('Kopieren fehlgeschlagen'));
}
