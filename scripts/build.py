import json
import os
import sys

# Import check functions from existing scripts
from check_ingredients import check_ingredients
from check_units import check_unit_consistency

def consolidate_recipes():
    """Consolidate all recipe files into a single recipes.json"""
    recipes_dir = '../data/recipes'
    output_file = '../app/recipes.json'
    
    all_recipes = []
    
    for filename in sorted(os.listdir(recipes_dir)):
        if filename.endswith('.json'):
            filepath = os.path.join(recipes_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                recipe = json.load(f)
                all_recipes.append(recipe)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_recipes, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {len(all_recipes)} Rezepte zu {output_file} konsolidiert")
    return True

def build():
    """Main build process"""
    print("=== Build-Prozess gestartet ===\n")
    
    # Step 1: Check ingredients
    print("Schritt 1: Prüfe Zutaten-Mapping...")
    success, missing = check_ingredients(interactive=False)
    if not success:
        print(f"\n⚠️  {len(missing)} Zutaten fehlen im Mapping:")
        for ingredient in missing:
            print(f"   - {ingredient}")
        print("\nMöchten Sie diese Zutaten jetzt zum Mapping hinzufügen? (j/n): ", end="")
        choice = input().strip().lower()
        if choice == 'j':
            success, missing = check_ingredients(interactive=True)
            if not success:
                print("\n❌ Build fehlgeschlagen: Zutaten-Mapping unvollständig")
                sys.exit(1)
        else:
            print("\n❌ Build fehlgeschlagen: Zutaten-Mapping unvollständig")
            sys.exit(1)
    
    # Step 2: Check unit consistency
    print("\nSchritt 2: Prüfe Einheiten-Konsistenz...")
    success, inconsistencies = check_unit_consistency(interactive=False)
    if not success:
        print(f"\n⚠️  {len(inconsistencies)} Zutaten haben inkonsistente Einheiten")
        print("\nMöchten Sie diese Inkonsistenzen jetzt beheben? (j/n): ", end="")
        choice = input().strip().lower()
        if choice == 'j':
            success, inconsistencies = check_unit_consistency(interactive=True)
            if not success:
                print("\n❌ Build fehlgeschlagen: Einheiten inkonsistent")
                sys.exit(1)
        else:
            print("\n❌ Build fehlgeschlagen: Einheiten inkonsistent")
            sys.exit(1)
    
    # Step 3: Consolidate recipes
    print("\nSchritt 3: Konsolidiere Rezepte...")
    if not consolidate_recipes():
        print("\n❌ Build fehlgeschlagen: Konsolidierung fehlgeschlagen")
        sys.exit(1)
    
    print("\n=== Build erfolgreich abgeschlossen ===")

if __name__ == "__main__":
    build()
