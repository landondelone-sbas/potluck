# Adding dishes: intake guide

Use [dish-intake-template.csv](dish-intake-template.csv) as the column layout. Import it into Google Sheets or Excel. The first three rows are existing dishes, as a worked example. Delete them before you send a batch, or mark them `example` in the `cooked_by_you` column as they are now.

One row is one dish. A dish is built from **five slots**: protein, veg, spice, sauce and starch. Every dish must fit all five.

## Columns

| Column | What goes in it |
|---|---|
| `id` | A short lowercase word, no spaces (for example `fishtacos`). Unique. |
| `title` | The dish name. `{p}` becomes the first protein the user picked and `{v}` the first vegetable, for example `{p} Tacos with {v}`. |
| `cuisine` | One of: asian, mexican, italian, indian, med, comfort, cajun, thai, korean, caribbean. |
| `format` | `pot` if everything cooks together (a stir-fry, a stew, a bowl). `plate` for a protein with two sides, each cooked on its own. |
| `minutes` | Total time, whole number. |
| `feel` | One word: Quick, Hearty, Light, Cozy, Bold, Creamy, Rich, Easy, Balanced, Slow or Hands-off. |
| `cooked_by_you` | yes, no, or sometimes. A dish you have cooked counts for more. |
| `wants_protein` … `wants_starch` | The tags the dish accepts in that slot, separated by semicolons. Use only the tags listed below. The shorter the list, the more a match says. |
| `signature` | The one or two ingredients that define the dish, written `category:tag` and separated by semicolons (for example `protein:fish;spice:lemon`). |
| `default_*` | What the chef adds when the pot has nothing for that slot, in plain words (for example `salmon`, `jasmine rice`). |
| `amount_*` | For two servings. Weights in grams or ounces (`340 g` or `12 oz`), liquids in ml or cups or spoons, or a plain count for whole items (`4` eggs). I will convert. |
| `step_1` … `step_7` | 3 to 5 steps for a pot dish, up to 7 for a plate. You can write them any way you like. I will rewrite them in my own words and check temperatures. For a plate, write the protein's method and name the sides. I add a plain way to cook whichever vegetable and starch the cook picks. |
| `tip` | One lighter swap or balance tip. |
| `source` | Where the recipe came from, or "my own". |
| `notes` | Anything else: a story, a variation, a doubt. |

## Tags the engine knows

If a dish centers on something that is not here (shellfish other than shrimp, lentils as a starch, cheese as a main), put it in `notes`. It needs a new tag first, and I will add it with your batch.

- **protein:** chicken, beef, steak, pork, sausage, fish, shrimp, egg, tofu, beans, turkey, lamb, ground
- **veg:** broccoli, pepper, tomato, onion, greens, mushroom, carrot, zucchini, cabbage, corn, cauliflower, asparagus, greenbeans, cucumber, avocado, okra, eggplant, celery
- **spice:** chili, cumin, paprika, garlic, ginger, curry, herbs, pepper, cinnamon, cajun, smoky, lemon, jerk
- **sauce:** soy, teriyaki, tomato, cream, bbq, salsa, pesto, hot, peanut, buffalo, gravy, vinaigrette, coconut, mustard, ranch, honey, hummus
- **starch:** noodles, pasta, rice, sweetpotato, potato, bakingpotato, bread, tortilla, quinoa, couscous, grits, plantain

Two protein tags are special. `steak` means a whole cut cooked to a doneness (ribeye, strip, sirloin), and a steak is always `beef` too. `ground` means ground or minced meat, which is cooked through. A dish that takes sliced steak or ground meat should list `beef` (or the animal) rather than `steak`.

## Plated dishes (a protein and two sides)

Set `format` to `plate`. The five slots work the same way: the protein is the main, the **veg** is one side and the **starch** is the other, with a spice or rub and a sauce or gravy. A steak dinner is a protein (`steak`), a veg (green beans) and a starch (potato). The recipe is mostly the protein's method. The app adds a plain way to cook whichever vegetable and starch the cook picks.

A dish that is only a protein (a rib roast, say) is still a plate: list the sides that go with it, and the defaults the chef adds.

## Rules of thumb

- **Meat dishes need a doneness.** If the dish cooks meat, poultry, fish or eggs, say what you cook it to, or tell me it is cooked until done. I add the food-safety wording.
- **Only mention what the dish has.** A step must not talk about eggs, shrimp or sausage unless the cook is using them. Write `{?egg:, scrambling the eggs}` and the text appears only when the dish has eggs. `{?!bakingpotato:Roast the {s} in chunks.}` appears only when it does not. I do this when I convert a recipe, so just write the recipe as it is and tell me where an ingredient is optional.
- **Each category should not accept everything.** A dish that takes any protein and any starch is hard to tell apart from the others.
- **Send 10 at a time.** Each batch is checked against all the existing dishes so a new one does not steal their results.
