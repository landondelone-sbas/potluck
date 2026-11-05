import type { Cuisine } from './cuisines';

/**
 * Which cuisines a spice or sauce tag suits. '*' means it suits every cuisine. A tag that does not
 * list a dish's cuisine is a clash and is left out of that dish, so every new cuisine needs a pass
 * over this whole table.
 *
 * Ported from prototype v1 for the first seven cuisines. Thai, Korean, Caribbean and the `jerk`
 * tag were added later (docs/decisions/0010) and change nothing for the older cuisines.
 */
export const VIBE: Readonly<Record<string, readonly (Cuisine | '*')[]>> = {
  chili: ['mexican', 'indian', 'asian', 'cajun', 'comfort', 'thai', 'korean', 'caribbean'],
  cumin: ['mexican', 'indian', 'med', 'caribbean'],
  paprika: ['mexican', 'med', 'comfort', 'cajun', 'caribbean'],
  garlic: ['*'],
  ginger: ['asian', 'indian', 'thai', 'korean', 'caribbean'],
  curry: ['indian', 'asian', 'thai', 'caribbean'],
  herbs: ['italian', 'med', 'comfort', 'caribbean'],
  pepper: ['comfort', 'italian', 'med', 'cajun', 'caribbean'],
  cinnamon: ['indian', 'med', 'caribbean'],
  cajun: ['cajun', 'comfort'],
  jerk: ['caribbean', 'cajun'],
  smoky: ['comfort', 'mexican', 'cajun', 'caribbean'],
  lemon: ['med', 'comfort', 'asian', 'thai', 'caribbean'],
  soy: ['asian', 'thai', 'korean'],
  teriyaki: ['asian', 'korean'],
  tomato: ['italian', 'mexican', 'med', 'indian', 'comfort', 'cajun', 'caribbean'],
  cream: ['italian', 'comfort', 'indian'],
  bbq: ['comfort', 'cajun', 'korean', 'caribbean'],
  salsa: ['mexican'],
  pesto: ['italian', 'med'],
  hot: ['mexican', 'asian', 'cajun', 'comfort', 'indian', 'thai', 'korean', 'caribbean'],
  peanut: ['asian', 'thai'],
  buffalo: ['comfort'],
  gravy: ['comfort'],
  vinaigrette: ['med', 'comfort'],
  coconut: ['asian', 'indian', 'thai', 'caribbean'],
  mustard: ['comfort', 'med'],
  ranch: ['comfort', 'mexican'],
  honey: ['asian', 'comfort', 'med', 'korean', 'caribbean'],
  hummus: ['med'],
};
