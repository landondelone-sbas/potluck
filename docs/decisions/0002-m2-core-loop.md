# 0002: M2 core loop

Status: accepted for M2. Records what was built in milestone M2, where it differs from the PRD, and what is not yet verified.

## What M2 delivers

The full loop from PRD section 7 runs in the app: first-run setup, the pantry, the pot with drag and tap, mood starters, cook, results, and saving a dish to the cook log. Everything is saved on the device and works offline.

```
src/domain/    Pure rules, no React: favorites, pot limits, moods, icons, token slots, hit test
src/state/     One Zustand store, saved to the device, with a versioned and repairable format
src/components Pot, tiles, category strip, drag layer, result card, buttons
src/app/       Routes: setup/*, index (the pot), results
```

## Decisions

**Storage is AsyncStorage, not MMKV (PRD 14.2).** MMKV needs a native development build and cannot run in Expo Go, which is how the README tells people to run the app. The data is a few kilobytes of JSON, so MMKV's speed is not needed. All device storage goes through one file, `src/state/storage.ts`, so swapping the library later is a one-file change.

**Results are their own screen, not a panel below the pot (PRD 12.1).** The pot screen is a fixed layout so a vertical drag from a tile can never fight a page scroll. I could not test that conflict on a real device, and a drag that sometimes scrolls the page would break the core interaction. A pushed screen also gives the native back gesture and the Android back button, and moves screen reader focus to the new content. RES-4 still holds: the last results are kept, and when the pot changes the pot screen shows "Results are out of date" and the results screen says so and dims the cards. This is a product call, so it is flagged for review.

**Fixed layout, with a scroll fallback.** The pot shrinks to fit short phones (down to 120 pt tall, tokens shrink with it). Below 600 pt of window height, or above 1.3x text scale, the screen scrolls instead, so enlarged text is never clipped (PRD 12.4). Tapping works in both layouts; dragging in the scrolling layout is untested.

**Tapping a tile animates the token in; only dragging uses a ghost.** The token rises from below the pot into its slot. This avoids measuring the tile and the pot for a flight, and it still reads as "from the pantry". A drag shows a ghost 36 pt above the finger and the token pops in on drop.

**Favorites store name, category, id and date only.** Tags and icons are worked out from the name every time (PRD section 10 lists them as stored). An app update that improves the tag table then improves existing favorites with no migration. PAN-6 (a "what kind is it?" picker, P1) will need an optional stored override.

**Emoji baseline is Unicode Emoji 5.0 (PRD 12.6).** Android 8.0 shows Emoji 5.0; newer emoji appear as an empty box there. These fall back to the category icon: bell peppers, red onion, leafy greens such as spinach, and garlic. Raising `MAX_EMOJI_VERSION` in `src/domain/icons.ts` switches them on. The Android 8 mapping is from memory of the Unicode and Android release notes and should be checked on a device.

**The 88 percent rule, scoring and tags are untouched.** M2 calls the M1 engine as it is. The mood starters cook to the PRD section 9.7 results, and a test proves it.

**Saved data is repaired, never fatal.**
- Each damaged record is dropped on its own, so one bad favorite never costs the rest.
- The saved pot is replayed through the normal pot rules, so limits hold.
- Unreadable data is copied to `potluck.state.unreadable` before the app starts empty.
- A failing read or write cannot stop the app starting. The app waits for loading before it shows anything, so a thrown error here would otherwise leave it on the splash screen.
- The format has a version number and a migration chain (`MIGRATIONS` in `src/state/persisted.ts`). There is nothing before version 1 yet, so the chain is empty and tested with injected steps.

**Setup and the pot are separate route groups.** `Stack.Protected` in the root layout allows setup only before "Open the pot" and the pot only after it. Tests run the real layout to prove a new user cannot reach the pot and a returning user cannot reach setup.

**Fonts load by file, not by package.** Each weight is required from its own file. The package index requires every weight and Metro would bundle them all. The app bundles four font files.

**Touch targets are 48 pt everywhere** (PRD 12.4 asks for 44 pt on iOS and 48 dp on Android). Pot tokens are 30 to 40 pt and get extra hit area to reach 48.

**The category count badge is an ink circle with a category-colored ring.** White text on the mid-tone category colors (protein, veg) fails 4.5:1 in the light theme, and a test caught it.

## Coverage against the PRD

| Requirement | State |
|---|---|
| ONB-1 to ONB-5 | Done and tested. |
| ONB-6, ONB-7 (P1) | Not done. Settings arrive in M3. |
| PAN-1 to PAN-5 | Done. |
| PAN-6, PAN-7 (P1) | Not done. |
| POT-1 | Verified in a browser at 390 x 780 and 360 x 640. Not verified on a device. |
| POT-2, POT-3 | Drag and drop verified in a browser with a real pointer. Horizontal scroll versus vertical drag is set by the gesture thresholds and is not verified on a device. |
| POT-4 to POT-8 | Done and tested. |
| POT-9, POT-10, POT-12 (P1) | Done. Haptics are unverified on a device. |
| POT-11 (P2) | Not done. |
| RES-1 to RES-3, RES-8 | Done. Struck-through items say "left out" to a screen reader; PRD 9.5's reason on long-press is not built. |
| RES-4 | Done, through a separate results screen. |
| RES-5 | Half done. It saves a cook log entry and shows "Saved for tonight". The recipe screen and the cook log screen are M3 (REC-1, REC-4). |
| RES-6 (P1) | Done. |
| RES-7 (P1) | Not done. The log entry has a `rating` field ready. |
| X-1 to X-6 | Done. Appearance follows the system; the manual choice is SET-1 in M3. |

## Not yet verified

- **60 fps drag on the reference devices.** This is an M2 exit criterion. Nothing here has run on a phone. The drag runs on the UI thread through Reanimated, which is the design that should hold it, but that is a design, not a measurement.
- **Android and iPhone rendering.** The screens were checked in a browser, in light and dark. The browser is a stand-in: it does not exercise native gestures, haptics, safe areas, emoji fonts or screen readers.
- **Screen reader behavior.** Labels, hints and actions are set. None has been heard in VoiceOver or TalkBack.
- **Drag and the Android back gesture, keyboard handling, and the 200 percent text layout** on a device.

## Testing

Jest runs the app through the `jest-expo` preset with these additions: the Reanimated resolver, the worklets mock, the gesture handler setup, and mocks for AsyncStorage, haptics and safe-area insets. Screens render inside a gesture handler root, as the app does. A gesture handler version newer than 3.3 has a switch to skip that check.

Not coverable in Jest: the finger-to-ghost wiring. The drop decision, the provider logic and the saved ghost position are tested separately, and the whole path was exercised in a browser.

Checks run: lint, typecheck, 261 tests across the three projects, format, a Metro bundle for iOS and Android, and expo-doctor. The tests were also checked by breaking the code four ways on purpose (per-category limit, first-launch loading, drop margin, mood matching), and each break failed a test.

## Tuning notes for the first device session

- `DRAG_SLOP` (10 pt) and `SCROLL_SLOP` (12 pt) in `pantry-tile.tsx` decide drag versus scroll. A drag is chosen when the finger moves more than 10 pt vertically before 12 pt sideways, which is about 40 degrees from horizontal. Loosen or tighten after trying it with a thumb.
- `TAP_AFTER_DRAG_MS` in `drag-context.tsx` ignores the click a browser sends after a drag. Native is expected not to need it.
- The ghost and the pot are positioned from window coordinates. If they are offset on a device, check how `measureInWindow` treats the status bar on that platform first.
