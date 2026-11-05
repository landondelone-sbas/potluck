import { joinAnd } from './text';

/** What the doneness phrase needs to know about a protein. */
export interface DonenessItem {
  name: string;
  tags: readonly string[];
}

const POULTRY_AND_SAUSAGE = ['chicken', 'turkey', 'sausage'];
const WHOLE_CUTS = ['beef', 'pork', 'lamb', 'fish'];

/**
 * The text for a step's `{doneness}` placeholder, built from the proteins the dish uses
 * (docs/decisions/0009). It names a safe temperature only for what is in the pot:
 *
 * - chicken, turkey and sausage: 165°F / 74°C
 * - ground beef, pork, lamb and any other ground meat: 160°F / 71°C
 * - whole cuts of beef, pork and lamb, and fish: 145°F / 63°C
 * - shrimp: pink and opaque
 * - a steak on its own: "cooked through", with no temperature. Dishes that cook a steak to a
 *   doneness write their own steps (docs/decisions/0007).
 * - tofu, beans or nothing: "heated through"
 */
export function donenessFor(proteins: readonly DonenessItem[]): string {
  const at165: string[] = [];
  const at160: string[] = [];
  const at145: string[] = [];
  const shrimp: string[] = [];
  let steak = false;

  for (const { name, tags } of proteins) {
    const label = name.toLowerCase();
    if (tags.includes('shrimp')) shrimp.push(label);
    else if (POULTRY_AND_SAUSAGE.some((tag) => tags.includes(tag))) at165.push(label);
    else if (tags.includes('ground')) at160.push(label);
    else if (tags.includes('steak')) steak = true;
    else if (WHOLE_CUTS.some((tag) => tags.includes(tag))) at145.push(label);
  }

  const parts = [
    at165.length > 0 ? `${joinAnd(at165)} 165°F / 74°C` : '',
    at160.length > 0 ? `${joinAnd(at160)} 160°F / 71°C` : '',
    at145.length > 0 ? `${joinAnd(at145)} 145°F / 63°C` : '',
    shrimp.length > 0 ? `${joinAnd(shrimp)} pink and opaque` : '',
  ].filter((part) => part !== '');

  if (parts.length > 0) return `cooked through (${parts.join('; ')})`;
  return steak ? 'cooked through' : 'heated through';
}
