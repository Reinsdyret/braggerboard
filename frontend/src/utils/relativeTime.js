const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (diffMs < MINUTE) return "just now";
  if (diffMs < HOUR) return `${Math.floor(diffMs / MINUTE)}m ago`;
  if (diffMs < DAY) return `${Math.floor(diffMs / HOUR)}h ago`;
  if (diffMs < WEEK) return `${Math.floor(diffMs / DAY)}d ago`;
  if (diffMs < MONTH) return `${Math.floor(diffMs / WEEK)}w ago`;
  if (diffMs < YEAR) return `${Math.floor(diffMs / MONTH)}mo ago`;
  return `${Math.floor(diffMs / YEAR)}y ago`;
}
