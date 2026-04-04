import Link from "next/link";
import { LeadAssignSelect } from "@/components/sections/dashboard/LeadsPage/LeadAssignSelect";
import { StatusBadge } from "@/components/sections/dashboard/LeadsPage/StatusBadge";
import type { LeadsPageCopy } from "@/data/dictionaries/leads-page";
import type { CrmLeadListRow } from "@/data/leads-page-mock-data";

type AgentOption = {
  id: string;
  name: string;
  email: string;
};

type LeadRowProps = {
  lead: CrmLeadListRow;
  openInboxAriaLabel: string;
  unreadAriaLabel: string;
  copy: LeadsPageCopy;
  showAssign: boolean;
  agents: AgentOption[];
  assigningLeadId: string | null;
  onAssign: (leadId: string, agentId: string | null) => void;
};

const displayName = (lead: CrmLeadListRow): string =>
  lead.name?.trim() || lead.phone;

export const LeadRow = ({
  lead,
  openInboxAriaLabel,
  unreadAriaLabel,
  copy,
  showAssign,
  agents,
  assigningLeadId,
  onAssign,
}: LeadRowProps): React.JSX.Element => {
  const title = displayName(lead);
  const href = `/dashboard/inbox?lead=${encodeURIComponent(lead.id)}`;
  const fullDate = new Date(lead.lastActivityAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const ownerName =
    lead.assignedTo?.name?.trim() ||
    lead.assignedTo?.email?.trim() ||
    null;

  const assignSaving = assigningLeadId === lead.id;

  const assigneeCell = showAssign ? (
    <LeadAssignSelect
      leadId={lead.id}
      agents={agents}
      valueId={lead.assignedTo?.id ?? null}
      disabled={false}
      saving={assignSaving}
      labels={{
        unassigned: copy.unassigned,
        assignLabel: copy.assignLeadLabel,
        saving: copy.assignSaving,
      }}
      onAssign={onAssign}
    />
  ) : (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-sky-200/90 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-900 dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-100"
      title={ownerName ?? copy.unassigned}
    >
      {ownerName ?? copy.unassigned}
    </span>
  );

  return (
    <li className="m-0 list-none p-0">
      <div
        className={[
          "group grid grid-cols-1 gap-3 rounded-xl border border-zinc-200/60 bg-white/90 px-4 py-3.5 shadow-sm outline-none transition sm:grid-cols-5 sm:items-center sm:gap-4",
          "hover:border-zinc-300/80 hover:bg-zinc-50/95 hover:shadow-md",
          "dark:border-white/10 dark:bg-zinc-950/50 dark:hover:border-white/15 dark:hover:bg-zinc-900/55",
        ].join(" ")}
      >
        <div className="min-w-0">
          <Link
            href={href}
            className="block outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/15"
            aria-label={openInboxAriaLabel}
          >
            <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {title}
            </p>
            {lead.name ? (
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {lead.phone}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="min-w-0">
          <StatusBadge status={lead.status} />
        </div>

        <div className="min-w-0 sm:flex sm:items-center">{assigneeCell}</div>

        <Link
          href={href}
          className="min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/15"
          tabIndex={-1}
        >
          <p className="line-clamp-2 text-[13px] leading-snug text-zinc-600 dark:text-zinc-300">
            {lead.lastMessage}
          </p>
        </Link>

        <div className="flex items-center justify-end gap-2">
          {lead.unreadMessagesCount > 0 ? (
            <span
              className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40"
              aria-label={unreadAriaLabel}
              title={unreadAriaLabel}
            />
          ) : null}
          <Link
            href={href}
            className="flex items-center gap-2 text-right outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/15"
            tabIndex={-1}
          >
            <time
              className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400"
              dateTime={new Date(lead.lastActivityAt).toISOString()}
              title={fullDate}
            >
              {lead.lastContacted}
            </time>
            <svg
              viewBox="0 0 24 24"
              className="size-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </li>
  );
};
