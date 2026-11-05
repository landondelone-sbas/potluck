/**
 * A short day for the cook log, such as "Mon, Nov 3". Uses the phone's own language and order.
 * Pass a locale to fix the output, for example in tests.
 */
export function formatDay(milliseconds: number, locale?: string): string {
  return new Date(milliseconds).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
