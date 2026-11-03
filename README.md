# Potluck

A recipe finder that starts from the foods you already love. Pick your favorites by category, drop them in a pot with your finger, and get one dish (or a few) back.

Working name. Planned as native iPhone and Android apps, built code-first.

## Status

| | |
|---|---|
| Prototype v1 | Done. A single-page web prototype. |
| PRD | Draft 0.1 |
| App | Not started. No application code yet. |

## What is here

```
docs/
  PRD.md              Product requirements for the iPhone and Android app
  product-plan.md     The concept plan from prototype v1
prototype/
  v1/index.html       The v1 prototype. Open it in a browser.
```

## View the prototype

Open `prototype/v1/index.html` in any modern browser. It has three tabs: Cook (the pot), Set up (the first-run flow) and Plan. On a phone-sized window the pot and your favorites share one screen, and you can drag favorites into the pot or tap them.

Favorites are kept in the browser's local storage. The dish library in the prototype has 16 dishes and is rule-based, with a labeled placeholder where AI will go.

## Next step

Milestone M1 in the PRD: set up the Expo project and CI, port the matching engine to TypeScript, and pass the golden tests in PRD section 9.7.

## Planned layout once code starts

```
apps/mobile/        Expo (React Native, TypeScript) app
packages/engine/    matching engine, pure TypeScript
packages/dishes/    dish library data and schema
docs/               PRD, plan, decision records
prototype/v1/       the web prototype
```
