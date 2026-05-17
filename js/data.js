// ── Datenladen und -verarbeitung ───────────────────────────────
const DATA_FILES = [
  { file: './data/d2_mealprep.json',    label: 'Mealprep' },
  { file: './data/d6_brotzeit.json',    label: 'Brotzeit' },
  { file: './data/d7_finedining.json',  label: 'Fine Dining' },
  { file: './data/d3_snacks.json',      label: 'Snacks' },
  { file: './data/d4_fruehstueck.json', label: 'Frühstück' },
  { file: './data/d5_backen.json',      label: 'Backen' }
];

async function loadData() {
  const [mapRes, ...catRes] = await Promise.all([
    fetch('./data/d1_zutaten_mapping.json'),
    ...DATA_FILES.map(d => fetch(d.file))
  ]);
  
  const mapping = await mapRes.json();
  const loaded = await Promise.all(catRes.map(r => r.json()));
  
  const categories = DATA_FILES.map((d, i) => ({
    label: d.label,
    recipes: loaded[i].sort((a,b) => a.Rezeptname.localeCompare(b.Rezeptname))
  }));
  
  return { mapping, categories };
}

// ── Datenqualitätsprüfung ───────────────────────────────────────
function dataQuality(recipes, mapping) {
  const allMappedItems = Object.values(mapping).flat();
  const unitTracker = {};
  let warnings = 0;

  recipes.forEach(r => {
    Object.entries(r['Zutaten und Mengen']).forEach(([zutat, zutatData]) => {
      // Neue Struktur: { menge: number, einheit: string }
      const menge = zutatData.menge;
      const unit = zutatData.einheit;

      // Test 1: Zutat im Mapping vorhanden?
      if (!allMappedItems.includes(zutat)) {
        console.warn(`[Datenqualität] Zutat nicht im Mapping: "${zutat}" (Rezept: ${r.Rezeptname})`);
        warnings++;
      }

      // Test 2: Einheit konsistent?
      if (unitTracker[zutat] && unitTracker[zutat] !== unit) {
        console.warn(`[Datenqualität] Inkonsistente Einheit bei "${zutat}": "${unitTracker[zutat]}" vs. "${unit}" (Rezept: ${r.Rezeptname})`);
        warnings++;
      } else {
        unitTracker[zutat] = unit;
      }

      // Test 3: Datentyp-Validierung
      if (typeof menge !== 'number' || isNaN(menge)) {
        console.warn(`[Datenqualität] Ungültige Menge bei "${zutat}": ${menge} (Rezept: ${r.Rezeptname})`);
        warnings++;
      }

      if (typeof unit !== 'string' || unit.trim() === '') {
        console.warn(`[Datenqualität] Ungültige Einheit bei "${zutat}": "${unit}" (Rezept: ${r.Rezeptname})`);
        warnings++;
      }
    });
  });

  if (warnings === 0) {
    console.log('[Datenqualität] Alle Prüfungen bestanden ✓');
  } else {
    console.warn(`[Datenqualität] ${warnings} Warnung(en) gefunden — siehe oben.`);
  }
}
