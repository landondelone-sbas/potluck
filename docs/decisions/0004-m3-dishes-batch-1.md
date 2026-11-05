# 0004: M3 dishes, batch 1 (Italian and Indian)

Status: drafted, not yet reviewed. Records the first batch of new dishes for the 60-dish library (PRD section 11), the choices made, and what the batch changed in the tests. The dishes have not been cooked and have not had a food-safety review: that is the owner's part, and [the review sheet](../dish-review/batch-1.md) is the script for it.

## The plan this follows

Agreed in conversation: grow the library from 16 to 60 in batches of about ten, organized by region, with the owner cooking and reviewing each batch.

| Region | Now | Target | Batch |
|---|---|---|---|
| Italian | 7 | 7 | 1 (6 new) |
| Indian | 6 | 6 | 1 (5 new) |
| Mexican | 2 | 7 | |
| Mediterranean (Middle Eastern dishes go here) | 2 | 7 | |
| Cajun and Southern | 1 | 4 | |
| Comfort (soups, casseroles) | 5 | 9 | |
| Asian (Chinese and Japanese leaning) | 4 | 8 | |
| New regions: Thai, Korean, Caribbean (4 each) | 0 | 12 | |
| **Total** | **27** | **60** | |

Italian and Indian were already cuisines in the engine, so this batch needed no engine change. The three new regions will: each needs an entry in `cuisines.ts` and a pass over every spice and sauce tag in `vibe.ts`, because a tag that does not list a dish's cuisine counts as a clash and is left out.

## What was added

Italian: risotto, cacciatore, minestrone (titled "{protein} & {veg} Soup"), panzanella, frittata, piccata.
Indian: tikka masala, dal, saag, pilaf, egg curry.

They cover forms the library lacked: soup, a salad, a pan sauce, a baked egg dish, rice cooked with the spices, and a dish for vegetarian and egg-only pantries (dal, saag, egg curry). New dishes go at the end of the library, so ties still go to the older dishes.

## Decisions

**Safe temperatures are in the steps.** The PRD asks for cooking temperatures. A dish accepts several proteins and its steps are fixed text, so each step names the temperature for every raw protein the dish accepts (poultry 165°F, pork and fish 145°F, egg dishes 160°F, shrimp pink and opaque), or says "any meat" in simmered dishes, where one number of 165°F is safe for every meat. A test fails if a new dish that takes raw meat or fish has no temperature in its steps, or takes shrimp and does not say "opaque", and another checks that each °F and °C pair agrees. The 16 prototype dishes have no temperatures: they predate the rule and their steps are locked by the parity test. They are part of the content review, and any change to them goes in the parity test's `DATA_FIXES`.

**Steps cannot depend on an item being singular.** `{p}` can be "chicken thighs", "beans" or "shrimp and tofu". A first draft read "the chicken thighs is cooked through" and "set it aside". The steps were reworded, and a test rejects "{p} is" style wording and "set it aside" in new dishes.

**Onion is not hard-coded where it is also a veg choice.** "Soften an onion… add the onions" read badly, so steps in dishes that accept onion as a veg start from garlic instead.

**Two foods are left out on purpose.** Egg is not accepted in the pilaf, because a raw egg stirred into rice scrambles, and shrimp is not accepted there, because it would overcook in a rice steam of 15 to 40 minutes. Both were in the first draft.

## Tuning the new dishes

Adding dishes can change which dish wins for a pot (decision record 0001), so the first draft was run against the golden pots and a few thousand random pots. Findings:

- **"Ten-minute meal" (eggs, spinach, sourdough, chili flakes) returned panzanella and egg curry ahead of the scramble.** A short list for a category earns a larger fit bonus, and a signature item adds 6, so a narrow dish aimed at a common item wins more pots than it should. The mood starter is named for its result, so the golden outcome had to hold. Panzanella no longer accepts egg and no longer has bread as a signature (tomato and vinaigrette are). Egg curry no longer accepts bread, which also means a pot with naan does not favor it; the engine cannot tell naan from sourdough. All five golden outcomes now match.
- **Tikka masala lost to curry on its own chef's pick.** Its signature did not match what its default pot contains. It now has cream and curry spice as signatures, and its default sauce is "tomato cream sauce".
- **Saag takes over single-item greens pots.** Spinach alone returns saag as the only result, because greens are its signature. Left as is: single-item pots are an edge case, and the result is a reasonable one.
- **The sandwich's own chef's pick now lists panzanella first.** Both are offered. Left as is, and flagged on the review sheet.

Two new library tests guard this. Every dish must be offered for a pot of its own defaults, which fails when a new dish is outscored by an older one, and every dish's defaults must fit the dish's own lists (a default that its own dish does not accept is a typo). `batch-goldens.test.ts` records the answers for plain pots that have been read and agreed.

## What changed in the tests

- **The parity test now runs on the first 16 dishes of the library.** It compares the ported engine with the prototype's engine, which only has those 16 dishes. Without this it would have failed on every pot where a new dish wins. Its purpose is unchanged, and the first-16 check is the existing "library matches the prototype, in order" test plus a new assertion that the prototype has exactly 16.
- **`library.test.ts`** gained the reach, defaults-fit, wording and food-safety checks above.
- **`batch-goldens.test.ts`** is new, with 13 pots.
- `golden.test.ts` is unchanged and passes. No test in the mobile app needed to change.

## Not verified

- Nothing has been cooked. Times, temperatures reached in practice, and whether each step works for every protein it accepts are all untested. The review sheet lists a set of questions per dish.
- The USDA page would not load for me, so the temperatures were checked against foodsafety.gov and archived USDA charts. They match what the drafts use. Read the live page before launch.
- Which pots bring up which dishes was checked on a set of 4,000 random pots and a few dozen hand-written ones. It is not a guarantee for every pot.

## Next

The owner cooks and reviews batch 1. After that, batch 2 would be Mexican, Mediterranean and the Cajun and Southern dishes, again checked against the golden pots. Thai, Korean and Caribbean need the engine work above first.
