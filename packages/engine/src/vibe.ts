import type { Cuisine } from './cuisines';

/**
 * Which cuisines a spice or sauce tag suits. '*' means it suits every cuisine.
 * Ported unchanged from prototype v1.
 */
export const VIBE: Readonly<Record<string, readonly (Cuisine | '*')[]>> = {
  chili: ['mexican', 'indian', 'asian', 'cajun', 'comfort'],
  cumin: ['mexican', 'indian', 'med'],
  paprika: ['mexican', 'med', 'comfort', 'cajun'],
  garlic: ['*'],
  ginger: ['asian', 'indian'],
  curry: ['indian', 'asian'],
  herbs: ['italian', 'med', 'comfort'],
  pepper: ['comfort', 'italian', 'med', 'cajun'],
  cinnamon: ['indian', 'med'],
  cajun: ['cajun', 'comfort'],
  smoky: ['comfort', 'mexican', 'cajun'],
  lemon: ['med', 'comfort', 'asian'],
  soy: ['asian'],
  teriyaki: ['asian'],
  tomato: ['italian', 'mexican', 'med', 'indian', 'comfort', 'cajun'],
  cream: ['italian', 'comfort', 'indian'],
  bbq: ['comfort', 'cajun'],
  salsa: ['mexican'],
  pesto: ['italian', 'med'],
  hot: ['mexican', 'asian', 'cajun', 'comfort', 'indian'],
  peanut: ['asian'],
  buffalo: ['comfort'],
  gravy: ['comfort'],
  vinaigrette: ['med', 'comfort'],
  coconut: ['asian', 'indian'],
  mustard: ['comfort', 'med'],
  ranch: ['comfort', 'mexican'],
  honey: ['asian', 'comfort', 'med'],
  hummus: ['med'],
};
