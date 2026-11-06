# 0013: Recipe pilot

Status: built, not yet cooked or reviewed. Two batches of dishes from the Gemini recipe sheets (11, then 13), and the first plated dishes (ADR 0012). The library goes from 60 to 84.

## What was added

| Dish | Format | From the sheets |
|---|---|---|
| `roastchicken` | plated | Whole roast chicken and crispy baked thighs, merged |
| `tuscanchicken` | one pot | Creamy Tuscan garlic chicken |
| `porkchops` | plated | Two pan-seared pork chop recipes, merged |
| `porktenderloin` | plated | Southwest-spiced roast pork tenderloin |
| `bakedsalmon` | plated | Baked salmon with lemon and dill |
| `shrimplinguini` | one pot | Shrimp sauté with garlic, tomato and linguini |
| `shrimptacos` | one pot | Weeknight shrimp tacos with slaw |
| `shrimpgumbo` | one pot | Shrimp and chicken okra gumbo |
| `turkeytostadas` | one pot | Baked tostadas with ground turkey |
| `mapotofu` | one pot | Spicy vegetarian mapo tofu |
| `cheesybeefpotatoes` | one pot | One-skillet cheesy ground beef and potatoes |

Four are plated and seven are one pot. The review sheet is [dish-review/pilot.md](../dish-review/pilot.md): it names the source of each, what changed, and the generated steps for the dish's own defaults and for one other pot.

## Second batch (13 dishes)

| Dish | Format | From the sheets |
|---|---|---|
| `lemonrosemary` | plated | Grilled lemon rosemary chicken breast |
| `butterchicken` | plated | Cast-iron seared, butter-basted chicken breast |
| `airfriedchicken` | plated | Air fryer crispy chicken |
| `burgers` | plated | Frying pan hamburger patties |
| `flatiron` | plated | Cast-iron flat iron steak with garlic butter |
| `carneasada` | plated | Marinated skirt steak, carne asada style |
| `ovenribs` | plated | Oven-baked St. Louis BBQ ribs |
| `garlicshrimp` | plated | Garlic butter shrimp scampi |
| `sesametofu` | plated | Crispy baked sesame ginger tofu bites |
| `turkeychili` | one pot | White bean turkey chili |
| `sausageflatbread` | one pot | Crispy naan flatbread with Italian sausage |
| `breakfastquesadilla` | one pot | Breakfast quesadilla with sausage and eggs |
| `redcurryshrimp` | one pot | Thai red curry shrimp |

Nine are plated and four are one pot. The review sheet is [dish-review/pilot-2.md](../dish-review/pilot-2.md). The older `steakdinner` (a steak with two sides cooked in one pan) is now marked plated too. That makes 14 plated dishes in the library.

## How a recipe becomes a dish

The sheets hold whole recipes with amounts for four. A dish is the five slots. For each recipe I:

1. Wrote the accepted tags for each slot from the ingredients, and kept the lists short, because a short list scores higher.
2. Picked the chef's defaults and halved the amounts for two servings.
3. Rewrote the steps in my own words. Nothing is copied from the sources. Where a recipe hardcoded one side, the steps use the side methods from ADR 0012 so the cook can pick any.
4. Set the doneness through `{doneness}`, so the app's safe temperatures are what the cook sees, not the sources'.
5. Ran the goldens and reach tests and retuned the new dish, never an existing one.

## Decisions

**Near-duplicates are merged.** The two chicken recipes (whole bird and thighs) and the two pork chop recipes became one dish each. The app needs one good version, not five.

**Where the sources and the USDA differ, the USDA wins.** Both pork chop recipes pull the meat at 140°F and rely on carryover to 145°F. The sheet's thigh recipe aims for 170°F. The app says 145°F with a 3-minute rest for pork and 165°F for chicken, and the review sheet notes each difference. The sources also disagree about tenting pork with foil, so the steps say neither.

**Plated steps start the slow sides first.** The pork chops take 10 minutes and the potatoes take 30, so the sides come first.

**A plated dish shares one oven temperature.** The side methods roast at 425°F, so the plated dishes that bake do the same. The baked salmon moved from 375°F for 15 to 20 minutes to 425°F for 10 to 12.

**New dishes got signatures only where the first run showed they were needed.** Baked salmon, the turkey tostadas and the cheesy beef skillet lost their own default pots to older dishes and were not offered. A protein signature (fish, turkey, ground meat) brought them back. Baked salmon's defaults then clashed with the PRD golden "Fresh and light", which must keep returning only Lemon-Herb Salmon. Its defaults now avoid lemon, quinoa and zucchini so the two dishes serve different pots. No existing golden changed.

**The mix rule was narrowed.** In the second batch, a plated chicken dish was pushed into the sandwich's own default pot by the mix rule and the sandwich dropped out. The rule now only swaps in the next dish down, which also keeps every dish reachable from its own pot (see ADR 0012).

**Steak sources are not followed on doneness.** Two steak recipes pull the meat at 130 to 140°F. The app keeps the USDA 145°F and says a lower doneness is the cook's choice and carries more risk, as for every steak dish.

**Signatures were used sparingly again.** Five of the second batch needed one to appear in their own default pots (sausage, shrimp, tofu, lemon, bbq). Carne asada took a cumin signature, not a steak one, so the existing steak golden (steak, tortillas, salsa) did not change.

**Older dishes sometimes lead.** A tofu and rice pot is led by bibimbap, and spaghetti with shrimp by the sausage pasta. The new dish is one of the results. That is the scoring working as designed.

## Known limits

- **Coarse protein tags.** Bacon and pork chops are both `pork`, and a bacon pot can be offered the pork chop dinner. The same is true of chicken pieces and a whole bird. Splitting them is a tag change like `steak` was (ADR 0007), and it is a candidate for the next batch.
- **Side methods are generic.** They are typical times and temperatures, not tested ones.
- **Not cooked.** None of the 11 has been cooked. The review sheet is the owner's checklist.

## Set aside from the sheets for now

Recipes with no way to fit the five slots, or that need an ingredient the engine has no tag for (for example the Panamanian beef with mofongo, which needs plantain prepared as its own side), and slow cooks over about three hours (the pulled pork and the ribs). Some will come back as plated dishes with their own sides once the batch goes beyond the pilot.
