/**
 * The holiday theme in effect on the given day, or null. Halloween runs through all of October,
 * so it switches itself on and off without a deploy.
 */
export function currentHolidayTheme(now = new Date()) {
  return now.getMonth() === 9 ? "halloween" : null;
}

// Decided once per page load, so App.jsx and every component agree even across midnight.
export const activeHolidayTheme = currentHolidayTheme();
