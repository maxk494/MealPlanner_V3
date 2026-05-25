// ── Datenladen und -verarbeitung ───────────────────────────────
const DISPLAY_TAGS = [
  'MealPrep (TK)',
  'MealPrep (KS)',
  'Daily',
  'Fine Dining',
  'Snacks',
  'Brotzeit',
  'Frühstück',
  'Backen'
];

async function loadData() {
  const [mapRes, recipesRes] = await Promise.all([
    fetch('./data/ingredients_mapping.json'),
    fetch('./data/recipes.json')
  ]);
  
  const mapping = await mapRes.json();
  const allRecipes = await recipesRes.json();
  
  // Group recipes by tags, only include display tags
  const categories = DISPLAY_TAGS.map(tag => ({
    label: tag,
    recipes: allRecipes
      .filter(recipe => recipe.tags && recipe.tags.includes(tag))
      .sort((a, b) => a.rezeptname.localeCompare(b.rezeptname))
  })).filter(category => category.recipes.length > 0);
  
  return { mapping, categories };
}
