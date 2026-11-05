# 0008: A tag for ground meat

Status: built, not yet cooked or reviewed. Follows [0007](0007-steak-cuts.md), which split whole-cut steak from other beef.

## What changed

- **A `ground` protein tag** for ground or minced meat of any animal: ground beef, turkey, chicken, pork and lamb, burgers, patties and meatballs. It sits beside the animal tag, so "Ground turkey" is `turkey` and `ground`, and every dish that takes turkey still takes it. Sausage is its own tag and is not `ground`.
- **Two dishes now take ground meat, not any cut:** the potato pie (`ground` and beans) and stuffed peppers (`ground`, sausage and beans). A steak, a ribeye or a lamb chop is no longer offered them. A test checks this, and that ground turkey, lamb and beef each fill a pepper.
- **Seven dishes give both temperatures** where they take beef, pork or lamb: quesadilla, fajita, pita wrap, kung pao, broth noodles, lettuce wraps and the loaded potato now say "ground pork and beef 160°F / 71°C, steak and other whole cuts 145°F / 63°C", in place of one 160°F figure for beef and pork. The older beef dishes from the prototype are unchanged and are part of the content review.
- **A test** requires every new dish that takes beef, other than the steak-only dishes, to say "any meat", say "at least 165°F" (safe for both), or give the ground and whole-cut temperatures.

## What this does not do

A step is fixed text, so it cannot say one thing for a steak in the pot and another for ground beef. It names both. Making steps match what is actually in the pot would need the engine to fill in a doneness phrase from the tags of the items used (for example a `{doneness}` placeholder). That would shorten every temperature note, because it would only name what is in the pot. It is not built.

## Tests

- `tags.test.ts` covers the new tag, including that it only applies to proteins.
- The parity test's tagging check ignores `ground` as well as `steak`. No v1 dish lists either, so v1 results are unchanged.
- `steak-goldens.test.ts` has the ground-meat cases. `library.test.ts` has the beef-safety rule above.

## Not verified

Nothing has been cooked. The tag rule was tested on a set of names, not every name a person might type.
