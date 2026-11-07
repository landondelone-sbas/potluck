# 0016: Freestyle dinner

Status: built, not yet cooked or reviewed. Follows the owner's point that the app must give a dinner from whatever is in the fridge, recipe or not.

## The problem

The app picked dishes from a library. Where no dish fit a pot well (shrimp, spinach, asparagus and rice, say), the cook got the closest dishes with some of their food left out, or a dish built for a different starch. A recipe library will never cover every fridge, and a cook with a protein, a vegetable and a starch can always make a plate.

## What changed

- **A freestyle card** made from exactly the pot (`packages/engine/src/freestyle.ts`). Every item is used and none is left out. The card has a title ("Shrimp with Spinach and Asparagus over Jasmine Rice"), a time, steps, amounts for two servings, a lighter tip and the same "make this tonight" button as any dish. It lands in the cook log and the recipe screen like any other.
- **How it cooks each item.** Each kind of protein has its own method, with the same safe temperatures as the dishes (the `{doneness}` rules): shrimp until pink and opaque, chicken, turkey and sausage to 165°F, ground meat to 160°F, pork, fish and whole beef to 145°F, a steak with the USDA minimum and the lower-doneness warning, eggs scrambled until set, tofu pan-fried, beans warmed, a roast braised with its vegetables. Chicken and other pieces carry a note that bone-in pieces take longer and go in the oven. An ingredient the engine does not know is cooked "until it is cooked through and piping hot".
- **The order of the steps follows how a cook works.** The starch starts first. A slower protein goes next, then the vegetables (roots, then quick vegetables), then a fast protein such as shrimp pushed in beside them so it does not overcook while they finish, then greens stirred in last and anything raw sliced fresh. Seasoning and a sauce come at the end, with plain fallbacks (salt, pepper and lemon; olive oil or a splash of broth) when the pot has none.
- **Where it shows.** The results screen shows it under "Or cook exactly what you picked". It goes last when a dish in the library uses everything in the pot, and first when none does. It replaces the "Chef's wildcard · AI preview" template card, which only returns when the pot has nothing to cook (only a spice or a sauce).
- **The cook log keeps it.** A freestyle entry has the id `freestyle` and is rebuilt from the saved pot, so it opens again even if the library changes.

## Decisions

**Beside the dishes, not instead of them.** The library stays: a tested recipe is better than a generated plan. Freestyle is an extra card, never a replacement, and the dish picks and their goldens are unchanged.

**Built from rules, not from a recipe.** It combines per-item methods the same way the side methods in ADR 0012 do. That keeps it testable and safe, and it never claims a source.

**Plain steps over clever ones.** It does not invent a flavor combination. It cooks each thing right and lets the cook season to taste.

## Not done

- It does not use the pantry. It cooks the pot as it is. There is nothing to add.
- Flavor is basic. A recipe will usually taste better, and the card says "freestyle", not a dish name.
- Timing is typical, not tested. Quantities are the library's standard two-serving amounts per category.
- It is the rule-based version. The AI recipe writer in the PRD would be the next step beyond it.
