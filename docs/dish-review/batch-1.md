# Dish review sheet: batch 1, Italian and Indian

Status: drafted on 2026-11-05. Not yet cooked, not yet reviewed.

This is for the content review PRD section 11 asks for: a tested recipe, 3 to 5 plain steps, a lighter tip and a food-safety check for every dish. Eleven dishes are listed. Each one shows the card the app builds from a pot of the dish's own chef's picks, so what you read is what a person would see.

## How to use it

1. Cook each dish once from the pot shown, or from a pot of your own that the dish accepts. The "Accepts" line says which kinds of item it takes.
2. Tick the checks under each dish. Note anything that read oddly, took longer than the time shown, or needed a step the card did not give.
3. Send changes back as notes on this sheet. The dish files in `packages/dishes/data` are the source of truth. This sheet was generated from them on 2026-11-05 and does not update itself.

## Food-safety numbers the drafts use

| Food | Temperature | Where |
|---|---|---|
| Chicken, turkey and other poultry | 165°F / 74°C | risotto, cacciatore, minestrone, panzanella, piccata, tikka masala, saag, pilaf |
| Sausage and ground meat | 160°F / 71°C by the chart. The drafts say 165°F / 74°C in simmered dishes, because one number is safe for every meat and simpler to read | risotto, cacciatore, minestrone |
| Pork and fish, whole cuts | 145°F / 63°C (the chart also asks for a 3-minute rest for whole pork, beef and lamb) | piccata, panzanella |
| Egg dishes | 160°F / 71°C | frittata |
| Shrimp | Pink and opaque | risotto, panzanella, piccata, tikka masala |
| Dried kidney beans | Soak, then boil hard for at least 10 minutes. Some sources advise 30 | dal |

Sources: the [USDA safe temperature chart](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart) and [foodsafety.gov](https://www.foodsafety.gov/print/pdf/node/10); for kidney beans, the FDA Bad Bug Book entry on [kidney bean lectins](https://webarchive.library.unt.edu/eot2008/20090512012540/http:/vm.cfsan.fda.gov/~mow/chap43.html) (archived copy). The live FSIS page refused my request, so I checked the numbers against foodsafety.gov and archived FSIS charts. Please read the live USDA page yourself before launch.

## Limits that apply to every dish

- Steps are fixed text, but a step that says "cooked through (…)" gets its temperatures from the proteins in the pot (decision record 0009). Simmered and baked dishes say "any meat is at least 165°F" instead.
- There are no amounts yet (REC-2 needs amounts in the dish data), so steps avoid quantities unless a dish needs one.
- The engine cannot tell some things apart: arborio from jasmine rice, naan from sourdough (both are "bread"), and ground meat from a whole cut.
- Steps mention a clean plate for cooked food where it matters, but there is no standing food-safety note. Suggestion, for you to decide: one line on the recipe screen saying to wash hands and boards after raw meat, and to refrigerate leftovers, cooked rice included, within 2 hours.

## The eleven dishes


### Chicken Breast & Mushrooms Risotto

`risotto` · Italian · 40 minutes · Creamy

**Cooked from this pot:** protein chicken breast, veg mushrooms, spice garlic, sauce parmesan cheese, starch arborio rice.

**Accepts:** protein: chicken, sausage, shrimp, turkey, pork, beans; veg: mushroom, asparagus, greens, zucchini, onion, greenbeans, tomato; spice: garlic, herbs, pepper, chili; sauce: gravy, cream, pesto; starch: rice.

**Steps as the app shows them:**

1. Soften an onion with the garlic in a wide pan, then stir in the arborio rice for a minute until the edges turn glassy.
2. Add warm stock or lightly salted water a ladle at a time, stirring often and letting each addition soak in, until creamy and just tender, about 20 minutes.
3. Cook the chicken breast in a separate pan until cooked through (chicken breast 165°F / 74°C), and sauté the mushrooms until golden.
4. Fold the chicken breast and mushrooms into the arborio rice and finish with the parmesan cheese.

**Lighter tip:** Pack in extra veg and finish with a little cheese rather than a lot of butter or cream.

**The same pot also offers:** Creamy Saag with Chicken Breast; Chicken Breast Tikka Masala.

**Please check:**

- [ ] Rice type: the app cannot tell arborio from jasmine. Does it still come out creamy enough with long-grain rice, or should the step say short-grain rice is needed?
- [ ] Is about 20 minutes of stock additions right, and is 40 minutes total fair?
- [ ] Stock is not one of the pantry staples (oil, salt, pepper, water), so the step says "stock or lightly salted water". Is water alone acceptable?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Chicken Thighs & Bell Peppers Cacciatore

`cacciatore` · Italian · 45 minutes · Hearty

**Cooked from this pot:** protein chicken thighs, veg bell peppers, spice italian herbs, sauce marinara, starch crusty bread.

**Accepts:** protein: chicken, sausage, turkey, pork, beans; veg: pepper, onion, mushroom, tomato, zucchini, greens; spice: herbs, garlic, chili, pepper; sauce: tomato, gravy; starch: pasta, potato, bread, rice.

**Steps as the app shows them:**

1. Season the chicken thighs with the italian herbs and brown in a wide, deep pan, then set aside on a clean plate.
2. Soften the bell peppers in the same pan, then pour in the marinara and a splash of water or stock.
3. Return the chicken thighs, cover and simmer 25 to 30 minutes, until the sauce thickens and any meat is at least 165°F / 74°C inside.
4. Serve over or alongside the crusty bread.

**Lighter tip:** Take the skin off the chicken, add extra peppers and mushrooms, and keep the bread to a slice.

**Please check:**

- [ ] Is 25 to 30 minutes of simmering enough for chicken thighs, and for sausage? Is 45 minutes total fair?
- [ ] The step says "any meat is at least 165°F / 74°C inside". Does it still read right when the protein is beans?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### White Beans & Carrots Soup

`minestrone` · Italian · 40 minutes · Cozy

**Cooked from this pot:** protein white beans, veg carrots, spice italian herbs, sauce vegetable broth, starch small pasta.

**Accepts:** protein: beans, sausage, chicken, turkey, beef; veg: carrot, celery, onion, tomato, greens, zucchini, cabbage, greenbeans; spice: herbs, garlic, pepper, chili; sauce: tomato, gravy, pesto; starch: pasta, potato, bread, rice, quinoa.

**Steps as the app shows them:**

1. Brown the white beans in a large pot, then set aside on a clean plate.
2. Soften the carrots with the italian herbs in the same pot, about 8 minutes.
3. Add the vegetable broth, the white beans and enough water or stock to cover, then simmer 25 minutes, until everything is cooked through and any meat is at least 165°F / 74°C inside.
4. Stir in the small pasta, simmer until just tender, and season to taste.

**Lighter tip:** Let beans and veg do the work: skip the cream and go easy on the cheese.

**The same pot also offers:** Hearty White Beans & Carrots Stew.

**Please check:**

- [ ] Beef is accepted. The step says any meat at 165°F, which is safe but above the 160°F ground-meat figure and the 145°F whole-cut figure. Is that fine for a soup?
- [ ] Is 25 minutes of simmering plus the pasta enough for raw chicken pieces?
- [ ] Pasta, rice, potato and quinoa all cook for different times. Does "simmer until just tender" cover them?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Panzanella with White Beans

`panzanella` · Italian · 20 minutes · Light

**Cooked from this pot:** protein white beans, veg tomatoes, spice italian herbs, sauce balsamic vinaigrette, starch ciabatta.

**Accepts:** protein: chicken, beans, fish, shrimp; veg: tomato, cucumber, pepper, onion, greens, celery; spice: herbs, garlic, pepper, chili; sauce: vinaigrette, pesto, mustard; starch: bread.

**Steps as the app shows them:**

1. Cube the ciabatta, toss with a little oil and toast in a hot oven or pan until crisp at the edges.
2. Chop the tomatoes and toss with the balsamic vinaigrette and the italian herbs. Leave to sit 10 minutes so the juices soak in.
3. Cook the white beans until heated through. Canned beans or fish just need draining.
4. Toss in the toasted ciabatta just before serving to keep some crunch, and top with the white beans.

**Lighter tip:** Go heavy on tomato and cucumber, light on the oil, and use beans for protein and fiber.

**Please check:**

- [ ] Is it right to cook the protein first and top the salad with it? Do canned beans and canned fish work as written?
- [ ] Egg is not accepted on purpose (see "Tuning the new dishes" in decision record 0004).
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Spinach Frittata

`frittata` · Italian · 25 minutes · Easy

**Cooked from this pot:** protein eggs, veg spinach, spice italian herbs, sauce parmesan cheese, starch crusty bread.

**Accepts:** protein: egg; veg: onion, pepper, tomato, mushroom, greens, broccoli, zucchini, asparagus; spice: herbs, garlic, pepper; sauce: cream, pesto, tomato; starch: potato, bread, pasta.

**Steps as the app shows them:**

1. Heat the oven to 375°F (190°C). Sauté the spinach with the italian herbs in an oven-safe pan until soft.
2. Whisk the eggs (about 2 to 3 per person) with salt and pepper and pour them over the veg. Dot with the parmesan cheese.
3. Cook on the stove for 2 minutes until the edges set, then bake 12 to 15 minutes, until the center is set and the eggs reach 160°F / 71°C.
4. Rest 5 minutes, slice, and serve with the crusty bread.

**Lighter tip:** More veg and fewer eggs per slice keeps it light, and herbs plus a little sharp cheese carry the flavor.

**Please check:**

- [ ] Eggs are the only protein it accepts, like the scramble, so a sausage frittata is not offered. Is that too limiting?
- [ ] Is "about 2 to 3 eggs per person" right, since the app has no amounts yet? Is an oven-safe pan a fair thing to ask for?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Chicken Breast Piccata with Asparagus

`piccata` · Italian · 25 minutes · Light

**Cooked from this pot:** protein chicken breast, veg asparagus, spice lemon pepper, sauce chicken stock, starch linguine.

**Accepts:** protein: chicken, fish, turkey, pork, shrimp; veg: asparagus, greens, mushroom, greenbeans, zucchini, broccoli; spice: lemon, garlic, herbs, pepper; sauce: gravy, vinaigrette, cream; starch: pasta, potato, rice, couscous, quinoa.

**Steps as the app shows them:**

1. Pat the chicken breast dry and season with the lemon pepper. Sear in a hot pan until golden and cooked through (chicken breast 165°F / 74°C), then set aside on a clean plate.
2. Cook the asparagus in the same pan until tender-crisp, then set aside with the chicken breast.
3. Pour the chicken stock and a squeeze of lemon into the pan, scrape up the browned bits and simmer until slightly thick.
4. Return the chicken breast and asparagus to the pan to coat, and serve over the linguine.

**Lighter tip:** Lemon and stock make the pan sauce, so you need very little butter or cream.

**Please check:**

- [ ] Classic piccata has capers. There is no caper tag in the engine, so they are not mentioned. Does it still read as piccata?
- [ ] Does a pan sear then a short simmer in the sauce get chicken to 165°F without drying it out?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Chicken Breast Tikka Masala

`tikkamasala` · Indian · 35 minutes · Rich

**Cooked from this pot:** protein chicken breast, veg onions, spice garam masala, sauce tomato cream sauce, starch basmati rice.

**Accepts:** protein: chicken, shrimp, tofu, fish, lamb, beans; veg: onion, pepper, tomato, greens, cauliflower, mushroom; spice: curry, cumin, paprika, ginger, garlic, chili; sauce: tomato, cream, coconut; starch: rice, bread.

**Steps as the app shows them:**

1. Season the chicken breast with the garam masala and sear in a hot pan with a little oil until browned on the outside, then set aside on a clean plate.
2. Soften a little garlic in the same pan, add the onions, then pour in the tomato cream sauce and simmer 10 minutes.
3. Return the chicken breast and simmer until cooked through (chicken breast 165°F / 74°C).
4. Serve over the basmati rice with a squeeze of lemon.

**Lighter tip:** Use tomato with a little cream or yogurt instead of all cream, and add extra veg to stretch it.

**The same pot also offers:** Spiced Chicken Breast & Onions Pilaf; Creamy Saag with Chicken Breast.

**Please check:**

- [ ] The traditional yogurt marinade is left out, because yogurt is not something the engine can use here. Is the simplified version fair to call tikka masala?
- [ ] The protein is only browned first. Check that it reaches 165°F during the simmer.
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Spiced Red Lentils & Spinach Dal

`dal` · Indian · 30 minutes · Hearty

**Cooked from this pot:** protein red lentils, veg spinach, spice cumin, sauce coconut milk, starch basmati rice.

**Accepts:** protein: beans; veg: tomato, onion, greens, carrot, cauliflower, zucchini; spice: cumin, curry, ginger, garlic, chili; sauce: coconut, tomato, hot; starch: rice, bread, potato, sweetpotato.

**Steps as the app shows them:**

1. Rinse the red lentils. Simmer dried lentils or chickpeas in water until soft; canned beans only need draining. Dried kidney beans need soaking, then a hard boil of at least 10 minutes.
2. Bloom the cumin in oil with a little garlic for 30 seconds, then add the spinach and cook until soft.
3. Add the red lentils, the coconut milk and a cup of water. Simmer 15 minutes, mashing some of the red lentils to thicken.
4. Serve over the basmati rice with lemon or fresh herbs.

**Lighter tip:** Lentils and beans give protein and fiber for very little cost, and a teaspoon of oil is enough to bloom the spices.

**The same pot also offers:** Spiced Red Lentils & Spinach Pilaf; Creamy Saag with Red Lentils.

**Please check:**

- [ ] Only beans, lentils and chickpeas are accepted as the protein. Is the first step clear about dried versus canned?
- [ ] The kidney bean warning (soak, then boil hard for at least 10 minutes): is it clear without being alarming?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Creamy Saag with Tofu

`saag` · Indian · 35 minutes · Rich

**Cooked from this pot:** protein tofu, veg spinach, spice cumin, sauce cream, starch naan.

**Accepts:** protein: tofu, beans, chicken, lamb; veg: greens, onion, tomato, cauliflower, mushroom; spice: cumin, ginger, garlic, curry, chili; sauce: cream, coconut, tomato; starch: rice, bread, potato, sweetpotato.

**Steps as the app shows them:**

1. Soften a little garlic with the cumin in oil for a minute, until fragrant.
2. Add the spinach and cook until tender and wilted, then blend or chop to a rough purée.
3. Stir in the cream and the tofu and simmer gently until heated through.
4. Serve hot with the naan.

**Lighter tip:** Coconut milk or a spoonful of yogurt stands in for cream, and the greens do most of the filling.

**The same pot also offers:** Tofu Tikka Masala.

**Please check:**

- [ ] The step blends or chops the greens. Is that clear for someone with no blender?
- [ ] Raw chicken or lamb simmers in the sauce to 165°F: check the timing, since the step gives none.
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Spiced Chicken Thighs & Carrots Pilaf

`pilaf` · Indian · 40 minutes · Hearty

**Cooked from this pot:** protein chicken thighs, veg carrots, spice garam masala, sauce crushed tomatoes, starch basmati rice.

**Accepts:** protein: chicken, beans, tofu, lamb; veg: onion, carrot, greenbeans, cauliflower, tomato, pepper, greens; spice: curry, cumin, cinnamon, ginger, garlic, chili; sauce: tomato, hot, coconut; starch: rice.

**Steps as the app shows them:**

1. Warm a little oil, add the garam masala and stir for 30 seconds until fragrant.
2. Add the chicken thighs and carrots and cook a few minutes, stirring, until lightly browned.
3. Stir in the basmati rice to coat, add the crushed tomatoes and enough water to cover the rice by a knuckle, then cover and simmer on low until the rice is tender (about 15 minutes for white rice, 40 for brown).
4. Check that any chicken or lamb is at least 165°F / 74°C inside, then fluff with a fork, rest 5 minutes covered, and finish with lemon or fresh herbs.

**Lighter tip:** Brown rice and extra veg add fiber, and a tablespoon of oil is plenty.

**The same pot also offers:** Chicken Thighs & Carrots Curry.

**Please check:**

- [ ] The water amount is "cover the rice by a knuckle", because the app has no amounts yet. Does that work for basmati, jasmine and brown rice?
- [ ] Raw chicken goes in with the rice and cooks while it steams. Does it reach 165°F by the time the rice is done?
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:

### Egg Curry with Tomatoes

`eggcurry` · Indian · 25 minutes · Quick

**Cooked from this pot:** protein eggs, veg tomatoes, spice curry powder, sauce crushed tomatoes, starch basmati rice.

**Accepts:** protein: egg; veg: tomato, onion, greens, pepper, cauliflower, greenbeans; spice: curry, cumin, ginger, garlic, chili, paprika; sauce: tomato, coconut, cream, hot; starch: rice, potato.

**Steps as the app shows them:**

1. Boil the eggs hard: lower them into boiling water for 10 minutes, then cool in cold water and peel.
2. Soften a little garlic in oil, then bloom the curry powder for 30 seconds.
3. Add the tomatoes and the crushed tomatoes and simmer 10 minutes, until the sauce thickens.
4. Halve the eggs, slip them into the sauce to warm through, and serve over the basmati rice.

**Lighter tip:** Eggs are a cheap, filling protein: load the sauce with veg and go easy on the oil.

**The same pot also offers:** Eggs & Tomatoes Curry.

**Please check:**

- [ ] Boiling the eggs for 10 minutes gives fully set yolks. Is that what you want in a curry?
- [ ] Bread is not accepted as the starch, so a naan pot does not favor this dish (see decision record 0004).
- [ ] Cooked it once. Result: works, or needs a change.
- [ ] Notes:
