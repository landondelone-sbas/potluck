# Accessibility checklist

This is the M3 exit checklist (PRD section 17: "Accessibility checklist passes on both platforms"). It lists each requirement from PRD section 12.4 and 12.3, what is already covered by code and tests, and what a person must check on a real phone. The last two columns are for that session: fill them in, and note the phone and OS version.

"Automated" means a test in `apps/mobile/__tests__` fails if it regresses. It does not mean the platform's screen reader has been run. Nothing below has been run on a device yet.

## How to run the device session

Test on one iPhone (VoiceOver) and one Android phone (TalkBack), in light and dark, with the phone's text size at its largest. Run each flow below with the screen reader on and the screen dark if you can: you should be able to finish each flow without looking.

1. First run: welcome, five setup steps, summary, Open the pot.
2. Fill the pot by double-tapping tiles. Take one out. Press Cook it up.
3. Read the results. Make a dish tonight. Read the recipe.
4. Open the cook log and re-open an entry.
5. Settings: change appearance, open About, start Reset all data and cancel it.

## Screen reader

| Requirement | Automated | Check on device | iOS | Android |
|---|---|---|---|---|
| Everything done by drag can be done by tap (POT-4, 12.4) | Yes: tap path in `pot-screen.test.tsx`. | Add and remove an item without dragging. | | |
| Tiles offer "Add X to the pot" and "Remove X from the pot" as actions | Yes: `accessibility.test.tsx`. | Open the actions rotor (VoiceOver) or the local context menu (TalkBack) on a tile. | | |
| The pot announces what changed, with the new count | Yes: the message is sent to the platform. | Hear "Salmon added to the pot. 1 in the pot." after adding. | | |
| A refused add (pot full) is announced | Yes. | Fill a category past three and hear the message. | | |
| Every button, tab, radio and checkbox has a spoken name | Yes: all screens, `accessibility.test.tsx`. | Swipe through each screen and listen for any unnamed element. | | |
| Headings exist for each screen's sections | Yes. | Use the headings rotor (VoiceOver) or headings navigation (TalkBack). | | |
| Selected state is spoken for category tabs, tiles and appearance options | Yes: state is set. | Hear "selected" or "checked". | | |
| Ingredient chips say whether an item was used, added by the chef or left out | Yes: in their labels. | Listen to a result card. | | |
| The drag ghost and the pot picture are hidden from the screen reader | Set in code. | Confirm neither is read out. | | |
| Focus moves to the new screen after navigation | Platform default. | Open results, the recipe and settings. | | |

## Text size (PRD 12.4: at least 200 percent, no clipped text)

| Requirement | Automated | Check on device | iOS | Android |
|---|---|---|---|---|
| Text follows the system size, with no cap on content text | Partly: no caps remain on content, header buttons cap at 130 percent. | Set the largest size and read every screen. | | |
| Pantry tiles and category tabs widen with the text, and tabs wrap | Yes for the sizes. Not for how it looks. | Look for cut-off tile names and tab labels. | | |
| The pot screen scrolls instead of clipping when text is enlarged or the phone is short | Yes: layout choice is tested. | Confirm the Cook it up button is always reachable. | | |
| Cards and the recipe reflow | Layout is flexible. | Read a result card and the recipe at the largest size. | | |
| The bottom bar wraps | Set in code. | Confirm the count and buttons are all visible. | | |

Known risk: the browser preview cannot change text size, so the enlarged layouts have only been checked by tests of their rules. Expect to adjust spacing.

## Touch targets (PRD 12.4: 44 pt on iOS, 48 dp on Android)

| Requirement | Automated | Check on device | iOS | Android |
|---|---|---|---|---|
| Buttons, tiles, tabs, pills and rows are 48 pt or more | Set in code, not measured. | Use the platform's accessibility scanner (Android) or Accessibility Inspector (iOS). | | |
| Pot tokens (30 to 40 pt) have extra hit area to reach 48 | Set in code. | Remove a token with a thumb in a full pot. | | |

## Contrast (PRD 12.4: 4.5:1 for text)

| Requirement | Automated | Check on device | Light | Dark |
|---|---|---|---|---|
| Text colors on every surface they sit on | Yes: `tokens.test.ts`, both themes. | Read outdoors and at low brightness. | | |
| Category colors on surfaces (3:1, they are not text) | Yes. | | | |
| Count badge text | Yes: the badge is bg-colored text on an ink circle. | | | |
| Color is never the only signal: labels, badges and checkmarks always accompany it | By design. | Check with a grayscale filter on. | | |

## Motion (PRD 12.3)

| Requirement | Automated | Check on device | iOS | Android |
|---|---|---|---|---|
| With "reduce motion" on, results appear immediately | Yes. | Cook with the setting on. | | |
| With "reduce motion" on, there is no shake, bob, steam or token flight | By design: the animation value stays at zero. | Watch the pot. | | |
| The simmer is 1.1 seconds or less | Yes: constant. | | | |

## Input

| Requirement | Automated | Check on device | iOS | Android |
|---|---|---|---|---|
| The keyboard does not cover the field being typed in | Not testable. | Add a favorite in setup and on the pot screen. | | |
| Android back and the iOS back swipe work on every screen | Partly: the route rules are tested. | Back out of results, recipe, log, settings, and a reopened setup. | | |
| Portrait only (X-5) | Set in `app.json`. | Rotate the phone. | | |

## What the checklist does not cover

- Voice control and switch control. Not in the PRD's v1.0 scope.
- Right-to-left layouts. English only in v1.0 (X-4).
- Captions and audio. There is none.
