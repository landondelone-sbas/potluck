# 0012: Plated dishes (a protein and two sides)

Status: accepted. Changes the dish model so the app can suggest a plated meal as well as a one-pot dish. This sets up the engine, the schema and the intake for them.

## Why

Tonight's Pot answers "what's for dinner?". Not every dinner is one pot. A pan-seared pork chop with green beans and rice is a good answer for a pot of pork, a vegetable and a starch. The five slots already describe it: the protein is the main, the veg is one side, the starch is the other, and a spice and a sauce finish it. So the scoring did not need to change, only the dish description and the recipe wording.

## What changed

- **`format` on every dish:** `pot` (everything cooks together) or `plate` (a protein with two sides, each cooked on its own). All 60 existing dishes are `pot`.
- **Steps:** a pot dish keeps 3 to 5 steps, and the schema now rejects a sixth. A plated dish may have up to 7, because it runs its parts side by side.
- **Side cooking placeholders:** a plated dish does not know which vegetable or starch the cook will pick. `{veg_how}` and `{starch_how}` in a step become a plain sentence for each picked item: roast broccoli, wilt spinach, boil penne, simmer rice, roast potatoes, warm tortillas, and so on. Items with the same method share a sentence. An item with no known method reads "Prepare the X the way you like it", which is honest, not a guess. Both placeholders are in `packages/engine/src/sides.ts`.
- **Mixed results:** if the best three dishes are all the same format and the very next dish down is a close one of the other format, the last pick gives way to it, so the user sees a choice between a pot and a plate. The picks stay in rank order. A dish outside the 88 percent line is never forced in, and a plate further down the list does not push out a pick. (The first version let any close plate replace the third pick. With the second recipe batch it pushed an older dish out of its own default pot, so it was narrowed to the next dish only.)
- **The card and the recipe name the format:** "One pot" or "Protein + 2 sides" next to the cuisine, time and feel.
- **More ingredients are known:** the tag rules now recognize chuck, prime rib, short ribs, flat iron, tomahawk and carne asada as beef (flat iron and tomahawk as steak), ribs as pork (not beef or lamb ribs), pepperoni, salami and andouille as sausage, bacalao, snapper and haddock as fish, parsnip, turnip and beet with the carrots, new `okra` and `eggplant` veg tags, cilantro, mint, tarragon and chives with the herbs, oyster sauce with soy, doubanjiang and sambal with hot sauces, butter with the creamy sauces (not peanut butter), more pasta shapes, flatbread and brioche with the breads, and new `grits` and `plantain` starch tags. The prototype parity test lists the new tags it ignores, and an ingredient the engine never knew (Cassava) stands in as the unknown starch.
- **The intake template and guide** gained a `format` column, steps up to seven, and a section on plated dishes. See [dish-intake-guide.md](../dish-intake-guide.md).

## Decisions

**One model, not two.** A plated dish is a dish with a different format, not a separate kind of record. It keeps the engine, the goldens and the review sheets as they are.

**The mix rule swaps one pick.** A stronger rule (always show one of each) would hide a clearly better dish. Swapping only the last pick, and only for the next dish down when it is close, keeps the best dish first and keeps every dish reachable from its own pot.

**Sides get generic methods.** A whole library of side recipes is out of scope. The sentences say what a cook needs (a temperature and a time or a package instruction), never an amount, because amounts come from the dish.

## Not done

- No plated dish was in the library when this was built. The first came with the recipe pilot (ADR 0013).
- No filter for one pot, plated or either on the pot screen. It is automatic for now.
- Sides are limited to the two categories (veg and starch). A third side, such as a salad, is not modeled.
- Cooking times in the sentences are typical, not tested. They need the owner's cooking review.
