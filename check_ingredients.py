import json
import os

def load_ingredient_mapping():
    """Load the ingredient mapping from d1_zutaten_mapping.json"""
    mapping_file = '/Users/max/Documents/15_Git-Repositories/MealPlanner_V3/Zutaten_Mapping.json'
    with open(mapping_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_ingredients_from_recipes():
    """Extract all unique ingredients from all recipe files"""
    receipes_dir = '/Users/max/Documents/15_Git-Repositories/MealPlanner_V3/receipes'
    all_ingredients = set()
    
    for filename in os.listdir(receipes_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(receipes_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                recipe = json.load(f)
                for ingredient in recipe.get('zutaten', []):
                    all_ingredients.add(ingredient['zutat'])
    
    return sorted(all_ingredients)

def check_ingredients():
    """Check if all recipe ingredients are in the mapping and prompt for missing ones"""
    mapping = load_ingredient_mapping()
    all_ingredients = get_all_ingredients_from_recipes()
    
    # Create a flat set of all ingredients in the mapping
    mapped_ingredients = set()
    for category, ingredients in mapping.items():
        mapped_ingredients.update(ingredients)
    
    # Find missing ingredients
    missing_ingredients = [ing for ing in all_ingredients if ing not in mapped_ingredients]
    
    if not missing_ingredients:
        print("Alle Zutaten sind im Mapping enthalten!")
        return mapping
    
    print(f"\n{len(missing_ingredients)} Zutaten fehlen im Mapping:")
    for i, ingredient in enumerate(missing_ingredients, 1):
        print(f"{i}. {ingredient}")
    
    print("\nVerfügbare Kategorien:")
    categories = list(mapping.keys())
    for i, category in enumerate(categories, 1):
        print(f"{i}. {category}")
    
    # Prompt user for each missing ingredient
    for ingredient in missing_ingredients:
        while True:
            print(f"\nZutat: {ingredient}")
            category_input = input("Bitte geben Sie die Kategorie ein (Nummer oder Name): ").strip()
            
            # Check if input is a number
            try:
                category_num = int(category_input)
                if 1 <= category_num <= len(categories):
                    category = categories[category_num - 1]
                    mapping[category].append(ingredient)
                    print(f"'{ingredient}' wurde zur Kategorie '{category}' hinzugefügt.")
                    break
                else:
                    print("Ungültige Nummer. Bitte versuchen Sie es erneut.")
            except ValueError:
                # Check if input is a category name
                if category_input in mapping:
                    mapping[category_input].append(ingredient)
                    print(f"'{ingredient}' wurde zur Kategorie '{category_input}' hinzugefügt.")
                    break
                else:
                    print("Ungültige Kategorie. Bitte versuchen Sie es erneut.")
    
    # Save updated mapping
    mapping_file = '/Users/max/Documents/15_Git-Repositories/MealPlanner_V3/data/d1_zutaten_mapping.json'
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    
    print("\nMapping wurde aktualisiert und gespeichert!")
    return mapping

if __name__ == "__main__":
    check_ingredients()
