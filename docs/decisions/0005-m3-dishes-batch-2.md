# 0005: M3 dishes, batch 2 (Mexican, Mediterranean, Cajun)

Status: drafted, not yet reviewed. Same footing as [0004](0004-m3-dishes-batch-1.md): the dishes have not been cooked or had a food-safety review. [The review sheet](../dish-review/batch-2.md) is the script for that.

## What was added

13 dishes, taking the library from 27 to 40 of 60. Cajun is already an engine cuisine, so there was no engine change.

| Region | Dishes | Now |
|---|---|---|
| Mexican | quesadilla, chilaquiles, fajita skillet, enchilada bake, tortilla soup | 7 |
| Mediterranean | shakshuka, pita wrap, stuffed peppers, tagine, Greek salad | 7 |
| Cajun | jambalaya, red beans and rice, blackened fish or chicken | 4 |

Italian and Indian are unchanged from batch 1 (7 and 6). The other targets are still open: Comfort 5 of 9, Asian 4 of 8, and the new regions Thai, Korean and Caribbean.

## Tuning

Same method as batch 1: run the golden pots and the reach tests, and retune the new dishes rather than the goldens.

- **"Spicy kick" (ground beef, peppers, rice, cumin, salsa verde) returned the fajita skillet beside the burrito bowl.** Fajita no longer accepts rice as a starch, which keeps the golden outcome. A pot with rice and fajita ingredients still gets the burrito bowl first.
- **Shakshuka would have beaten the scramble on "Ten-minute meal".** Chili is not in its spice list. Chili flakes in a shakshuka pot are left out. This is the same trade as batch 1, and it is flagged for you on the sheet.
- **The enchilada bake was crowded out of its own pot.** Its default sauce is now "enchilada sauce and cheese", so both its signatures apply.
- **The panzanella pot also offers the Greek salad now.** Both are tomato-and-vinaigrette salads, so the golden in `batch-goldens.test.ts` was updated to list both. This was a judgment call, not a regression.

## Tests

- `batch-2-goldens.test.ts` records the answer for each new dish's own chef's pick.
- The reach, defaults-fit, wording and food-safety tests from batch 1 cover the new dishes unchanged, and pass.
- `golden.test.ts` and the mobile mood-starter tests are unchanged and pass.

## Safe temperatures

As in batch 1, with one difference. Beef, pork and lamb that are seared in strips use 160°F (71°C), because the engine cannot tell ground meat from a steak and 160°F is safe for both. It slightly overcooks a steak. Red beans and rice carries the dried kidney bean warning.

## Not verified

Nothing has been cooked. Times, whether each step works for every protein a dish accepts, and the tagine, jambalaya and red beans timings are the likeliest to need changes.
