# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A vanilla JS Progressive Web App (PWA) — no build toolchain, no npm, no framework. It's a recipe collection + shopping list generator installable on iOS/Android. The app is entirely in German.

## Running locally

Open `index.html` directly in a browser, or serve it with any static file server (needed for Service Worker and fetch to work):

```bash
python3 -m http.server 8080
```

The Service Worker (`sw.js`) caches all assets on first load. After any change to cached files you need to bump `CACHE_NAME` in `sw.js` to force a cache refresh on the next visit.

## Build process (Python scripts)

All scripts run from the `scripts/` directory:

```bash
cd scripts
python3 build.py         # Full build: validates + consolidates
python3 check_ingredients.py  # Check all recipe ingredients exist in mapping
python3 check_units.py        # Check same ingredient uses same unit across recipes
```

`build.py` runs both checks, then merges all individual recipe files in `data/recipes/*.json` into the single `data/recipes.json` that the app loads. **Always run `build.py` after adding or editing a recipe file** — the app reads only `data/recipes.json`, not the individual files.

Both check scripts accept an `interactive` flag internally; running them standalone (`__main__`) triggers interactive mode where missing ingredients/unit mismatches can be fixed at the prompt.

## Data architecture

**Recipe source of truth**: `data/recipes/*.json` — one file per recipe. Edit here, then build.

**Consolidated output**: `data/recipes.json` — auto-generated, do not edit manually.

**Ingredient categorisation**: `data/ingredients_mapping.json` — maps supermarket category → list of ingredient names. Used by the shopping list to group items. Every `zutat` in every recipe must appear here; `check_ingredients.py` enforces this.

### Recipe JSON schema

```json
{
  "rezeptname": "string",
  "tags": ["MealPrep (TK)" | "MealPrep (KS)" | "Daily" | "Fine Dining" | "Snacks" | "Brotzeit" | "Frühstück" | "Backen"],
  "zubereitung": "string",
  "naehrwerte": { "kalorien_kcal": int, "fett_g": int, "kohlenhydrate_g": int, "proteine_g": int },
  "zutaten": [{ "zutat": "string", "menge": number, "einheit": "string" }]
}
```

Nutritional values are per serving (for 1 person). The shopping list scales amounts by the selected person count at runtime.

## JS architecture

The app has no module system — all JS files load as plain `<script>` tags in this order: `data.js` → `app.js` → `ui.js` → `navigation.js` → `utils.js`. All functions are global.

| File | Responsibility |
|---|---|
| `data.js` | `loadData()` — fetches JSON, groups recipes by tag into `categories` |
| `app.js` | State (`allRecipes`, `categories`, `selected`, `persons`), `init()`, event handlers, SW registration |
| `ui.js` | All DOM rendering: `renderList()`, `renderDetail()`, `renderShopping()`, `toggleSelect()` |
| `navigation.js` | Screen switching via `history[]` stack: `showDetail()`, `showShopping()`, `goBack()` |
| `utils.js` | `showToast()`, `copyList()` |

State is stored in `window.*` globals (set in `init()`) and persisted to `localStorage` (`selected` as JSON array, `persons` as int).

The three screens (`screen-list`, `screen-detail`, `screen-shopping`) are always in the DOM; `navigation.js` toggles the `active` class to switch between them.

## CSS structure

| File | Responsibility |
|---|---|
| `css/main.css` | CSS variables, base reset, screen/loading styles |
| `css/components.css` | All component styles (header, cards, lists, buttons, FAB, toast, shopping) |
| `css/responsive.css` | Media queries and mobile overrides |

Primary brand colour: `#1D9E75` (var `--green`).

## Adding a new recipe

1. Create `data/recipes/RecipeName.json` following the schema above. The filename must use underscores, no spaces.
2. Add any new ingredients to `data/ingredients_mapping.json` under the correct supermarket category.
3. Run `cd scripts && python3 build.py` — this validates and regenerates `data/recipes.json`.
4. Commit both the new recipe file and the updated `data/recipes.json`.
