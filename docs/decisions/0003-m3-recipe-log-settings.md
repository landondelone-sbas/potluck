# 0003: M3 recipe, cook log, settings and accessibility

Status: partly accepted. Records what part of milestone M3 was built, the choices made, and what is blocked and on whom. M3 is not finished: its exit criteria need two things this work could not supply (see "Blocked").

## What was built

| PRD | What |
|---|---|
| RES-5 | "Make this tonight" saves a cook log entry and opens the recipe. Pressing it again for the same dish opens the same recipe and does not log it twice. |
| REC-1 | The recipe screen: title, time and feel, ingredients, numbered steps and the lighter tip, in larger type than the rest of the app. |
| REC-3 (P1) | A "keep the screen on while cooking" switch on the recipe screen. |
| REC-4 | The cook log: dishes made, newest first, with the day. Tap one to open its recipe. |
| SET-1 | Appearance: match my phone, light or dark. |
| SET-2 | An About screen with the version and the disclaimers from PRD section 16. The privacy policy link is built and waits for a URL. |
| SET-3 | Reset all data, behind a confirmation. |
| ONB-6 (P1) | "Add more favorites" in Settings walks the setup steps again and keeps what is there. |
| PRD 9.5 | Touching a dashed or struck-through ingredient chip says in words what it means. |
| 12.3, 12.4 | An accessibility pass and a checklist for the device session. See [accessibility-checklist.md](../accessibility-checklist.md). |

## Decisions

**The cook log keeps the pot, with categories, not just names.** A recipe is rebuilt from the dish and the saved pot with the same engine call that made it, so the rebuilt card equals the one shown (a test checks this for several pots and every dish they produce). The user can then remove favorites, or reset the pantry, and an old recipe still opens. The title is stored as it was shown. If an app update removes a dish, the entry stays and says so.

**The cook log entry changed shape inside saved-data version 1.** The M2 entry held only names. No build with version 1 has gone to a user, so there is no data to protect and no migration was written. Old entries, if any, are dropped by the repair step. From the first beta (M4) any change to what is saved needs a version bump and a migration.

**Pantry staples are listed on the recipe: oil, salt, pepper and water.** This is the recommended default for PRD open question 2. It is one line of text and easy to change.

**No amounts yet.** REC-2 (amounts for two servings), REC-5 (scaling) and SET-5 (units) need amounts in the dish data. The dish files have none. They are tied to the content work below.

**Keep-awake is a saved setting, off by default.** It is a battery cost, so it is the user's choice, and it is remembered so a cook does not have to switch it on every time.

**Appearance uses the phone's app-level color scheme override.** One call changes every screen and the system parts (header, keyboard) together. The browser preview used for development does not have it, so the call is guarded.

**Reopening setup is a per-session flag, and it skips the welcome screen.** Setup is closed once done. Settings opens it, then goes to the first step, so the header's back arrow returns to Settings. Finishing returns to the pot. If the user leaves partway, the flag lasts until the app is closed, which does nothing visible.

**Reset removes everything,** including settings and the copy kept of unreadable data (ADR 0002). Afterwards the app is as new and shows setup.

**Navigation to the cook log and Settings is two text buttons in the pot screen's header.** No icon set has been chosen (PRD 12.6). The buttons cap their text at 130 percent so the title is never pushed out.

**Pot changes are announced to screen readers with the new count,** instead of relying on a live region, which only Android honors.

**Text size rules (PRD 12.4).** Pantry tiles and category tabs widen with the text up to 200 percent, tabs wrap onto more rows, and the bottom bar wraps. Emoji do not scale. Content text has no size cap. The fixed pot layout switches to a scrolling one when text is enlarged or the phone is short (ADR 0002).

**A `danger` color for destructive text.** It has a test for contrast in both themes.

## Blocked

These are the open parts of M3. None can be finished by more code.

1. **60 dishes.** The library has 60 (batches 1 to 4 and the steak dishes were drafted afterwards: see [0004](0004-m3-dishes-batch-1.md), [0005](0005-m3-dishes-batch-2.md) and [0006](0006-m3-dishes-batch-3.md)). The PRD asks for 60 across at least seven cuisines, each with a tested recipe, a lighter tip and a food-safety review. The plan is regions, in batches of about ten, with the owner cooking and reviewing each batch. Each batch is rechecked against the golden tests. This is the largest piece of M3 and the one that decides the "content review done" exit criterion.
2. **Store assets.** PRD open question 6 says to check the name and trademark before any icon or store asset work, and the name is still a placeholder. Needed from the owner: the name, the iOS bundle identifier and Android package, a privacy policy page at a public URL, and the age-rating answers. After that: the app icon, splash, screenshots for each required device size, and listing text.
3. **The privacy policy link.** `PRIVACY_POLICY_URL` in `src/config.ts` is empty, so About hides the link. Both stores require the page before submission.
4. **The accessibility checklist on both platforms.** It needs a person with an iPhone and an Android phone. The checklist is ready to fill in.

## Known polish, not done

- Steps read "italian herbs" and "jasmine rice" in lowercase, because the engine lowercases item names when it fills a step. This is prototype v1 behavior, and the parity test locks it. Fixing it changes the engine on purpose: do it together with retiring the parity test (ADR 0001).
- The recipe has no share or print option.
- The cook log cannot delete an entry.

## What was and was not verified

Checked: lint, typecheck, 342 tests across the three projects, format, a Metro bundle for iOS and Android, and expo-doctor, all from a clean install. The new code was also broken five ways on purpose (recipe order, duplicate logging, appearance values, tile text size, token removal announcement) and each break failed a test.

Checked in a browser at phone size, with real clicks: Cook it up, Make this tonight, the recipe, the cook log, Settings, and "Add more favorites" through to its back arrow. The saved data from the M2 build loaded without trouble.

Not checked: anything on a phone. That covers dark mode through the phone's override, Reset all data's confirmation dialog, keep-awake, the enlarged-text layouts, screen readers, haptics, and the 60 fps drag from M2.
