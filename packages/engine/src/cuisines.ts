export const CUISINES = [
  'asian',
  'mexican',
  'italian',
  'indian',
  'med',
  'comfort',
  'cajun',
  'thai',
  'korean',
  'caribbean',
] as const;

export type Cuisine = (typeof CUISINES)[number];

export const CUISINE_LABELS: Readonly<Record<Cuisine, string>> = {
  asian: 'Asian',
  mexican: 'Mexican',
  italian: 'Italian',
  indian: 'Indian',
  med: 'Mediterranean',
  comfort: 'Comfort',
  cajun: 'Cajun',
  thai: 'Thai',
  korean: 'Korean',
  caribbean: 'Caribbean',
};
