/** Capitalize the first letter of each word, including after `-`, `/` and `&`. */
export function titleCase(text: string): string {
  return text.replace(/(^|[\s/&-])([a-z])/g, (_match, lead: string, letter: string) => {
    return lead + letter.toUpperCase();
  });
}

/** `['a', 'b', 'c']` becomes `a, b and c`. */
export function joinAnd(items: readonly string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Replace `{key}` placeholders. Unknown or empty keys become an empty string. */
export function fillTemplate(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => values[key] || '');
}
