# Potluck: Product Plan

Working name Potluck. This is the concept plan that came out of prototype v1. The detailed requirements are in [PRD.md](PRD.md).

## The idea

A recipe finder that starts from what you already love. On first launch you list the foods you like, sorted into five categories. After that, dinner is a mood: you drop favorites into a pot and the app hands back one dish, or a short list, built around them.

Principles:
- **Your food, not a database.** Every ingredient in the pot comes from your own list.
- **A mood, not a query.** You choose by feel. No typing, no filters to tune.
- **One answer or a few.** One dish when the pot points at one, up to three when it is a toss-up.

## How a session flows

1. **Set up** (first launch only). Walk the five categories, tap suggestions, add your own. Skip anything.
2. **Choose a mood.** The pot and your favorites share one screen. Toggle a category, then drag favorites into the pot with your finger, or tap. Up to three per category.
3. **Cook it up.** The pot simmers while the app scores dishes against what you chose.
4. **Plate.** One winner or up to three. Each shows what it used, what the chef added, and what it left out.
5. **Learn.** Mark what you made and rate it. Foods you try can join your pantry in one tap.

## Five categories, one pot

Order on screen: Protein, Veg, Spice, Sauce, Starch.

| Category | Role |
|---|---|
| Protein | The star of the plate |
| Veg | Half the plate |
| Spice | The personality |
| Sauce | The finish |
| Starch | The base: rice, pasta, potato, bread |

A category left empty is left to the chef. Skip the starch and the dish brings its own.

## How the pot decides

- Every ingredient is tagged. "Chicken thighs" becomes chicken, "Hot honey" becomes hot and honey. Unknown items still count, at lower weight.
- Each dish lists which tags fit each category. A fit scores highest. A spice or sauce that suits the dish's cuisine scores less. Anything else is left out, and the card says so.
- Signature items give a bonus: tortillas pull toward tacos, pasta toward a pasta skillet.
- If the top dish clearly beats the rest, you get one. If several land within about 12 percent of it, you get up to three.
- The wildcard card is where AI takes over later.

## Eating well, built in

- A plate nudge under the pot. No veg yet? It says so.
- Every dish carries one lighter swap, like brown rice or extra veg.
- Diet and allergies act as hard filters, never gentle hints.
- Later: calories and macros per serving, and a weekly balance view.

General guidance only, not medical or dietetic advice.

## Where AI comes in

| Stage | What |
|---|---|
| Rules (prototype and v1.0) | Tags and a hand-written dish library. Fast, predictable, free to run. |
| AI chef (v2) | The pot, pantry, diet and time go to an AI model. It returns a dish name, amounts and steps in a fixed format. |
| AI that knows you (v3) | Learns from ratings, suggests new favorites, builds a week of pots and a grocery list. |

Guardrails: check allergens in code against the stored filters, never only in the prompt. Keep the rules engine as the offline fallback.

## Build phases

0. **Prototype v1** (done). Proves the pot interaction and the one-or-few results.
1. **First app.** iPhone and Android, favorites on the device, a 60-dish library, real setup flow.
2. **AI chef.** Generated recipes for the wildcard, allergen guardrails, save and share.
3. **Learning.** Ratings, taste profile, weekly planning, grocery list, accounts and sync.

## Decisions

- **Decided:** Veg and Starch are separate categories.
- **Decided:** Pot and pantry share one screen, drag and tap both work.
- **Decided:** Native iPhone and Android apps, built code-first.
- **Open:** pot size, staples, dish source, amounts in recipes, monetization, name. See PRD section 19 for recommendations.
