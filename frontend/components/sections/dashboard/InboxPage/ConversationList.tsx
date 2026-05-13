"use client";

import { ConversationItem } from "@/components/sections/dashboard/InboxPage/ConversationItem";
import type { InboxPageCopy } from "@/data/dictionaries/inbox-page";
import type { InboxLead, LeadListBadge } from "@/data/inbox-mock-data";

type ConversationListProps = {
  leads: InboxLead[];
  selectedLeadId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectLead: (id: string) => void;
  copy: InboxPageCopy;
  badgeLabel: (badge: LeadListBadge) => string;
  navigationMenuSlot?: React.ReactNode;
};

const filterLeads = (leads: InboxLead[], q: string): InboxLead[] => {
  const needle = q.trim().toLowerCase();
  if (!needle) return leads;
  return leads.filter((l) => {
    const name = (l.name ?? "").toLowerCase();
    const phone = l.phone.toLowerCase().replace(/\s/g, "");
    const n = needle.replace(/\s/g, "");
    return name.includes(needle) || phone.includes(n);
  });
};

export const ConversationList = ({
  leads,
  selectedLeadId,
  searchQuery,
  onSearchChange,
  onSelectLead,
  copy,
  badgeLabel,
  navigationMenuSlot,
}: ConversationListProps): React.JSX.Element => {
  const filtered = filterLeads(leads, searchQuery);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 shrink-0 flex-col border-r border-zinc-200/80 bg-white lg:w-[320px] dark:border-white/10 dark:bg-zinc-950">
      <header className="shrink-0 border-b border-zinc-200/80 px-3 py-3 sm:px-4 sm:py-4 dark:border-white/10">
        <div className="flex items-start gap-2">
          {navigationMenuSlot ? (
            <div className="shrink-0 pt-0.5">{navigationMenuSlot}</div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight text-zinc-950 sm:text-lg dark:text-zinc-50">
              {copy.title}
            </h1>
            <label htmlFor="inbox-conversation-search" className="sr-only">
              {copy.searchPlaceholder}
            </label>
            <div className="relative mt-3">
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
              <input
                id="inbox-conversation-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={copy.searchPlaceholder}
                autoComplete="off"
                className="h-10 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 pl-9 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/10"
              />
            </div>
          </div>
        </div>
      </header>

      <ul
        aria-label="Conversations"
        className="min-h-0 list-none flex-1 overflow-y-auto overscroll-contain p-0"
      >
        {leads.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              {copy.emptyInboxTitle}
            </p>
            <p className="mt-2 text-xs leading-relaxed">{copy.emptyInboxHint}</p>
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {copy.emptySearch}
          </li>
        ) : (
          filtered.map((lead) => (
            <li key={lead.id} className="m-0 p-0">
              <ConversationItem
                lead={lead}
                isActive={lead.id === selectedLeadId}
                onSelect={() => onSelectLead(lead.id)}
                badgeLabel={badgeLabel(lead.listBadge)}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
