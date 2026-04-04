"use client";

import { useId, useMemo } from "react";
import type { LeadsPageCopy } from "@/data/dictionaries/leads-page";
import type { LeadScopeFilter, LeadStatusFilter } from "@/data/leads-page-mock-data";

type LeadsHeaderProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: LeadStatusFilter;
  onStatusFilterChange: (f: LeadStatusFilter) => void;
  scopeFilter: LeadScopeFilter;
  onScopeFilterChange: (f: LeadScopeFilter) => void;
  showScopeFilter: boolean;
  onAddLead: () => void;
  copy: LeadsPageCopy;
};

export const LeadsHeader = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  scopeFilter,
  onScopeFilterChange,
  showScopeFilter,
  onAddLead,
  copy,
}: LeadsHeaderProps): React.JSX.Element => {
  const filterId = useId();
  const scopeId = useId();

  const scopeOptions = useMemo(
    (): { value: LeadScopeFilter; label: string }[] => [
      { value: "all", label: copy.scopeAll },
      { value: "mine", label: copy.scopeMine },
      { value: "unassigned", label: copy.scopeUnassigned },
    ],
    [copy.scopeAll, copy.scopeMine, copy.scopeUnassigned],
  );

  const filterOptions = useMemo(
    (): { value: LeadStatusFilter; label: string }[] => [
      { value: "all", label: copy.filterAll },
      { value: "New", label: copy.filterNew },
      { value: "Replied", label: copy.filterReplied },
      { value: "Interested", label: copy.filterInterested },
      { value: "Converted", label: copy.filterConverted },
      { value: "Lost", label: copy.filterLost },
    ],
    [copy],
  );

  return (
    <header className="shrink-0 border-b border-zinc-200/80 bg-white/90 px-5 py-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {showScopeFilter ? (
            <>
              <label htmlFor={scopeId} className="sr-only">
                {copy.scopeSrOnly}
              </label>
              <select
                id={scopeId}
                value={scopeFilter}
                onChange={(e) =>
                  onScopeFilterChange(e.target.value as LeadScopeFilter)
                }
                className="h-11 w-full min-w-[160px] rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-50 dark:focus:border-white/20 dark:focus:ring-white/10 sm:w-auto"
              >
                {scopeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <label htmlFor={filterId} className="sr-only">
            {copy.filterSrOnly}
          </label>
          <select
            id={filterId}
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as LeadStatusFilter)
            }
            className="h-11 w-full min-w-[160px] rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-50 dark:focus:border-white/20 dark:focus:ring-white/10 sm:w-auto"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onAddLead}
            title={copy.addLeadTitle}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm outline-none transition hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            {copy.addLead}
          </button>
        </div>
      </div>

      <div className="relative mt-4">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 21l-4.3-4.3" />
            <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
          </svg>
        </span>
        <label htmlFor="leads-page-search" className="sr-only">
          {copy.searchSrOnly}
        </label>
        <input
          id="leads-page-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={copy.searchPlaceholder}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/10"
        />
      </div>
    </header>
  );
};
