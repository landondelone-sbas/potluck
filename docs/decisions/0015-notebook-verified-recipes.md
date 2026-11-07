# 0015: Notebook-verified recipes and the 13 proteins

Status: built, not yet cooked or reviewed. Five dishes from recipes the NotebookLM notebook could verify against its sources, and the setup protein list updated for the 13 protein themes.

## What the notebook gave back

The owner's Gemini run searched the notebook for 13 protein themes (chicken, beef, pork, steak, salmon, shrimp, Italian sausage, tofu, turkey, fish, eggs, beans and lamb) and saved one JSON file per theme. Every recipe in them names a source and a page. The files are valid and complete, but the yield is small:

- **13 recipes, 12 of them unique.** The notebook holds the same few dozen sourced recipes that were already in the sheet, not hundreds.
- **Six were already in the app:** the two pork chop recipes (merged in ADR 0013), baked salmon, shrimp scampi, the sausage flatbread, the breakfast quesadilla and the white bean turkey chili.
- **One was left out:** the cod fish salad needs salt cod.
- **Tofu and lamb returned nothing.** The notebook has no sourced recipe for either that the rules allowed.
- **Five are new** and are the dishes below.

The earlier 650-recipe lists in the Drive folder (the `_100` files) carry no sources, so they stay out of the app until the notebook can verify them. More sources added to the notebook will produce more recipes, and the same process applies.

## New dishes

| Dish | Format | Source |
|---|---|---|
| `paprikash` | one pot | Boston.gov, page 21: Chicken Paprikash |
| `chickenquinoa` | one pot | HFSA Heart Healthy Recipe Guide, page 23: Chicken Broccoli Quinoa |
| `potroast` | one pot | HFSA: Slow-Cooked Pot Roast |
| `reversesear` | plated | Allen Brothers: How to Reverse Sear a Steak |
| `glazedbreast` | one pot | HFSA, page 24: Orange Glazed Turkey with Potatoes and Carrots |

The review sheet with each source is [dish-review/grounded.md](../dish-review/grounded.md). The library is 92 dishes.

## Engine changes

- **`roast` protein tag:** a beef, pork or lamb roast, chuck, pot roast, brisket, short ribs or oxtail. It keeps ground beef and steaks out of a pot roast. "Roast chicken" is not a roast cut and does not get the tag. Pot roast, rump and round count as beef.
- **`breast` protein tag:** a boneless chicken or turkey breast, or a turkey tenderloin. A dish that glazes and roasts a breast does not meet ground turkey or thighs.
- **Marmalade, jam and preserves** count as honey-type sauces.
- **The parity test** with the prototype lists the two new tags it ignores.

## The setup protein list

Proteins grew from 14 to 18 suggestions: Pork chops, Lamb, Cod and Chuck roast join, so every one of the 13 themes (and the new roast) has something to pick. The other categories keep 12 to 14. The cap for proteins is 18, since a protein is what a dinner is built around and the list scrolls.

## Decisions

**The source's temperature is not followed for steak.** The reverse sear pulls the steak at 110 to 130°F. The app keeps the USDA 145°F, says to pull at about 130°F for that finish, and says a lower doneness is the cook's choice and carries more risk.

**A baking potato changes the steps.** The reverse-seared steak bakes a russet first at 425°F, then lowers the oven for the steak, the classic steakhouse way. Another starch is cooked on the stove.

**A distinct signature stops one dish crowding the others.** There were already five steak plates. The reverse sear's signature is a baking potato, so it leads a steak and baked potato pot, and leaves the steak plates where they were. No existing golden changed.

## Not done

- No lamb or tofu dish came out of the notebook, so there is no new lamb dish. The engine and the setup list are ready for one.
- The notebook records almost no temperatures. The app applies its own USDA minimums to all of these.
- None of the five has been cooked.
