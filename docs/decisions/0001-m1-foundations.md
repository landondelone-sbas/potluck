# 0001: M1 foundations

Status: accepted for M1. Records what was chosen while building milestone M1, and where it differs from the PRD.

## Stack as built

| Choice | Version at kickoff | Why |
|---|---|---|
| Expo SDK | 58 | What `create-expo-app` generates today. |
| React Native / React | 0.88.1 / 19.3.0 | Pinned by SDK 58. |
| TypeScript | ~6.0.3 | Pinned by the Expo template. TypeScript 7 exists but the SDK has not been tested with it. |
| Jest | 30 | SDK 58's `jest-expo` requires Jest 30. |
| Zod | 4 | Dish schema validation. |

Versions are the ones in the lockfile. Upgrade with `npx expo install --fix`, not by hand.

## Decisions

**npm workspaces, not pnpm.** Expo supports both. npm needs no extra install and no hoisting setting for React Native on Windows. Revisit if install time becomes a problem.

**Packages are consumed as TypeScript source.** `@potluck/engine` and `@potluck/dishes` point `main` at `src/index.ts`. Metro and Jest transform them, so there is no build step and no stale output. A server could do the same later. The CI bundle check exists because Jest cannot tell whether Metro resolves a package.

**One test runner, two transforms.** Everything runs under Jest from the root. The packages use `@swc/jest` so tests do not depend on the TypeScript version (`ts-jest` pins an older range). The app uses the `jest-expo` preset. Type checking is a separate `tsc --noEmit` per workspace.

**Dependency direction.** `dishes` depends on `engine` (types, tag vocabulary). `engine` depends on nothing. Its unit tests use small fixture dishes so they stay independent of library content. The golden tests live in `dishes` because they test the engine together with the library.

**The 88 percent rule uses integer math.** `score * 100 >= top * 88` replaces the prototype's `score >= top * 0.88`. It is what the PRD says ("at least 88 percent"), and it removes float edge cases where 88 percent lands on a whole number. The parity test shows no difference from the prototype on 5,000 random pots.

**Icons and fonts are not in the engine.** The prototype mapped names to emoji inside the engine. That is presentation, so it moves to the app in M2 with the icon decision (PRD section 12.6). Bricolage Grotesque and Figtree also load in M2; M1 uses system fonts.

## Deviation from prototype v1: dead `potato` tag

The dish schema checks every tag against the engine's vocabulary. It found that the curry and stew dishes listed `potato` as a **veg** tag. Potato is a starch tag, and both dishes already list it there, so no veg item could ever match it.

The entry was removed from both files. Side effect: the veg list drops from 8 to 7, which raises the veg specificity bonus by 1 for those two dishes. All five golden outcomes are unchanged. The parity test applies the same fix to the prototype's data (see `DATA_FIXES` in `packages/dishes/test/parity.test.ts`), so it still proves the engine logic is identical. Add an entry there for any future change to a v1 dish. Retire the parity test when the engine itself is deliberately changed; keep the golden tests.

## Gaps against the M1 scope

- **Dish count: 16 of 30.** The PRD's M1 row says "first 30 dishes". The 16 prototype dishes are ported. The other 14 are content work: each needs a tested recipe and a food-safety review (PRD section 11), and the dish source is still an open question (PRD section 19). Adding dishes can also change which dish wins for a given pot, so each batch should be checked against the golden tests.
- **Bundle identifiers.** `ios.bundleIdentifier` and `android.package` are not set. They need an owned domain or name and are not needed until the first device build (M4 at the latest).
- **Placeholder icon and splash.** The template's images are still in place. Brand assets come with store assets in M3.
- **CI has not run on GitHub yet.** The workflow was checked locally by running its steps. Pushing it needs a GitHub token with the `workflow` scope.

## Other changes from the template

- Removed the template's `.claude/settings.json`, which enabled a plugin for the project.
- Removed the web target and the template's demo screens, components and images. The app is phone-only.
- Kept the template's `AGENTS.md`: it tells coding agents to read the versioned Expo docs before touching Expo APIs.
