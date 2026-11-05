# 0006: M3 dishes, batch 3 (Comfort and Asian)

Status: drafted, not yet reviewed. Same footing as [0004](0004-m3-dishes-batch-1.md) and [0005](0005-m3-dishes-batch-2.md): not cooked, no food-safety review. [The review sheet](../dish-review/batch-3.md) is the script.

## What was added

Eight dishes, taking the library from 40 to 48 of 60. No engine change: Comfort and Asian are existing cuisines.

| Region | Dishes | Now |
|---|---|---|
| Comfort | chili, noodle soup, potato pie (cottage pie), loaded potato | 9 |
| Asian | kung pao, broth noodles, egg foo young, lettuce wraps | 8 |

The remaining 12 are the new regions (Thai, Korean, Caribbean), which need engine work first.

## Tuning

- **The potato pie would have changed the "Cozy night" golden.** With chicken accepted it outscored the hash and displaced it. Chicken is not accepted, which fits a cottage pie anyway (beef, lamb, turkey, beans, pork).
- **The minestrone pot now also offers the noodle soup.** Two soups for one soup pot is reasonable, so the minestrone expectation in `batch-goldens.test.ts` was updated.
- The kung pao, lettuce wraps and egg foo young were checked against the default-pot golden and the "Ten-minute meal" golden. Both hold.

## Beef and steak

These dishes treat beef as "ground or any cut" at 160°F (71°C), as in batch 2. The next piece of work is to split whole-cut steak (ribeye, strip, sirloin) from beef used in tacos, pasta and stir-fry, so that steak dishes give doneness temperatures and other dishes do not need them. That is an engine change and is recorded separately.

## Not verified

Nothing has been cooked. The likeliest to need changes: the loaded potato's long temperature step, kung pao without the usual dried chilies, and the lettuce wraps' pull on every greens pot.
