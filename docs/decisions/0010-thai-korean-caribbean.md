# 0010: Thai, Korean and Caribbean

Status: built, not yet cooked or reviewed. This finishes the library at 60 dishes (PRD section 11), subject to the content review.

## Engine changes

A tag that does not list a dish's cuisine counts as a clash and is left out of that dish, so a new cuisine needs a pass over the whole spice and sauce table.

- **Three cuisines:** Thai, Korean and Caribbean, in `cuisines.ts`.
- **Every row of `VIBE` was reviewed** and the three cuisines added where they fit. For example, ginger suits all three, curry suits Thai and Caribbean, soy suits Thai and Korean, teriyaki (hoisin and glazes) suits Korean, coconut suits Thai and Caribbean, honey suits Korean and Caribbean, and cream suits none of them. The new rows change nothing for the older cuisines.
- **A `jerk` spice tag** (jerk, allspice, scotch bonnet, Jamaican), which suits Caribbean and Cajun.
- **Fish sauce and miso now tag as `soy`**, and **kimchi tags as `cabbage`**. These are small widenings of existing rules, so a person's "Fish sauce" or "Kimchi" favorite now counts. Gochujang already tagged as `hot` and curry paste as `curry`.

The parity test needed no change: no prototype name or dish uses the new words or cuisines.

## Dishes

Nine dishes, taking the library from 51 to 60.

| Region | Dishes |
|---|---|
| Thai | coconut curry, pad Thai, spicy basil stir-fry |
| Korean | bibimbap, bulgogi bowl, spicy noodles |
| Caribbean | jerk, coconut rice and beans, island curry |

All use `{doneness}` for temperatures where they cook raw meat or seafood, and the per-protein render test covers them.

## Tuning

- **The PRD golden pots are unchanged.** The default pot, "Cozy night" and "Ten-minute meal" were the ones at risk: the Korean and Thai dishes share soy, ginger and rice with the stir-fry, and the island curry shares chicken, carrots and potato with the hash. No retuning of the new dishes was needed beyond the first draft's lists, which avoid broccoli for the Asian dishes and leave eggs out of the noodle dishes.
- **A coconut curry pot offers three curries.** The Indian curry has the same signatures as the Thai and island curries, so it ranks first, then the island curry, then the Thai one. Three of the goldens from earlier batches changed because the island curry or bibimbap now joins their pots (pilaf, chili, egg foo young). All three were read and accepted.
- **Shrimp is not accepted in the island curry**, which simmers 30 to 40 minutes and would overcook it.

## Not verified

Nothing has been cooked. The engine has no tags for lemongrass, galangal, sesame, plantain or tamarind, so these dishes lean on the nearest tags and some will read less authentic than the name suggests. [The review sheet](../dish-review/batch-4.md) lists the questions.
