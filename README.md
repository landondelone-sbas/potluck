# Potluck

A recipe finder that starts from the foods you already love. Pick your favorites by category, drop them in a pot with your finger, and get one dish (or a few) back.

Working name. Native iPhone and Android apps, built code-first with React Native and Expo.

## Status

|                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prototype v1          | Done. A single-page web prototype, tagged `prototype-v1`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| PRD                   | Draft 0.1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| M1 Foundations        | Built, one gap: the dish library has 16 dishes, the milestone asks for 30. See [decision record 0001](docs/decisions/0001-m1-foundations.md).                                                                                                                                                                                                                                                                                                                                                                                      |
| M2 Core loop          | Built, not yet run on a phone. See [decision record 0002](docs/decisions/0002-m2-core-loop.md) for what is and is not verified.                                                                                                                                                                                                                                                                                                                                                                                                    |
| M3 Content and polish | Part built: recipe, cook log, settings, About, accessibility pass. Dishes: 51 of 60 (batches 1 to 3 and the steak dishes drafted, awaiting your cooking and review). Blocked on the rest of the dishes, the app name and the privacy policy URL. See [decision record 0003](docs/decisions/0003-m3-recipe-log-settings.md) , [0004](docs/decisions/0004-m3-dishes-batch-1.md) , [0005](docs/decisions/0005-m3-dishes-batch-2.md) , [0006](docs/decisions/0006-m3-dishes-batch-3.md) and [0007](docs/decisions/0007-steak-cuts.md). |
| App                   | Setup, pantry, the pot (drag and tap), mood starters, results, recipe, cook log and settings. Saved on the device, works offline.                                                                                                                                                                                                                                                                                                                                                                                                  |

## What is here

```
apps/mobile/        Expo app (React Native, TypeScript, Expo Router)
  src/app/          Screens: setup, the pot, results, recipe, cook log, settings, about
  src/domain/       Pure rules: favorites, pot limits, moods, icons
  src/state/        The saved store
  src/components/   Pot, tiles, drag layer, result card
packages/engine/    Matching engine: tag, score, select, build cards. Pure TypeScript.
packages/dishes/    Dish library: JSON files, Zod schema, golden and parity tests
docs/               PRD, product plan, decision records, accessibility checklist
prototype/v1/       The web prototype (reference, not shipped)
.github/workflows/  CI
```

## Work on it

Needs Node 24 (see `.nvmrc`). Keep the repo outside OneDrive or any synced folder: `node_modules` has tens of thousands of files and sync clients lock them.

```bash
npm install
```

```bash
npm run check
```

`check` runs lint, typecheck, all tests and the format check. It is what CI runs, plus a Metro bundle check:

```bash
npm run bundle:check -w @potluck/mobile
```

Run the app on a phone with Expo Go, or in a simulator:

```bash
npm start -w @potluck/mobile
```

Other scripts: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format`.

## The engine and the dish library

`packages/engine` has no dependencies and no UI. `cook(pot, dishes)` returns one dish or up to three, deterministically. Rules are in PRD section 9.

`packages/dishes` holds one JSON file per dish in `data/`. The schema rejects unknown tags, bad placeholders and incomplete dishes. Adding a dish takes two steps: add `data/<id>.json`, then add its import to `src/index.ts`. A test fails if you forget the second.

The engine's acceptance tests are the five golden pots from PRD section 9.7, in `packages/dishes/test/golden.test.ts`. A parity test also runs the prototype's own engine code against the port on 5,000 random pots.

## View the prototype

Open `prototype/v1/index.html` in any modern browser. It has three tabs: Cook (the pot), Set up (the first-run flow) and Plan.

## Next

Try the app on a real iPhone and Android phone. The PRD asks for a drag that holds 60 fps, and nothing has measured that yet. [The accessibility checklist](docs/accessibility-checklist.md) is the script for the screen reader and text size checks.

To finish M3: cook and review the dish batches with the review sheets ([batch 1](docs/dish-review/batch-1.md), [batch 2](docs/dish-review/batch-2.md), [batch 3](docs/dish-review/batch-3.md), [steak](docs/dish-review/steak.md)) (the library is at 51 of 60), then batches for the other regions in [decision record 0004](docs/decisions/0004-m3-dishes-batch-1.md). The app name, the bundle identifiers and a privacy policy page unblock the store assets.
