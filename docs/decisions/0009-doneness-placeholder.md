# 0009: A `{doneness}` placeholder for safe temperatures

Status: built, not yet cooked or reviewed. Follows [0007](0007-steak-cuts.md) and [0008](0008-ground-meat.md).

## The problem

A dish accepts several proteins and its steps are fixed text. So a step had to either list a temperature for every protein the dish could meet (long, and mostly about things not in the pot) or use one blanket number. Neither can say "cooked through" for a steak and 160°F for ground beef in the same dish.

## What changed

- **A `{doneness}` step placeholder.** The engine fills it from the proteins the dish actually uses in the pot, or from the chef's pick when the pot has none (`packages/engine/src/doneness.ts`). It names a temperature only for what is there:

  | Protein | Phrase |
  |---|---|
  | chicken, turkey, sausage (ground or not) | 165°F / 74°C |
  | ground beef, pork, lamb and any other ground meat | 160°F / 71°C |
  | whole beef, pork and lamb, and fish | 145°F / 63°C |
  | shrimp | pink and opaque |
  | steak, on its own | "cooked through", no temperature |
  | tofu, beans, eggs, or nothing | "heated through" |

  The result reads like "cooked through (chicken breast 165°F / 74°C; shrimp pink and opaque)". Each temperature appears once, with only the items in the pot.
- **14 dishes use it** in place of their long temperature lists: quesadilla, fajita, pita wrap, kung pao, broth noodles, lettuce wraps, loaded potato, risotto, panzanella, piccata, tikka masala, saag, blackened and Greek salad.
- **The dish schema allows the placeholder.** A dish that uses a placeholder the engine does not fill still fails the build.

## What stayed as it was

- **Steak-only dishes** (seared steak, steak and potato skillet, steak salad) keep their own wording: the USDA minimum of 145°F / 63°C, a rest, and the note that a lower doneness is the cook's choice and carries more risk. A steak in those dishes is cooked to a doneness, so "cooked through" would be wrong.
- **Simmered and baked dishes** that say "any meat is at least 165°F" keep that. One number is safe for everything in a stew and simpler to read.
- **The 16 prototype dishes** are unchanged and locked by the parity test. The placeholder is new, so no v1 step uses it.

## A judgment call

A steak in a dish that slices it (tacos, stir-fry, quesadilla) now reads "cooked through" with no temperature, as you described. USDA's minimum for whole cuts is still 145°F (63°C). The sliced-thin cooking in those dishes will cook it through, but the card does not say a number. If you would rather the card named 145°F there, it is one line in `doneness.ts`.

## Tests

- `doneness.test.ts` covers every row of the table, mixed pots, a steak beside another meat, and the chef-pick fallback.
- `library.test.ts` has the test that matters: for every dish that uses `{doneness}` and every protein sample it accepts (chicken, turkey, sausage, three kinds of ground meat, three whole cuts, salmon, shrimp, steak, beans), it cooks the dish with that one protein and checks that the rendered steps contain the right phrase. The old "does the text mention a temperature" test now also accepts `{doneness}`.
- The cook log rebuilds recipes through the same function, so a saved recipe shows the same temperatures as the card. Its tests pass unchanged.

## Not verified

Nothing has been cooked. The temperatures are the USDA figures from batch 1, which were checked against foodsafety.gov and archived USDA charts, not the live USDA page. The review sheets now show the steps as rendered for each dish's own chef's pick.
