# 0011: Amounts, units and servings

Status: accepted. Covers PRD REC-2, REC-5 and SET-5, which ADR 0003 left open.

## What was built

- Every dish has `amounts`: one amount per category (protein, veg, starch, spice, sauce) for two servings. An amount is a number and a unit: grams (`g`), millilitres (`ml`) or a plain count (`n`).
- The recipe screen shows an amount beside each ingredient, from the pot and from the chef.
- A servings control on the recipe (1 to 8, starting at 2) scales every amount.
- Settings has a Units choice: US (oz, lb, tsp, tbsp, cups) or metric (g, kg, ml, L). US is the default. It is saved with the other settings.
- `docs/dish-review/amounts.md` lists every dish's amounts for the owner's cooking review.

## Decisions

**One amount per category, not per ingredient.** A dish says "340 g of protein" and the app prints it beside whichever protein ended up in the dish. The alternative was an amount for each ingredient type (150 g dry rice but 450 g potatoes). That is more accurate and about three times the data to write and review. The cost of the simple way is that a dish whose starch could be rice or potato has one figure for both. The recipe says "Amounts are a guide", and counts and weights were picked for the dish's default item. If a dish later needs per-ingredient amounts, the field can grow to allow an override per tag without breaking the files written now.

**Items that share a category split its amount equally.** Two proteins in one dish get half each. It is the simplest rule that keeps the total right.

**Amounts are stored in metric and converted for display.** One set of numbers to review. Conversion rounds to amounts a cook would use: half ounces, quarter teaspoons, quarter cups, and a pound at 450 g (15.9 oz reads as a pound). Counts are the same in both systems.

**Servings are not saved.** They reset to two each time the recipe opens, because the next cook may be for a different number of people.

**The cook log keeps the chef's protein.** The recipe is rebuilt from the dish and the saved pot, and it has to match the card that was shown. Since ADR 0003 the chef may cook a protein from the user's pantry instead of the dish's default (see `cook` in the engine). That choice depends on the pantry at the time, so the entry now saves its name (`chefProtein`). Entries made before this change have none and rebuild with the dish's default protein. This was a bug in the pantry-protein change: a recipe opened from the log could name the default (for example salmon) where the card had named the pantry's cod. It is fixed here and tested.

**No version bump.** The two new saved fields, `units` and `chefProtein`, are optional on read and default sensibly, so saved data from earlier builds loads unchanged. From the first beta (M4) any change that cannot read old data needs a bump and a migration.

## Not done

- The amounts are first drafts. They have not been cooked. Review them with the sheet.
- No scaling of the steps text. A step that names a quantity would not change with servings; the steps avoid quantities.
- No per-item unit preference (for example grams for flour only).
