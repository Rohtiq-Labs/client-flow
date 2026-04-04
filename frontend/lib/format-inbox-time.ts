import type { InboxLocale } from "@/data/dictionaries/inbox-page";

/**
 * Short relative labels for conversation list and message bubbles.
 */
export const formatInboxRelativeTime = (
  ms: number,
  locale: InboxLocale = "en",
): string => {
  const d = new Date(ms);
  const now = new Date();
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startMsg = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  ).getTime();
  const diffDays = Math.round((startToday - startMsg) / 86_400_000);
  const loc = locale === "ur" ? "ur-PK" : undefined;

  if (diffDays === 0) {
    return d.toLocaleTimeString(loc ?? undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) {
    return locale === "ur" ? "کل" : "Yesterday";
  }
  if (diffDays < 7) {
    return d.toLocaleDateString(loc ?? undefined, { weekday: "short" });
  }
  return d.toLocaleDateString(loc ?? undefined, {
    month: "short",
    day: "numeric",
  });
};
