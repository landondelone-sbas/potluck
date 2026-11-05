# 0007: Whole-cut steak is its own kind of protein

Status: built, not yet cooked or reviewed. This is a deliberate engine change, made at the owner's direction: a ribeye or NY strip is cooked to a doneness, but steak in tacos, pasta or stir-fry is sliced and cooked through, so the two should not share one temperature rule.

## What changed

- **A `steak` protein tag** in `packages/engine/src/tag-rules.ts`, for whole cuts: steak, ribeye, NY strip, sirloin, filet mignon, flank, skirt, porterhouse, T-bone, tri-tip. Fish steaks, pork steaks, cube steak and chicken-fried steak are not tagged `steak`. Cheesesteak is `beef` only, since it is sliced.
- **`beef` now also matches the cut names** (ribeye, sirloin and the rest). Before, only "steak", "beef", "brisket" and "burger" did, so a favorite called "Ribeye" was unknown to the engine.
- **A steak is always `beef` as well.** Every dish that takes beef still takes steak, so steak tacos, steak stir-fry and steak pasta work as before. Ground beef, burgers and brisket are `beef` only.
- **Three new dishes accept only `steak`:** seared steak with veg, steak and potato skillet, and steak salad. Their steps give the USDA minimum for whole cuts (145°F / 63°C with a rest), and say that a lower doneness is the cook's choice and carries more risk. A test requires that wording for every dish that takes only steak.
- **The app's icon rule** shows the meat icon for the new cut names.

## What did not change

Older beef dishes (tacos, fajita, quesadilla and the rest) still say 160°F (71°C) for beef, because they also take ground beef, and the engine has no tag for ground beef. A `ground` tag is the natural next step: it would let those steps say "cooked through" for steak and keep 160°F for ground meat. It is not built.

## Tests

- `tags.test.ts` has the new tag rules, including the cases that must not be `steak`.
- The parity test's tagging check drops the `steak` tag before comparing with the prototype, which tagged steak as `beef` alone. This is the only exception. No v1 dish lists `steak`, so v1 scores and results are unchanged, and the 5,000 random-pot comparison still passes.
- `steak-goldens.test.ts` records the answers for steak pots: ribeye gets the steak dishes, steak with tortillas gets tacos, steak with noodles gets stir-fry and bowls, steak with pasta gets pasta, and ground beef never gets a steak dish.
- `library.test.ts` requires a temperature in any dish that takes steak, and the USDA wording in steak-only dishes.

## Library count

51 of 60. The nine left are the new regions (Thai, Korean, Caribbean, three each rather than four, now that the steak dishes are in), which need engine work first.

## Not verified

Nothing has been cooked. [The review sheet](../dish-review/steak.md) lists the questions. The tag rule was tested on a set of names, not every name a person might type.
