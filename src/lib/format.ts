/**
 * Event dates are calendar dates with no meaningful time-of-day — they're
 * stored as UTC midnight (`new Date("2026-11-15")` parses as
 * 2026-11-15T00:00:00.000Z). Formatting with the server/browser's local
 * timezone can shift that back a day (e.g. US timezones show 11/14).
 * Always format these in UTC so the displayed date matches what was
 * actually entered, regardless of where the code runs.
 */
export function formatEventDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, { timeZone: "UTC" });
}
