import type { Dish } from '@potluck/engine';

import chickpeasoup from '../data/chickpeasoup.json';
import lambsteaks from '../data/lambsteaks.json';
import lambroast from '../data/lambroast.json';
import tuscansausage from '../data/tuscansausage.json';
import friedeggs from '../data/friedeggs.json';
import chickpeaspinach from '../data/chickpeaspinach.json';
import greenbeantofu from '../data/greenbeantofu.json';
import eggcasserole from '../data/eggcasserole.json';
import beanlentilchili from '../data/beanlentilchili.json';
import tofuburger from '../data/tofuburger.json';
import lemongrasstofu from '../data/lemongrasstofu.json';
import eggplanttofu from '../data/eggplanttofu.json';
import tofuscramble from '../data/tofuscramble.json';
import tofularb from '../data/tofularb.json';
import airfriedchicken from '../data/airfriedchicken.json';
import bakedsalmon from '../data/bakedsalmon.json';
import basilstirfry from '../data/basilstirfry.json';
import bibimbap from '../data/bibimbap.json';
import blackened from '../data/blackened.json';
import breakfastquesadilla from '../data/breakfastquesadilla.json';
import brothnoodles from '../data/brothnoodles.json';
import bulgogi from '../data/bulgogi.json';
import burgers from '../data/burgers.json';
import burritobowl from '../data/burritobowl.json';
import butterchicken from '../data/butterchicken.json';
import cacciatore from '../data/cacciatore.json';
import cajun from '../data/cajun.json';
import caribbeancurry from '../data/caribbeancurry.json';
import carneasada from '../data/carneasada.json';
import cheesybeefpotatoes from '../data/cheesybeefpotatoes.json';
import chickenquinoa from '../data/chickenquinoa.json';
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
import flatiron from '../data/flatiron.json';
import friedrice from '../data/friedrice.json';
import frittata from '../data/frittata.json';
import garlicshrimp from '../data/garlicshrimp.json';
import glazebowl from '../data/glazebowl.json';
import glazedbreast from '../data/glazedbreast.json';
import greeksalad from '../data/greeksalad.json';
import gyro from '../data/gyro.json';
import hash from '../data/hash.json';
import jambalaya from '../data/jambalaya.json';
import jerk from '../data/jerk.json';
import kungpao from '../data/kungpao.json';
import lemonherb from '../data/lemonherb.json';
import lemonrosemary from '../data/lemonrosemary.json';
import lettucewraps from '../data/lettucewraps.json';
import loadedpotato from '../data/loadedpotato.json';
import mapotofu from '../data/mapotofu.json';
import medbowl from '../data/medbowl.json';
import minestrone from '../data/minestrone.json';
import noodles from '../data/noodles.json';
import ovenribs from '../data/ovenribs.json';
import padthai from '../data/padthai.json';
import panzanella from '../data/panzanella.json';
import paprikash from '../data/paprikash.json';
import pasta from '../data/pasta.json';
import piccata from '../data/piccata.json';
import pilaf from '../data/pilaf.json';
import porkchops from '../data/porkchops.json';
import porktenderloin from '../data/porktenderloin.json';
import potatosalad from '../data/potatosalad.json';
import potatosoup from '../data/potatosoup.json';
import potroast from '../data/potroast.json';
import quesadilla from '../data/quesadilla.json';
import redbeans from '../data/redbeans.json';
import redcurryshrimp from '../data/redcurryshrimp.json';
import reversesear from '../data/reversesear.json';
import riceandbeans from '../data/riceandbeans.json';
import risotto from '../data/risotto.json';
import roastchicken from '../data/roastchicken.json';
import saag from '../data/saag.json';
import sandwich from '../data/sandwich.json';
import sausageflatbread from '../data/sausageflatbread.json';
import scramble from '../data/scramble.json';
import sesametofu from '../data/sesametofu.json';
import shakshuka from '../data/shakshuka.json';
import sheetpan from '../data/sheetpan.json';
import shrimpgumbo from '../data/shrimpgumbo.json';
import shrimplinguini from '../data/shrimplinguini.json';
import shrimptacos from '../data/shrimptacos.json';
import spanishtortilla from '../data/spanishtortilla.json';
import spicynoodles from '../data/spicynoodles.json';
import steakdinner from '../data/steakdinner.json';
import steakpotato from '../data/steakpotato.json';
import steaksalad from '../data/steaksalad.json';
import stew from '../data/stew.json';
import stirfry from '../data/stirfry.json';
import stuffedpeppers from '../data/stuffedpeppers.json';
import tacos from '../data/tacos.json';
import tagine from '../data/tagine.json';
import thaicurry from '../data/thaicurry.json';
import tikkamasala from '../data/tikkamasala.json';
import tortillasoup from '../data/tortillasoup.json';
import turkeychili from '../data/turkeychili.json';
import turkeytostadas from '../data/turkeytostadas.json';
import tuscanchicken from '../data/tuscanchicken.json';
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
  // Thai, Korean and Caribbean (M3), which needed new cuisines in the engine.
  thaicurry,
  padthai,
  basilstirfry,
  bibimbap,
  bulgogi,
  spicynoodles,
  jerk,
  riceandbeans,
  caribbeancurry,
  // Recipe pilot (M4): the first dishes from the recipe sheets, including the first plated ones.
  roastchicken,
  tuscanchicken,
  porkchops,
  porktenderloin,
  bakedsalmon,
  shrimplinguini,
  shrimptacos,
  shrimpgumbo,
  turkeytostadas,
  mapotofu,
  cheesybeefpotatoes,
  // Recipe pilot, second batch (M4).
  lemonrosemary,
  butterchicken,
  airfriedchicken,
  burgers,
  flatiron,
  carneasada,
  ovenribs,
  garlicshrimp,
  sesametofu,
  turkeychili,
  sausageflatbread,
  breakfastquesadilla,
  redcurryshrimp,
  // Potato dishes, so every kind of potato has somewhere to go (M4).
  potatosoup,
  spanishtortilla,
  potatosalad,
  // Recipes the notebook could verify against its sources (M4).
  paprikash,
  chickenquinoa,
  potroast,
  reversesear,
  glazedbreast,
  // Gemini batch 3 (M4): lamb, tofu, beans and eggs, from the 13-protein notebook run.
  chickpeasoup,
  lambsteaks,
  lambroast,
  tuscansausage,
  friedeggs,
  chickpeaspinach,
  greenbeantofu,
  eggcasserole,
  beanlentilchili,
  tofuburger,
  lemongrasstofu,
  eggplanttofu,
  tofuscramble,
  tofularb,
];

/** The bundled dish library, validated at load. */
export const dishes: readonly Dish[] = parseDishes(DISH_FILES);

export { DishSchema, parseDishes } from './schema';
