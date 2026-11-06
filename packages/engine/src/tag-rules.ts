import type { Category } from './categories';

/**
 * Keyword rules: a favorite gets every tag whose pattern matches its lowercased name,
 * within its category. Ported from prototype v1. The only changes since are the `steak` and
 * `ground` tags and the cut names added to `beef` (docs/decisions/0007 and 0008), and fish sauce
 * and miso under `soy`, kimchi under `cabbage` and the `jerk` spice tag (docs/decisions/0010).
 */
export const TAG_RULES: Record<Category, readonly (readonly [tag: string, pattern: RegExp])[]> = {
  protein: [
    ['chicken', /chicken|wings?\b/],
    [
      'beef',
      /beef|steak|brisket|burger|ribeye|rib-eye|sirloin|filet mignon|flank|skirt|porterhouse|t-bone|tri-tip|ny strip|new york strip|chuck|prime rib|rib roast|short rib|carne asada|flat iron|tomahawk|oxtail/,
    ],
    // A whole-cut steak, which is cooked to a doneness. It is always `beef` too, so every dish
    // that takes beef still takes it. Ground beef, burgers and brisket are `beef` only. Fish and
    // pork steaks, cube steak and chicken-fried steak are not this.
    [
      'steak',
      /^(?!.*(salmon|tuna|swordfish|fish|pork|\bham\b|lamb|chicken|cube))(?=.*(\bsteak|ribeye|rib-eye|sirloin|filet mignon|flank|skirt|porterhouse|t-bone|tri-tip|ny strip|new york strip|flat iron|tomahawk))/,
    ],
    // Ribs are pork unless the name says beef or lamb.
    ['pork', /pork|\bham\b|bacon|pancetta|prosciutto|baby back|^(?!.*(beef|lamb)).*\bribs\b/],
    ['sausage', /sausage|chorizo|kielbasa|bratwurst|hot dog|pepperoni|salami|andouille/],
    [
      'fish',
      /salmon|tuna|\bcod\b|bacalao|tilapia|trout|halibut|fish|mahi|sardine|snapper|haddock|sea bass/,
    ],
    ['shrimp', /shrimp|prawn/],
    ['egg', /\begg/],
    ['tofu', /tofu|tempeh|seitan/],
    ['beans', /bean|lentil|chickpea|garbanzo/],
    ['turkey', /turkey/],
    ['lamb', /lamb/],
    // Ground or minced meat of any kind, which has to be cooked through (docs/decisions/0008).
    // It comes after the animal tags: "Ground turkey" is `turkey` and then `ground`.
    ['ground', /ground|mince|burger|patty|patties|meatball/],
  ],
  veg: [
    ['broccoli', /broccoli/],
    ['pepper', /pepper|capsicum|jalape/],
    ['tomato', /tomato/],
    ['onion', /onion|shallot|scallion|leek/],
    ['greens', /spinach|kale|chard|greens|arugula|lettuce|bok choy/],
    ['mushroom', /mushroom/],
    // Root vegetables that cook like carrots.
    ['carrot', /carrot|parsnip|turnip|beet|rutabaga/],
    ['zucchini', /zucchini|squash|courgette/],
    ['cabbage', /cabbage|slaw|kimchi/],
    ['corn', /\bcorn\b/],
    ['cauliflower', /cauliflower/],
    ['asparagus', /asparagus/],
    ['greenbeans', /green bean|snap pea|snow pea|\bpeas?\b|edamame/],
    ['cucumber', /cucumber/],
    ['avocado', /avocado/],
    ['okra', /okra/],
    ['eggplant', /eggplant|aubergine/],
    ['celery', /celery/],
  ],
  spice: [
    ['chili', /chili|chilli|cayenne|chipotle|jalape|red pepper|crushed pepper|flakes/],
    ['cumin', /cumin/],
    ['paprika', /paprika/],
    ['garlic', /garlic/],
    ['ginger', /ginger/],
    ['curry', /curry|garam|turmeric|masala/],
    [
      'herbs',
      /herb|oregano|basil|thyme|rosemary|parsley|dill|sage|italian|cilantro|coriander|mint|tarragon|chive|bay leaf/,
    ],
    ['pepper', /black pepper|lemon pepper|peppercorn|^pepper/],
    ['cinnamon', /cinnamon|nutmeg/],
    ['cajun', /cajun|creole|old bay|blackened/],
    ['smoky', /smok|bbq rub/],
    ['lemon', /lemon|lime|citrus|zest/],
    ['jerk', /jerk|allspice|scotch bonnet|jamaican/],
  ],
  sauce: [
    ['soy', /soy|tamari|shoyu|fish sauce|miso|oyster sauce|worcestershire/],
    ['teriyaki', /teriyaki|hoisin|glaze/],
    ['tomato', /marinara|tomato|pizza sauce|red sauce|arrabbiata|pomodoro/],
    [
      'cream',
      /alfredo|cream|cheese|queso|carbonara|bechamel|béchamel|^(?!.*(peanut|almond|apple|nut) butter).*\bbutter\b/,
    ],
    ['bbq', /bbq|barbecue/],
    ['salsa', /salsa|pico|enchilada|taco sauce|mole|verde/],
    ['pesto', /pesto|chimichurri/],
    [
      'hot',
      /\bhot\b|sriracha|gochujang|harissa|tabasco|chili sauce|chili crisp|doubanjiang|chili bean|sambal/,
    ],
    ['peanut', /peanut|satay/],
    ['buffalo', /buffalo/],
    ['gravy', /gravy|\bjus\b|stock|broth/],
    ['vinaigrette', /vinaigrette|dressing|olive oil|lemon juice|balsamic|vinegar/],
    ['coconut', /coconut|korma|tikka/],
    ['mustard', /mustard/],
    ['ranch', /ranch|mayo|aioli|caesar/],
    ['honey', /honey|maple|sweet chili/],
    ['hummus', /hummus|tahini|tzatziki|yogurt/],
  ],
  starch: [
    ['noodles', /noodle|ramen|udon|soba|vermicelli|lo mein/],
    [
      'pasta',
      /spaghetti|pasta|penne|macaroni|fettuccine|linguine|linguini|rigatoni|orzo|lasagna|gnocchi|ziti|farfalle|orecchiette/,
    ],
    ['rice', /rice/],
    ['sweetpotato', /sweet potato|yam/],
    ['potato', /potato|fries|tater|hash brown/],
    [
      'bread',
      /bread|sourdough|\bbun|toast|bagel|baguette|\broll|pita|naan|ciabatta|flatbread|brioche/,
    ],
    ['tortilla', /tortilla|\bwrap|taco shell/],
    ['quinoa', /quinoa|farro|barley|bulgur/],
    ['couscous', /couscous/],
    ['grits', /grits|polenta|cornmeal/],
    ['plantain', /plantain|mofongo|tostone/],
  ],
};
