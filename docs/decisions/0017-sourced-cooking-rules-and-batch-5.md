# 0017: Sourced cooking rules and the lamb, tofu, beans and eggs dishes

Status: accepted (the dishes await your cooking and review)

## Context

The second Gemini run saved sourced technique and cooking notes for 13 protein themes, plus verified
recipes for lamb, tofu, beans, eggs and more. You asked me to apply the cooking improvements and
convert the new recipes.

## Decision

**Seven cooking rules**, each from the technique files, applied to the freestyle dinner and, where a
dish carries the same step, to the dish:

1. Shrimp are done when pink and opaque and curled in a loose "C". A tight "O" is overcooked.
2. Firm tofu is pressed 15 minutes and dusted with cornstarch before searing.
3. Fish bakes at 400°F (204°C) for about 10 minutes per inch of thickness.
4. Eggs cook over gentle medium-low heat and are done set and firm at 160°F / 71°C. The `{doneness}`
   phrase for eggs is now "eggs set and firm, 160°F / 71°C" instead of "heated through".
5. Raw chicken and turkey are patted dry, not rinsed.
6. A braised or pot roast is cooked to fork-tender, about 195°F / 91°C to 205°F / 96°C, once it is
   past the safe minimum. The pot roast dish and the freestyle roast say so.
7. Beans are assumed canned and drained. Dried beans need soaking and boiling first. The note is in
   every bean step.

No safe temperature was lowered. Where a source cooks lower (lamb to 130°F, a runny yolk), the app
gives the USDA number and says the lower finish is the cook's choice.

**Fourteen dishes** (library now 106): chickpea soup, lamb steaks, roast lamb leg, creamy Tuscan
sausage pasta, fried eggs, chickpeas with spinach, green beans with tofu, egg casserole, bean and
lentil chili, mushroom tofu burgers, lemongrass tofu, Thai eggplant with coconut tofu, tofu scramble
and tofu larb. Sources are in [the review sheet](../dish-review/batch-5.md), which also lists every
recipe that was not converted and why.

Dishes that were duplicates of existing ones were left out. Pasta e fagioli was built and then
removed: it is the minestrone pot (white beans, vegetables, herbs, broth, small pasta) and it
displaced a PRD-era golden, which is never loosened.

## Consequences

- Lamb now has dishes. The engine already had the `lamb` and `roast` tags.
- New dishes were tuned, not the goldens: egg dishes dropped chili from their spice list so the
  ten-minute egg golden still returns only the scramble, and the green bean tofu dish has a green
  bean signature so it is offered for its own pot without displacing the mapo tofu pilot.
- The safety test now also checks eggs and tofu.
- The Gemini technique, notes and latest batch files are in `research/`.
