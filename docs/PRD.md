# Potluck: Product Requirements Document

| | |
|---|---|
| **Working name** | Potluck (placeholder, see open questions) |
| **Document version** | 0.1, draft for review |
| **Date** | 2026-11-03 |
| **Owner** | Landon |
| **Status** | Prototype v1 complete. App not started. No application code exists yet. |
| **Platforms** | iPhone and Android phones, built code-first (hand-written TypeScript in this repo) |

Priority key used throughout: **P0** = required for the v1.0 store release. **P1** = target for v1.0 if capacity allows, otherwise v1.1. **P2** = later.

---

## 1. Summary

Potluck is a recipe finder that starts from the foods you already love instead of a search box. On first launch you build a personal pantry of favorites, sorted into five categories: Protein, Veg, Spice, Sauce and Starch. After that, deciding what to eat is a mood. You toggle between categories on one screen and drag favorites into a pot with your finger. Press **Cook it up** and the app returns either one dish, when the pot clearly points at one, or up to three, when it is a toss-up.

The v1.0 app is deterministic and works fully offline. A rules engine scores a hand-written dish library against the pot. AI arrives in a later release as a "chef's wildcard" that writes a recipe around the exact pot, the user's diet and what is in their kitchen.

Prototype v1 (a web page) proves the interaction. It lives in `prototype/v1/` and is the visual and behavioral reference for this document.

## 2. Problem and opportunity

- Recipe apps start from a database and a search box. That asks the user to already know what they want, and it surfaces food they may not like.
- Most people already have a short list of foods they reliably enjoy. No mainstream app treats that list as the starting point.
- Deciding what to cook is a daily friction. A playful, physical interaction (dropping ingredients in a pot) lowers the effort of choosing and makes the answer feel earned.
- Healthy eating is easier when the plate is built from familiar foods, so a nudge toward balance fits naturally into the same flow.

## 3. Vision and principles

1. **Your food, not a database.** Every ingredient in the pot comes from the user's own list.
2. **A mood, not a query.** The user chooses by feel. No typing, no filter panels.
3. **One answer or a few.** One dish when the match is clear, up to three when it is close. Never a long list.
4. **One screen.** The pot and the pantry are visible together on a phone. No navigating away to add an ingredient.
5. **Honest results.** Every dish card says what it used, what the chef added, and what it left out.
6. **Eat a little better by default.** A balance nudge and a lighter swap on every dish, never a lecture.

## 4. Goals, non-goals and success metrics

### Goals (v1.0)
- A polished iPhone and Android app that delivers the prototype's core loop: set up, fill the pot, cook it up, choose a dish.
- A deterministic, unit-tested matching engine that gives consistent results.
- A dish library large enough that typical pantries get a good answer (60 dishes at launch).
- Fully offline, no account required, no personal data leaving the device.

### Non-goals (v1.0)
- No AI-generated recipes (planned for v2, section 15).
- No user accounts, cloud sync or social features.
- No grocery delivery, store integrations or shopping-list sharing.
- No calorie or macro calculation.
- No web version, no tablet-specific layouts, no wearables.
- No monetization in v1.0.

### Success metrics (proposed targets, to validate in beta)

| Metric | Target |
|---|---|
| Setup completion (reach the pot with at least 10 favorites) | 70% of new installs |
| Time from app open to first result for a returning user | under 45 seconds, median |
| Sessions that press Cook it up | 60% of sessions |
| Results where the user taps "Make this tonight" | 30% of cook sessions |
| Favorites added after setup (per active user, first 14 days) | 5 or more |
| Day-7 retention | 25% |
| Crash-free sessions | 99.5% or better |
| Store rating after 50 ratings | 4.3 or better |

## 5. Users

**Primary: the everyday home cook.** Cooks most nights, rotates through a small set of meals, gets stuck deciding. Comfortable with a phone, not looking for a cooking course.

**Secondary: the health-conscious eater.** Wants balanced plates without tracking numbers. Values the nudge and the lighter swaps.

**Secondary: the picky or constrained eater** (household preferences, simple allergy or diet needs). Values that only liked foods appear. Diet and allergy filters are P1.

Representative needs:
- "I have chicken and rice and I'm bored of the usual. Give me something new that I'll actually eat."
- "I want something light tonight. Show me a few options."
- "I tried a new sauce and loved it. Let me add it in two taps."

## 6. Scope

### v1.0 (store release)
Setup flow, pantry with five categories, the pot with drag and tap, mood starters, matching engine, results with one-or-few logic, dish detail and cook log, plate nudge, lighter tips, settings, offline use, light and dark themes, accessibility support, English only.

### Later
- v1.1: diet and allergy filters, ratings that influence results, more dishes, scalable servings, custom moods.
- v2.0: AI chef (wildcard becomes a generated recipe), backend proxy, subscription decision.
- v3.0: taste profile, weekly planning, grocery list, accounts and sync.

## 7. Core user flows

### 7.1 First run
1. Welcome screen, one sentence on how Potluck works.
2. Five setup steps, in order: Protein, Veg, Spice, Sauce, Starch. Each shows curated suggestions as tappable tiles plus an "add your own" field. Skipping any step is allowed.
3. Summary: counts per category and a button, **Open the pot**.
4. Land on the pot screen with a short, dismissible coach mark that shows the drag gesture.

### 7.2 Everyday session
1. Open the app to the pot screen (last pot restored, P1).
2. Optionally tap a mood starter to prefill the pot.
3. Toggle categories and drag favorites into the pot, or tap them.
4. Press **Cook it up**. The pot simmers for about a second.
5. Read one dish, or up to three. Expand "How to make it".
6. Tap **Make this tonight**. The dish opens in the recipe view and is saved to the cook log.
7. Optional later: rate the dish (P1).

### 7.3 Growing the pantry
Anywhere on the pot screen, the **+ Add** tile at the end of each category row opens an inline field. The new favorite appears in that category immediately.

## 8. Functional requirements

### 8.1 Setup (ONB)

| ID | Requirement | Priority |
|---|---|---|
| ONB-1 | First launch shows the setup flow with one step per category in the order Protein, Veg, Spice, Sauce, Starch. | P0 |
| ONB-2 | Each step offers 12 to 14 curated suggestion tiles. Tapping toggles a tile on or off. | P0 |
| ONB-3 | Each step has an "add your own" field. Entries are trimmed, capped at 40 characters and de-duplicated within the category. | P0 |
| ONB-4 | Every step can be skipped. A user can finish setup with zero favorites. | P0 |
| ONB-5 | The final screen summarizes counts and names per category and opens the pot screen. | P0 |
| ONB-6 | Setup can be re-run from Settings without deleting existing favorites. | P1 |
| ONB-7 | An optional diet and allergy step stores hard filters (section 8.6). | P1 |

### 8.2 Pantry (PAN)

| ID | Requirement | Priority |
|---|---|---|
| PAN-1 | A toggle strip shows the five categories in a fixed order with a badge for how many from that category are in the pot. | P0 |
| PAN-2 | The selected category shows its favorites as a horizontally scrolling row of large tiles (about 84 pt wide), sized for a thumb. | P0 |
| PAN-3 | A **+ Add** tile at the end of the row opens an inline field to add a favorite to the selected category. | P0 |
| PAN-4 | An **Edit** control puts the row in remove mode. Tapping a tile removes that favorite and takes it out of the pot. | P0 |
| PAN-5 | Each favorite gets tags (section 9.2) and an icon automatically. | P0 |
| PAN-6 | When an added favorite has no recognized tags, offer a one-tap "what kind is it?" picker so it can still match. | P1 |
| PAN-7 | Rename a favorite. | P1 |
| PAN-8 | Suggest new favorites based on what the user already likes. | P2 |

### 8.3 The pot (POT)

| ID | Requirement | Priority |
|---|---|---|
| POT-1 | The pot and the pantry are visible together on a standard phone screen (about 390 x 780 pt) without scrolling. | P0 |
| POT-2 | Pressing and dragging a tile lifts a ghost of it above the finger. Dropping it over the pot adds it. Dropping elsewhere cancels. | P0 |
| POT-3 | A horizontal swipe on the tile row scrolls the row. Only a mostly vertical drag starts a pot drag. | P0 |
| POT-4 | Tapping a tile adds it to the pot with a short flight animation. Tapping an in-pot tile removes it. Tap is a full alternative to drag, and the only path for assistive technologies. | P0 |
| POT-5 | Limits: 3 items per category and 12 in total. Exceeding a limit shows a brief message and does nothing else. | P0 |
| POT-6 | Items in the pot appear as colored tokens. Tapping a token removes it. A single line under the pot lists the contents. | P0 |
| POT-7 | Mood starters: Cozy night, Fresh and light, Spicy kick, Ten-minute meal. Each fills the pot from the user's favorites (skipping any the user does not have) and runs Cook it up. | P0 |
| POT-8 | **Empty** clears the pot. | P0 |
| POT-9 | A plate nudge appears under the pot (for example, "no vegetable yet") using the rules in section 9.6. | P1 |
| POT-10 | The last pot is restored on relaunch. | P1 |
| POT-11 | Dragging a token out of the pot removes it. | P2 |
| POT-12 | Haptic feedback on pick-up, on a successful drop, and on a rejected drop. | P1 |

### 8.4 Cook and results (RES)

| ID | Requirement | Priority |
|---|---|---|
| RES-1 | **Cook it up** plays a simmer animation (steam, bobbing tokens) of 1.1 seconds or less, then shows results. | P0 |
| RES-2 | Results follow the one-or-few rule in section 9.4: one dish when there is a clear winner, otherwise two or three. | P0 |
| RES-3 | Each result card shows: cuisine, time and feel; a title built from the user's own items; "Uses N of M picks"; ingredient chips marked used, chef adds, or left out; collapsible steps; one lighter tip. | P0 |
| RES-4 | Changing the pot after results appear marks them stale until the user cooks again. | P0 |
| RES-5 | **Make this tonight** opens the recipe view for that dish and records an entry in the cook log. | P0 |
| RES-6 | A "chef's wildcard" card shows a rule-based template dish name when the pot has two or more items. In v1 it is clearly labeled as a preview of the AI step. | P1 |
| RES-7 | After cooking, the user can rate the dish (thumbs up or down). Ratings are stored for v1.1 weighting. | P1 |
| RES-8 | If the pot is empty, Cook it up shows a brief prompt and does nothing else. | P0 |

### 8.5 Recipe view and cook log (REC)

| ID | Requirement | Priority |
|---|---|---|
| REC-1 | A dedicated recipe screen shows the title, time, ingredients and numbered steps. Large type, easy to read at arm's length. | P0 |
| REC-2 | The ingredient list covers what the pot supplied plus the chef's additions, with amounts for 2 servings. | P1 |
| REC-3 | A keep-awake option stops the screen from sleeping while cooking. | P1 |
| REC-4 | A cook log lists dishes made, newest first, with date. A user can re-open any entry. | P0 |
| REC-5 | Adjustable servings that scale amounts. | P2 |

### 8.6 Settings and health (SET, HLT)

| ID | Requirement | Priority |
|---|---|---|
| SET-1 | Appearance: system, light or dark. | P0 |
| SET-2 | About screen with the version, a privacy policy link, and the disclaimers in section 16. | P0 |
| SET-3 | Reset all data, with an in-app confirmation. | P0 |
| SET-4 | Diet and allergy filters act as hard rules: a matching ingredient or dish is never shown, and the engine never relies on the user noticing a hint. | P1 |
| SET-5 | Units: metric or US customary for amounts. | P1 |
| HLT-1 | Every dish carries one lighter swap or balance tip (P0, content). | P0 |
| HLT-2 | Plate nudge rules are defined in section 9.6. | P1 |
| HLT-3 | No medical, weight-loss or nutritional claims in the app or the store listing. | P0 |

### 8.7 Cross-cutting

| ID | Requirement | Priority |
|---|---|---|
| X-1 | Fully offline. Every v1.0 feature works without a network connection. | P0 |
| X-2 | No account, no sign-in. All data stays on the device. | P0 |
| X-3 | Light and dark themes, following the system by default. | P0 |
| X-4 | English only, with all user-facing strings in a resource file ready for translation. | P0 |
| X-5 | Portrait orientation only on phones. | P0 |
| X-6 | Data is stored with a schema version and migrations so later releases never lose favorites or the cook log. | P0 |

## 9. Matching engine specification

The engine is a pure function: given the pot and the dish library, it returns results. It has no UI, no network and no randomness, so it is unit-testable and can later run on a server unchanged. This section describes the behavior proven in prototype v1.

### 9.1 Inputs
- **Pot items**: each has a category, a name, and tags.
- **Dish library**: each dish defines which tags fit each category, a cuisine, signature items, defaults and content (section 11).

### 9.2 Tagging
Each favorite gets tags by keyword match on its name within its category. Examples: "Chicken thighs" gets `chicken`. "Hot honey" gets `hot` and `honey`. "Smoked paprika" gets `paprika` and `smoky`. "Rice noodles" gets `noodles` and `rice`. Items that match nothing have no tags and are treated as unknown (still usable, lower weight). The full keyword table moves from the prototype into the engine package.

### 9.3 Scoring each dish
For each pot item against a dish:

| Case | Points |
|---|---|
| A tag fits the dish's list for that category ("fit") | 10 plus a specificity bonus of 0 to 4: `round(4 x (1 - min(list length, 12) / 12))`. Shorter lists score higher. |
| Spice or sauce that suits the dish's cuisine, or a universal tag such as garlic ("vibe") | 5 |
| Unknown item (no tags) in spice or sauce | 4 |
| Unknown item in protein, veg or starch | 3 |
| Known protein, veg or starch the dish does not use | 1, and the item is left out |
| Known spice or sauce that clashes with the cuisine | 0, and the item is left out |

Add **+6 for each signature match** the dish defines (for example, tortillas for tacos, pasta for a pasta skillet, salsa for a burrito bowl). The dish score is the sum.

### 9.4 One or few
1. Sort dishes by score, then by number of items used, then by library order (stable).
2. Candidates are dishes with a score of at least **88%** of the top score and that use at least (top used minus 1) items.
3. Show up to **3** candidates. If exactly one qualifies, the result is a **single winner** and is presented as the hero card with steps expanded.

### 9.5 Card construction
- **Title**: the dish's template filled with the first used protein and first used veg, in title case.
- **Used / left out**: items scored as used, and items scored as left out (shown struck through with a reason on long-press).
- **Chef adds**: for each category with no used item, the dish's default for that category, shown with a dashed outline.
- **Steps**: the dish's steps with placeholders filled from the used items (or defaults).
- **Wildcard**: when the pot has two or more items, a template name built from the first protein, first veg, a style chosen by the starch, and the sauce.

### 9.6 Plate nudge rules (P1)
- Protein, veg and starch all present: "Balanced plate".
- Protein and starch present, no veg: nudge toward a vegetable ("about half the plate").
- None of protein, veg or starch: suggest adding one for sharper matches.
- Otherwise: skipped categories are left to the chef.

### 9.7 Golden tests (acceptance for the engine)
The ported engine must reproduce these prototype v1 outcomes exactly. They become the first unit tests.

| Pot | Expected |
|---|---|
| Chicken thighs, Broccoli, Jasmine rice, Ginger, Soy sauce | 3 results: Chicken Thighs & Broccoli Stir-Fry, Chicken Thighs Fried Rice, Glazed Chicken Thighs & Broccoli Bowl |
| Cozy night: Chicken thighs, Carrots, Baby potatoes, Italian herbs | 3 results: Sheet-Pan, Hearty Stew, Skillet Hash (each "uses 4 of 4") |
| Fresh and light: Salmon, Zucchini, Quinoa, Lemon pepper, Pesto | 1 result: Lemon-Herb Salmon with Zucchini |
| Spicy kick: Ground beef, Bell peppers, Jasmine rice, Cumin, Salsa verde | 1 result: Ground Beef Burrito Bowl |
| Ten-minute meal: Eggs, Spinach, Sourdough, Chili flakes | 1 result: Spinach & Egg Scramble |

The 16 dishes behind these results are in `prototype/v1/index.html` and are the seed for the v1.0 library.

## 10. Data model

All data lives on the device. Every stored record set carries a schema version.

| Entity | Fields |
|---|---|
| **Favorite** | id, name, category (protein, veg, spice, sauce, starch), tags (list), icon, created date |
| **Pot** | list of favorite ids (max 3 per category, 12 total), last-used timestamp |
| **Dish** (bundled, read-only) | id, cuisine, title template, time, feel, wants (tags allowed per category), signature (category and tag pairs), defaults (one per category), steps, tip, ingredient amounts (P1) |
| **Result** (computed, not stored) | dish, score, used items, chef adds, left-out items, title, steps |
| **CookLogEntry** | id, dish id, title as shown, pot snapshot (item names), cooked date, rating (P1) |
| **Settings** | theme, units (P1), diet and allergy filters (P1), onboarding completed flag, schema version |

## 11. Dish library

- Stored as data files in the repo, one record per dish, validated against a schema in CI. A malformed dish fails the build.
- Launch target: **60 dishes** across at least seven cuisines (the prototype has 16 across seven). Aim for broad coverage of common protein, veg and starch combinations so sparse pantries still get a good answer.
- Each dish needs: a tested recipe, 3 to 5 plain steps, a lighter tip, and a food-safety review (cooking temperatures, cross-contamination notes where relevant).
- Content authoring and review workflow is an open question (section 19).

## 12. UX requirements

### 12.1 Layout (phone)
- Top to bottom: compact header, mood starters (horizontal scroll), the pot, a one-line contents summary, the category toggle strip, the tile row, then a bottom bar with the item count, **Empty**, and **Cook it up**.
- Results appear below the pot area and are reached by scrolling or automatically after Cook it up. A **Back to the pot** control returns to the top.
- Reference: prototype v1 at phone width.

### 12.2 Interaction
- Drag target is the whole pot including a small margin. The drag ghost sits about 36 pt above the finger so it is not hidden.
- Drag, tap, and remove must all feel instant. Pot tokens plop in with a short settle animation.
- Category colors are consistent everywhere: protein coral, veg green, spice berry, sauce violet, starch mustard. Color is never the only signal; labels and badges always accompany it.

### 12.3 Motion
- Simmer animation 1.1 seconds or less. Steam rises, tokens bob, the pot shakes slightly.
- Respect the system "reduce motion" setting: no flight, shake or bob; results appear immediately.

### 12.4 Accessibility (P0)
- Everything doable by drag is doable by tap, and by screen reader actions ("Add Salmon to the pot", "Remove Salmon from the pot").
- Full VoiceOver and TalkBack support with meaningful labels. The pot announces its contents and changes.
- Dynamic Type and Android font scaling up to at least 200% without clipped text. Tile row and cards reflow.
- Minimum touch targets of 44 x 44 pt (iOS) and 48 x 48 dp (Android).
- Text contrast of at least 4.5:1 in light and dark themes.

### 12.5 Content tone
Plain and direct. Controls say exactly what they do. Errors explain what happened and how to fix it. No jokes in instructions.

### 12.6 Icons
The prototype uses emoji as ingredient icons. Emoji look different on iOS and Android and some newer ones are missing on older Android versions. For v1.0, use emoji only for items that render reliably on the minimum supported OS versions, and fall back to a category icon. A custom illustrated icon set is P2.

## 13. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Drag runs at 60 fps on a mid-range Android phone about three years old. Cold start to interactive in 2.5 seconds or less. Cook it up results in under 100 ms of compute (animation excluded). |
| Reliability | Crash-free sessions of 99.5% or better. No data loss across upgrades (X-6). |
| Offline | Everything works with no connection. |
| Size | Install size kept lean. Target under 40 MB download on Android and under 60 MB on iOS, to be confirmed against the framework baseline. |
| Supported OS | iOS 16 and later, Android 8.0 (API 26) and later. Confirm against the framework version chosen at kickoff. |
| Privacy | No personal data collected in v1.0 beyond optional crash diagnostics. See section 16. |
| Quality | Engine has automated tests including the golden tests. Core flows have automated end-to-end tests on both platforms. |
| Localization readiness | All strings externalized. Layouts tolerate roughly 40% longer text. |

## 14. Technical approach

### 14.1 Recommendation
Build **one codebase in React Native with Expo and TypeScript**, shipping to both stores. This is the recommended stack, with alternatives below. "Code-first" here means hand-written code in this repository rather than a no-code builder.

Why this fits:
- One codebase and one team skill (TypeScript) cover iPhone and Android. The prototype is already JavaScript, so its logic ports directly.
- The drag interaction is the heart of the app. Gesture Handler and Reanimated run gestures and animation on the UI thread, which is what keeps drag at 60 fps.
- Expo's build and release service handles signing, store submission and over-the-air fixes, which removes most of the release tooling work for a small team.
- The matching engine can be a plain TypeScript package with no mobile dependencies, reusable later on a server.

### 14.2 Stack

| Layer | Choice | Notes |
|---|---|---|
| App framework | React Native with Expo (development builds), TypeScript in strict mode | |
| Navigation | Expo Router | File-based routes |
| Gestures and animation | React Native Gesture Handler and Reanimated | UI-thread drag, flight and simmer animation |
| Graphics | react-native-svg for the pot | Revisit Skia only if profiling demands it |
| State | Zustand with persisted slices | Small, minimal boilerplate |
| Storage | On-device key-value store (MMKV) with versioned JSON | Move to SQLite only if the cook log needs queries |
| Validation | Zod | Dish files and persisted data |
| Engine | Pure TypeScript package, no React imports | Fully unit tested |
| Haptics | expo-haptics | |
| Testing | Jest and React Native Testing Library; Maestro for end-to-end on both platforms | |
| Lint and format | ESLint and Prettier | Enforced in CI |
| Build and release | EAS Build, EAS Submit, EAS Update | Over-the-air updates only for compliant JavaScript fixes |
| CI | GitHub Actions: lint, typecheck, tests on every pull request; release builds on tags | |
| Crash reporting | Sentry (P1), disclosed in the privacy labels | Optional; see open questions |

Library versions are chosen at kickoff against the current Expo SDK. Do not pin versions in this document.

### 14.3 Alternatives considered

| Option | Strengths | Why not first choice |
|---|---|---|
| Flutter | Excellent animation, single codebase | New language (Dart), no code sharing with a TypeScript backend, none of the prototype ports directly |
| Native Swift and Kotlin | Best platform feel and performance | Two codebases and roughly double the work for a two-platform v1 |
| Capacitor around the web prototype | Fastest start, reuses the prototype | Touch drag and animation feel is weaker, and a web wrapper risks store rejection under Apple's minimum-functionality guideline (4.2) |
| Progressive web app only | No store, easiest updates | Does not meet the goal of a store app on iPhone and Android |

### 14.4 Architecture

```
UI (screens, pot, pantry, results)
   | reads and writes
State store (favorites, pot, settings, cook log), persisted on device
   | calls
Engine (pure TypeScript): tag -> score -> select -> build cards
   | reads
Dish library (data files, schema-validated, bundled in the app)

Later (v2):  Engine --fallback--> AI Chef client --HTTPS--> API proxy --> LLM provider
```

### 14.5 Planned repository layout

```
potluck/
  apps/mobile/        Expo app
  packages/engine/    matching engine, pure TypeScript
  packages/dishes/    dish library data and schema
  docs/               PRD, product plan, decision records
  prototype/v1/       the web prototype (reference, not shipped)
```

A workspace-based monorepo keeps the engine and dish library importable by both the app and, later, a backend.

### 14.6 Testing and quality gates
- Engine: unit tests for tagging, scoring, one-or-few selection, card construction and every golden test in section 9.7.
- Dish library: schema validation and a check that every dish has steps, a tip and defaults for all five categories.
- App: component tests for pantry, pot limits and results states. End-to-end flows: first-run setup, drag to the pot, tap to add, cook, make tonight.
- Performance check on a real mid-range Android phone and an older supported iPhone before each beta.

## 15. AI roadmap

| Stage | What it is | Release |
|---|---|---|
| Rules | Tags and a hand-written dish library. Fast, free, predictable, offline. | v1.0 |
| AI chef | The wildcard card becomes a generated recipe: dish name, amounts and steps built around the exact pot, the diet filters and available time. | v2.0 |
| AI that knows you | Learns from ratings and the cook log, suggests new favorites, plans a week of pots and a grocery list. | v3.0 |

### How the AI chef should work (design intent for v2)
- The app sends the pot, the pantry summary, diet and allergy filters and time available to a small backend. The backend calls a language model and returns a recipe in a fixed structured format. The app never holds a model API key.
- **Allergen and diet checks run in code** on the returned recipe, against the user's stored filters. They never rely on the prompt alone. A recipe that fails is discarded and the rules engine answers instead.
- Safe-cooking guidance (temperatures for poultry and similar) is included and checked by simple rules.
- The rules engine remains the offline and failure fallback.
- Per-user rate limits and a monthly cost ceiling protect against runaway spend.
- If the backend is hosted on AWS, keep every Regional resource in the project's assigned Region and confirm the chosen model is available there before committing to the design. Billing and spend limits are managed in AWS Settings.

AI is outside the v1.0 build. This section exists so v1.0 choices (a pure engine, structured dish data, a fallback path) do not block it.

## 16. Privacy, security and compliance

- **No accounts and no personal data off the device** in v1.0. Favorites, pot and cook log are local.
- Crash reporting and analytics are optional and, if used, disclosed accurately in Apple's privacy details and Google's data safety form. Analytics, if added, is opt-in and anonymous.
- A **privacy policy** at a public URL is required by both stores before submission.
- **Disclaimers** in About and in the store listing: Potluck gives cooking ideas, not medical or dietary advice, and suggestions are not a guarantee of allergen safety. Users must check ingredients themselves.
- No medical, treatment or weight-loss claims anywhere (HLT-3).
- Over-the-air updates are limited to JavaScript fixes that do not change the app's primary purpose.
- Secrets (signing keys, store keys, tokens) are never committed. The repository ignores them (see `.gitignore`).

### Store requirements checklist
- Apple Developer Program membership (currently about US$99 per year) and Google Play Console registration (currently about a one-time US$25). Confirm current fees.
- App name, subtitle, description, keywords, support URL, privacy policy URL.
- App icon and screenshots for required device sizes on each store.
- Age and content rating questionnaires on both stores.
- Apple: TestFlight beta, then App Review. Google Play: internal testing, then closed testing. New personal Google developer accounts must run a closed test with a minimum number of testers for a minimum period before production access (at last check, 12 testers for 14 days). Confirm the current rule, because it directly affects the schedule.

## 17. Release plan and milestones

Effort sizes are relative (S, M, L), not calendar estimates. Convert them to dates once team size is known.

| Milestone | Scope | Exit criteria | Size |
|---|---|---|---|
| **M0 Prototype v1** (done) | Web prototype: setup, pot, results, plan | Reviewed and approved. Tagged `prototype-v1`. | done |
| **M1 Foundations** | Expo project, CI, design tokens, engine ported to TypeScript, dish schema, first 30 dishes | All golden tests pass. CI green on every pull request. | M |
| **M2 Core loop** | Setup flow, pantry, pot with drag and tap, cook and results, persistence | A tester can complete the full loop on iPhone and Android. Drag holds 60 fps on the reference devices. | L |
| **M3 Content and polish** | 60 dishes, recipe view, cook log, settings, haptics, dark mode, accessibility pass, store assets | Accessibility checklist passes on both platforms. Content review done. | L |
| **M4 Beta** | TestFlight and Play closed testing, feedback fixes | Crash-free sessions of 99.5% or better. Success metrics baseline captured. | M |
| **M5 Launch v1.0** | Store submission and release | Live on both stores. | S |
| **M6 v1.1** | Diet and allergy filters, ratings, custom moods, more dishes | | M |
| **M7 v2.0** | AI chef, backend proxy, monetization decision | | L |

## 18. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Dish library is expensive to author and review | Weak results on sparse pantries, schedule slip | Start with the 16 prototype dishes, add in batches with a clear template, review food safety, track coverage against common pantry combinations |
| Matching feels random with small pantries | Users lose trust | The "chef adds" mechanic fills gaps, golden tests lock behavior, the setup flow encourages 10 or more favorites |
| Drag is awkward on small phones or for some users | Core interaction fails | Tap is always an equal alternative, drag handoff rules (vertical drag only), usability tests on small devices |
| Emoji icons render inconsistently | Looks unpolished on some Android devices | Limit to reliable emoji, category fallback, custom icons as P2 |
| Store review friction (minimum functionality, health claims, privacy forms) | Launch delay | Native app (not a web wrapper), no medical claims, accurate privacy forms, early TestFlight |
| New Google developer account closed-test requirement | Launch delay on Android | Start the closed test early in M4, recruit testers during M3 |
| Scope creep toward AI, accounts or social | v1.0 slips | Non-goals in section 4 are binding for v1.0 |
| Recipe or content licensing problems | Legal exposure | Author original dishes, do not copy recipes |
| Future AI cost or safety issues | Budget and trust | Server-side proxy, rate limits, code-level allergen checks, rules fallback |

## 19. Open questions and decisions

### Decided
- Veg and Starch are separate categories.
- Category order is Protein, Veg, Spice, Sauce, Starch.
- Pot and pantry share one screen, with drag and tap both supported.
- Target is native apps on iPhone and Android, built code-first.

### Open, with a recommended default

| # | Question | Recommendation |
|---|---|---|
| 1 | One pot per meal, or one per person at the table? | One pot per meal in v1.0. Revisit with household features later. |
| 2 | Should oil, salt, pepper and water always be assumed? | Yes. List them as "pantry staples" in the recipe view so they never need a pick. |
| 3 | Where do dishes come from? | A hand-authored library for v1.0 (original recipes). Add AI in v2. Avoid licensed recipe data for now (cost and terms). |
| 4 | Ingredient amounts in v1.0? | Amounts for 2 servings as P1, scaling as P2. Steps alone are P0. |
| 5 | Monetization? | Free v1.0. Consider a subscription when the AI chef ships, since it has a running cost. |
| 6 | Final app name? | Treat "Potluck" as a placeholder. Check store name availability and trademarks before any icon or store asset work. |
| 7 | Accounts and sync? | Not in v1.0. Local-first, add accounts with v3. |
| 8 | Tablet support? | Phone-first. The app runs on tablets but is not optimized. |
| 9 | Analytics and crash reporting? | Crash reporting yes (disclosed). Analytics opt-in and minimal, or none for v1.0. |
| 10 | Who authors and reviews dishes? | Decide before M1 ends. Food-safety review is required either way. |

## 20. Appendix

### A. Prototype v1 reference
- Location: `prototype/v1/index.html` (open it in a browser).
- Behaviors proven there: five-category setup, category toggles with counts, drag and tap into the pot, mood starters, stale results, one-or-few results with used, chef-adds and left-out chips, plate nudge, wildcard card, light and dark themes, phone layout with a bottom action bar.
- Behaviors in the prototype that the app must change: favorites and pot are kept in memory (the app persists them), the dish library has 16 dishes (the app needs 60), and "Make this tonight" only shows a message (the app opens the recipe view and logs it).

### B. Glossary
- **Pantry**: the user's list of favorite foods.
- **Pot**: the current selection, up to 3 per category and 12 in total.
- **Tag**: a keyword-derived label on an ingredient, such as `chicken` or `soy`.
- **Fit / vibe / signature**: the three ways an ingredient can raise a dish's score (section 9.3).
- **Chef adds**: a default ingredient the dish supplies for a category the user left empty.
- **Wildcard**: the extra card where AI-written recipes arrive in v2.
