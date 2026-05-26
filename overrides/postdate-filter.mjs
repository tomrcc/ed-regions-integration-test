// Browser-compatible replacement for the Luxon-based postDate filter.
// Matches the DATE_MED output format ("Apr 21, 2026") using Intl.
export default function postDate(dateObj) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
