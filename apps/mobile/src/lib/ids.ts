/** A short random id. Unique enough for on-device records. No crypto needed. */
export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
