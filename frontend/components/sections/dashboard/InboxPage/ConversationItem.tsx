import type { InboxLead, LeadListBadge } from "@/data/inbox-mock-data";

const badgeStyles: Record<
  LeadListBadge,
  string
> = {
  New:
    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
  Replied:
    "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100",
  Interested:
    "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-100",
  Converted:
    "bg-emerald-100 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-100",
  Lost:
    "bg-zinc-200/90 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

type ConversationItemProps = {
  lead: InboxLead;
  isActive: boolean;
  onSelect: () => void;
  /** Localized badge text (defaults to raw listBadge) */
  badgeLabel?: string;
};

const displayTitle = (lead: InboxLead): string =>
  lead.name?.trim() || lead.phone;

export const ConversationItem = ({
  lead,
  isActive,
  onSelect,
  badgeLabel,
}: ConversationItemProps): React.JSX.Element => {
  const title = displayTitle(lead);
  const badgeText = badgeLabel ?? lead.listBadge;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={[
        "group flex w-full gap-3 border-b border-zinc-100 px-4 py-3.5 text-left outline-none transition",
        "hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900/10",
        "dark:border-white/5 dark:hover:bg-white/[0.04] dark:focus-visible:bg-white/[0.04] dark:focus-visible:ring-white/10",
        isActive
          ? "bg-zinc-100/90 dark:bg-white/[0.07]"
          : "bg-transparent",
      ].join(" ")}
      aria-label={`Open conversation with ${title}`}
    >
      <div className="relative shrink-0 pt-0.5">
        <span
          className="grid size-10 place-items-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          aria-hidden="true"
        >
          {title.slice(0, 2).toUpperCase()}
        </span>
        {lead.unread ? (
          <span
            className="absolute right-0 top-1 size-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950"
            aria-label="Unread"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {title}
          </p>
          <time
            className="shrink-0 text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400"
            dateTime={String(lead.lastActivityAt)}
          >
            {lead.timestampLabel}
          </time>
        </div>
        {lead.name ? (
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {lead.phone}
          </p>
        ) : null}
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
          {lead.lastMessage}
        </p>
        <div className="mt-2">
          <span
            className={[
              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
              badgeStyles[lead.listBadge],
            ].join(" ")}
          >
            {badgeText}
          </span>
        </div>
      </div>
    </button>
  );
};
