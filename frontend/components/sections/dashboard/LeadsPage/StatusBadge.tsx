import type { LeadPipelineStatus } from "@/data/inbox-mock-data";

type StatusBadgeProps = {
  status: LeadPipelineStatus;
};

const styles: Record<LeadPipelineStatus, string> = {
  New:
    "bg-amber-100 text-amber-950 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/25",
  Replied:
    "bg-sky-100 text-sky-950 ring-sky-200/80 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/25",
  Interested:
    "bg-emerald-100 text-emerald-950 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/25",
  Converted:
    "bg-violet-100 text-violet-950 ring-violet-200/80 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/25",
  Lost:
    "bg-zinc-200 text-zinc-800 ring-zinc-300/80 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-white/10",
};

export const StatusBadge = ({
  status,
}: StatusBadgeProps): React.JSX.Element => {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
};
