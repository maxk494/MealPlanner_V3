import json
import os
from collections import defaultdict

def check_unit_consistency(interactive=False):
    """Check if the same ingredient uses consistent units across all recipes
    
    Args:
        interactive: If True, prompt user to fix inconsistencies. If False, just return status.
    
    Returns:
        tuple: (success: bool, inconsistencies: list)
    """
    recipes_dir = '/Users/max/Documents/15_Git-Repositories/MealPlanner_V3/data/recipes'
    
    # Dictionary to store ingredient -> {unit -> [recipes]}
    ingredient_units = defaultdict(lambda: defaultdict(list))
    
    # Read all recipe files
    for filename in os.listdir(recipes_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(recipes_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                recipe = json.load(f)
                recipe_name = recipe.get('rezeptname', filename)
                
                for ingredient in recipe.get('zutaten', []):
                    zutat = ingredient['zutat']
                    einheit = ingredient['einheit']
                    ingredient_units[zutat][einheit].append(recipe_name)
    
    # Find inconsistencies
    inconsistencies = []
    for ingredient, units in ingredient_units.items():
        if len(units) > 1:
            inconsistencies.append((ingredient, units))
    
    if not inconsistencies:
        print("Alle Zutaten verwenden konsistente Einheiten!")
        return True, []
    
    print(f"\n{len(inconsistencies)} Zutaten haben inkonsistente Einheiten:\n")
    
    for i, (ingredient, units) in enumerate(inconsistencies, 1):
        print(f"{i}. {ingredient}:")
        for unit, recipes in units.items():
            print(f"   - {unit}: {', '.join(recipes)}")
        print()
    
    if not interactive:
        return False, inconsistencies
    
    # Interactive mode: prompt user to fix inconsistencies
    print("Möchten Sie diese Inkonsistenzen beheben? (j/n): ", end="")
    choice = input().strip().lower()
    
    if choice != 'j':
        return False, inconsistencies
    
    # Fix each inconsistency
    for ingredient, units in inconsistencies:
        print(f"\nZutat: {ingredient}")
        print("Verfügbare Einheiten:")
        for i, unit in enumerate(units.keys(), 1):
            print(f"  {i}. {unit}")
        
        while True:
            print("Wählen Sie die Einheit, die für alle Rezepte verwendet werden soll (Nummer): ", end="")
            try:
                choice_num = int(input().strip())
                if 1 <= choice_num <= len(units):
                    selected_unit = list(units.keys())[choice_num - 1]
                    # Update all recipes to use the selected unit
                    for filename in os.listdir(recipes_dir):
                        if filename.endswith('.json'):
                            filepath = os.path.join(recipes_dir, filename)
                            with open(filepath, 'r', encoding='utf-8') as f:
                                recipe = json.load(f)
                            
                            modified = False
                            for ing in recipe.get('zutaten', []):
                                if ing['zutat'] == ingredient and ing['einheit'] != selected_unit:
                                    ing['einheit'] = selected_unit
                                    modified = True
                            
                            if modified:
                                with open(filepath, 'w', encoding='utf-8') as f:
                                    json.dump(recipe, f, ensure_ascii=False, indent=2)
                    
                    print(f"Alle Rezepte für '{ingredient}' verwenden jetzt '{selected_unit}'")
                    break
                else:
                    print("Ungültige Nummer. Bitte versuchen Sie es erneut.")
            except ValueError:
                print("Ungültige Eingabe. Bitte geben Sie eine Nummer ein.")
    
    print("\nAlle Inkonsistenzen wurden behoben!")
    return True, []

if __name__ == "__main__":
    check_unit_consistency()
