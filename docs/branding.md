# Tonight’s Pot: brand notes

A working brief for the name, the look and the store listing. The owner may make the logo separately; this says what it has to do. Nothing here is final until the owner says so.

## The name

**Tonight’s Pot.** Chosen 2026-11-06 from a short list. Checked on the iPhone App Store only (top results): no app with that name. It still needs a Google Play search, a web domain check and a US trademark search before any store release (PRD open question 6). "Potluck" was the working name and stays in the code, the repo and the Pages address (`/potluck/`). They are internal and not shown to users.

**Why it fits:** it answers "what's for dinner?" ("tonight") and names the app's one big idea (the pot you drop favorites into).

**The risk to design around:** "pot" alone can read as a slow cooker, a drug reference or a poker pot, and "Tonight’s" alone reads like a news or TV listing. The name does not say "food" by itself. Everything around it has to, which is the job below.

## Making it obviously food

The first glance, in the store grid or on a home screen, has to say *food and cooking* with no reading.

- **Always pair the name with food.** The store subtitle and the first screen carry the line that does the explaining. A starting point, to rewrite: *“Dinner from the food you already have.”*
- **The icon is a cooking pot with food in it.** Not a letter, not an abstract shape. A cooking pot with steam, and a few recognizable ingredients dropping in or peeking out (a tomato, a leaf of greens, a chicken drumstick or fish, a spoon). Warm, appetizing colors.
- **Steam is the signature.** It already exists in the app (the simmer animation). Steam rising from the pot is the shape that separates this from a crock pot or a poker chip.
- **A wooden spoon or a ladle** is the quickest second signal of cooking. Use it if the pot alone is ambiguous at small sizes.
- **No pot leaf, no cards or chips, no clock-and-news look.** Keep clear of the other readings of both words.
- **Real food over clip art:** a simple illustrated style (flat or lightly textured) with real-looking ingredients reads better than generic icons.

## Color

The app already uses five category colors: protein, veg, spice, sauce and starch (see `apps/mobile/src/theme/tokens.ts`). The five dots on the welcome screen are those colors. The logo and store art should reuse them, so the ingredients dropping into the pot are the same five colors the user sees in the app.

## Where the name and look show up

| Place | What to do |
|---|---|
| Home screen label | "Tonight's Pot" (already set in `app.json`). 14 characters; check it is not cut off under the icon on a small phone. |
| App icon | Needs a 1024 by 1024 PNG with no transparency (iPhone), plus an adaptive icon with foreground and background layers (Android). Keep the pot in the middle 66 percent for Android's circular crop. |
| Splash screen | The pot and steam on a plain color. |
| Store title | "Tonight's Pot" plus a short food phrase, for example "Tonight's Pot: Dinner Ideas". |
| Store keywords | dinner, recipe, what's for dinner, pantry, fridge, cook, meal ideas. (Keyword rules differ by store, so check them when writing the listing.) |
| Screenshots | Show the pot and the results, with a one-line caption on each. |

## Things not to claim

Per PRD HLT-3, no medical, weight-loss or nutritional claims in the app or the store listing. "Eat a little better" stays a quiet nudge in the app. It is not a headline.

## Open

- Final tagline.
- Icon and logo (owner).
- Google Play, domain and trademark checks.
- Bundle identifier. It is set to `com.landondelone.tonightspot` as a placeholder in `app.json`. It becomes permanent at the first store upload, so confirm it matches the developer account names first.
