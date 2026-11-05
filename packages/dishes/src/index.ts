import type { Dish } from '@potluck/engine';

import blackened from '../data/blackened.json';
import brothnoodles from '../data/brothnoodles.json';
import burritobowl from '../data/burritobowl.json';
import cacciatore from '../data/cacciatore.json';
import cajun from '../data/cajun.json';
import chickensoup from '../data/chickensoup.json';
import chilaquiles from '../data/chilaquiles.json';
import chili from '../data/chili.json';
import cottagepie from '../data/cottagepie.json';
import curry from '../data/curry.json';
import dal from '../data/dal.json';
import eggcurry from '../data/eggcurry.json';
import eggfooyoung from '../data/eggfooyoung.json';
import enchilada from '../data/enchilada.json';
import fajita from '../data/fajita.json';
import friedrice from '../data/friedrice.json';
import frittata from '../data/frittata.json';
import glazebowl from '../data/glazebowl.json';
import greeksalad from '../data/greeksalad.json';
import gyro from '../data/gyro.json';
import hash from '../data/hash.json';
import jambalaya from '../data/jambalaya.json';
import kungpao from '../data/kungpao.json';
import lemonherb from '../data/lemonherb.json';
import lettucewraps from '../data/lettucewraps.json';
import loadedpotato from '../data/loadedpotato.json';
import medbowl from '../data/medbowl.json';
import minestrone from '../data/minestrone.json';
import noodles from '../data/noodles.json';
import panzanella from '../data/panzanella.json';
import pasta from '../data/pasta.json';
import piccata from '../data/piccata.json';
import pilaf from '../data/pilaf.json';
import quesadilla from '../data/quesadilla.json';
import redbeans from '../data/redbeans.json';
import risotto from '../data/risotto.json';
import saag from '../data/saag.json';
import sandwich from '../data/sandwich.json';
import scramble from '../data/scramble.json';
import shakshuka from '../data/shakshuka.json';
import sheetpan from '../data/sheetpan.json';
import steakdinner from '../data/steakdinner.json';
import steakpotato from '../data/steakpotato.json';
import steaksalad from '../data/steaksalad.json';
import stew from '../data/stew.json';
import stirfry from '../data/stirfry.json';
import stuffedpeppers from '../data/stuffedpeppers.json';
import tacos from '../data/tacos.json';
import tagine from '../data/tagine.json';
import tikkamasala from '../data/tikkamasala.json';
import tortillasoup from '../data/tortillasoup.json';
import { parseDishes } from './schema';

/**
 * Every dish file, in library order. Order matters: it breaks ties between equal scores, so new
 * dishes go at the end and the first 16 stay the prototype's, in the prototype's order (the parity
 * test depends on that). A new file in `data/` must be added here; a test fails if one is missed.
 */
export const DISH_FILES: readonly unknown[] = [
  stirfry,
  friedrice,
  glazebowl,
  noodles,
  burritobowl,
  tacos,
  pasta,
  sheetpan,
  curry,
  medbowl,
  lemonherb,
  stew,
  sandwich,
  cajun,
  hash,
  scramble,
  // Batch 1 (M3): Italian and Indian.
  risotto,
  cacciatore,
  minestrone,
  panzanella,
  frittata,
  piccata,
  tikkamasala,
  dal,
  saag,
  pilaf,
  eggcurry,
  // Batch 2 (M3): Mexican, Mediterranean and Cajun.
  quesadilla,
  chilaquiles,
  fajita,
  enchilada,
  tortillasoup,
  shakshuka,
  gyro,
  stuffedpeppers,
  tagine,
  greeksalad,
  jambalaya,
  redbeans,
  blackened,
  // Batch 3 (M3): Comfort and Asian.
  chili,
  chickensoup,
  cottagepie,
  loadedpotato,
  kungpao,
  brothnoodles,
  eggfooyoung,
  lettucewraps,
  // Whole-cut steak dishes (M3), which need the `steak` tag.
  steakdinner,
  steakpotato,
  steaksalad,
];

/** The bundled dish library, validated at load. */
export const dishes: readonly Dish[] = parseDishes(DISH_FILES);

export { DishSchema, parseDishes } from './schema';
