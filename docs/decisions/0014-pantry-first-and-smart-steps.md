# 0014: Pantry first, smart steps and potato kinds

Status: built. Follows a phone test where a recipe told the cook to bake baby potatoes whole and to scramble "any eggs" that were not in the pot.

## What the test showed

A loaded potato with baby potatoes read "scrub, prick with a fork and bake 45 to 60 minutes" and "split the potatoes and fluff the insides". That is how to bake a russet, not a baby potato. A step in the same dish said "scrambling any eggs", with no eggs anywhere. And the chef added broccoli the cook might not own.

## What changed

- **Steps that depend on the ingredients.** A step may say `{?tag:text}`, kept only when something in the dish has that tag, or `{?!tag:text}`, kept only when nothing does. The text can use simple placeholders such as `{s}`. The schema checks the tag is one the engine knows and that the syntax is closed. A library test renders every dish that takes eggs, shrimp or sausage only as an option, with its own defaults, and fails if a step names an ingredient that is not there.
  - Fixed that way: eggs in bibimbap, broth noodles, the loaded potato and the breakfast quesadilla, shrimp in jambalaya, tortilla soup and jerk, sausage and pork in red beans, the kidney bean soaking note, and a chicken timing note in jerk.
  - "Any meat is at least 165°F" stays. It names no ingredient and is a safety line.
- **Potato kinds.** A new `bakingpotato` starch tag covers russet, Idaho and baked potatoes. Baby, red, new and Yukon gold potatoes stay plain `potato`. The side method for a baking potato is scrub, prick and bake. Everything else keeps roasting in chunks. The loaded potato now uses conditionals: a baking potato is baked and split, and a baby, red or sweet potato is halved and roasted, then smashed. Its signature moved from "any potato" to "a baking potato", so a pot of baby potatoes is no longer pulled to it.
- **More potato dishes.** Loaded potato soup, Spanish potato and egg tortilla, and warm potato salad. A pot of a single potato now gets at least two potato dishes for every kind.
- **The ingredient list.** The setup suggestions add Russet potatoes and Red potatoes to the starches, 14 in all.
- **The chef uses the pantry first, in every category.** Before, only the protein came from the cook's pantry. Now a missing vegetable, spice, sauce or starch is also the first pantry item the dish accepts, and only falls back to the dish's default when the pantry has nothing suitable. The protein is still required: a dish none of the cook's proteins suit is not offered. A dish whose steps then name the cook's own broccoli and baby potatoes reads right.
- **The cook log keeps every pick.** `chefPicks` stores what the chef supplied in each category, so a recipe opened later matches the card. Entries from the last build, which kept only the protein, still read.

## Decisions

**Conditionals, not more tags per dish.** The alternative was a variant of the dish for each ingredient. Conditionals keep one dish and let the sentence follow the ingredients.

**The default stays a fallback, not a rule.** A cook with an empty pantry for a category, or who skipped it in setup, still gets the dish's chef-added default (the app's "left to the chef" promise).

**Baking potato is one tag, not a method per variety.** The only difference that changes the instructions is whole and baked, or cut and roasted. The tag list stays short.

## Not done

- A side that has no method for an ingredient still reads "prepare it the way you like it".
- Where two conditionals overlap (a pot with both eggs and sausage), the sentence reads a little stiffly. It is correct.
- The conditional tags are checked across every category, so `pepper` and `tomato` (a vegetable and a spice or sauce) are ambiguous. None of the dishes uses them in a conditional.
