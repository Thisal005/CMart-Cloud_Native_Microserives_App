/**
 * Formats a date representation (Date object, string, or number) to "Month Day, Year".
 * @example formatFullDate("2026-07-18") => "July 18, 2026"
 */
export function formatFullDate(date: Date | string | number): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

/**
 * Formats a date representation to include hour and minutes.
 * @example formatDateTime("2026-07-18T10:44:00Z") => "July 18, 2026 at 10:44 AM"
 */
export function formatDateTime(date: Date | string | number): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

/**
 * Returns a relative humanized timestamp representation (e.g. "3h ago", "Yesterday").
 */
export function formatRelativeTime(date: Date | string | number): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Invalid Date";

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - parsed.getTime()) / 1000);

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatFullDate(parsed);
}
