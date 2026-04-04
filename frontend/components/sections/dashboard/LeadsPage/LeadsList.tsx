"use client";

import { LeadRow } from "@/components/sections/dashboard/LeadsPage/LeadRow";
import { EmptyState } from "@/components/sections/dashboard/LeadsPage/EmptyState";
import type { LeadsPageCopy } from "@/data/dictionaries/leads-page";
import { openInboxAria } from "@/data/dictionaries/leads-page";
import type { CrmLeadListRow } from "@/data/leads-page-mock-data";

type LeadsListProps = {
  leads: CrmLeadListRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  emptyDescription?: string;
  copy: LeadsPageCopy;
  showAssign: boolean;
  agents: { id: string; name: string; email: string }[];
  assigningLeadId: string | null;
  onAssign: (leadId: string, agentId: string | null) => void;
};

const displayName = (lead: CrmLeadListRow): string =>
  lead.name?.trim() || lead.phone;

export const LeadsList = ({
  leads,
  page,
  pageSize,
  totalCount,
  onPageChange,
  emptyTitle,
  emptyDescription,
  copy,
  showAssign,
  agents,
  assigningLeadId,
  onAssign,
}: LeadsListProps): React.JSX.Element => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  if (totalCount === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
        role="region"
        aria-label={copy.listRegionLabel}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 hidden gap-4 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.65fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] dark:text-zinc-400">
            <span>{copy.colContact}</span>
            <span>{copy.colStatus}</span>
            <span>{copy.colAssignee}</span>
            <span>{copy.colLastMessage}</span>
            <span className="text-right">{copy.colLastContact}</span>
          </div>

          <ul className="flex flex-col gap-2 p-0">
            {leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                openInboxAriaLabel={openInboxAria(copy, displayName(lead))}
                unreadAriaLabel={copy.unreadMessages}
                copy={copy}
                showAssign={showAssign}
                agents={agents}
                assigningLeadId={assigningLeadId}
                onAssign={onAssign}
              />
            ))}
          </ul>
        </div>
      </div>

      <footer className="shrink-0 border-t border-zinc-200/80 bg-white/95 px-5 py-3 dark:border-white/10 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {copy.showing}{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {start}
              {copy.rangeSeparator}
              {end}
            </span>{" "}
            {copy.of}{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {totalCount}
            </span>
          </p>
          <nav
            className="flex items-center gap-2"
            aria-label={copy.paginationNavLabel}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className={[
                "rounded-xl border border-zinc-200/90 px-3 py-2 text-xs font-semibold transition",
                "hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10",
                "disabled:pointer-events-none disabled:opacity-40",
                "dark:border-white/10 dark:hover:bg-white/5 dark:focus-visible:ring-white/15",
              ].join(" ")}
            >
              {copy.previous}
            </button>
            <span className="tabular-nums text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {copy.pageLabel} {page} {copy.pageSeparator} {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className={[
                "rounded-xl border border-zinc-200/90 px-3 py-2 text-xs font-semibold transition",
                "hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10",
                "disabled:pointer-events-none disabled:opacity-40",
                "dark:border-white/10 dark:hover:bg-white/5 dark:focus-visible:ring-white/15",
              ].join(" ")}
            >
              {copy.next}
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};
