"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";
import { useDashboardState } from "@/context/dashboard-state-context";
import type { Conversation, InboxFilter } from "@/data/dashboard-seed";

const StagePill = ({
  stage,
}: {
  stage: Conversation["stage"];
}): React.JSX.Element => {
  const className =
    stage === "Won"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : stage === "Proposal"
        ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
        : stage === "Qualified"
          ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200";

  return (
    <span
      className={[
        "rounded-full px-2 py-1 text-[11px] font-semibold",
        className,
      ].join(" ")}
    >
      {stage}
    </span>
  );
};

const FILTER_OPTIONS: { value: InboxFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "New", label: "New" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Won", label: "Won" },
  ];

const ConversationRow = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}): React.JSX.Element => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left outline-none transition",
        isSelected
          ? "border-emerald-500/40 bg-emerald-50/70 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/10"
          : "border-zinc-200/70 bg-white/60 hover:bg-white focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/30 dark:hover:bg-zinc-950/50",
      ].join(" ")}
      aria-pressed={isSelected}
      aria-label={`Open conversation with ${conversation.name}`}
    >
      <div
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-bold text-white"
        aria-hidden="true"
      >
        {conversation.name
          .split(" ")
          .slice(0, 2)
          .map((s) => s[0])
          .join("")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{conversation.name}</p>
          <p className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
            {conversation.time}
          </p>
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-400">
          {conversation.phone}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-800 dark:text-zinc-100">
          {conversation.lastMessage}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <StagePill stage={conversation.stage} />
          {conversation.unread > 0 ? (
            <span
              className="grid size-6 place-items-center rounded-full bg-emerald-600 text-xs font-semibold text-white dark:bg-emerald-500 dark:text-zinc-950"
              aria-label={`${conversation.unread} unread messages`}
            >
              {conversation.unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export const InboxPreview = (): React.JSX.Element => {
  const {
    filteredConversations,
    selectedConversationId,
    selectConversation,
    selectedConversation,
    inboxFilter,
    setInboxFilter,
    filterMenuOpen,
    setFilterMenuOpen,
    composerDraft,
    setComposerDraft,
    appendComposerTemplate,
    sendComposerMessage,
  } = useDashboardState();

  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterMenuOpen) return;
    const onDoc = (e: MouseEvent): void => {
      if (!filterRef.current?.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filterMenuOpen, setFilterMenuOpen]);

  const filterLabel =
    FILTER_OPTIONS.find((o) => o.value === inboxFilter)?.label ?? "All";

  return (
    <Card
      title="WhatsApp Inbox"
      subtitle="Priority conversations and quick replies"
      right={
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-950"
            aria-expanded={filterMenuOpen}
            aria-haspopup="listbox"
            aria-label={`Inbox filter: ${filterLabel}`}
          >
            {filterLabel}
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
          </button>
          {filterMenuOpen ? (
            <ul
              className="absolute right-0 z-40 mt-2 min-w-[180px] rounded-xl border border-zinc-200/70 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-zinc-950"
              role="listbox"
              aria-label="Filter conversations"
            >
              {FILTER_OPTIONS.map((opt) => (
                <li key={opt.value} role="option" aria-selected={inboxFilter === opt.value}>
                  <button
                    type="button"
                    className={[
                      "flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium",
                      inboxFilter === opt.value
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/10",
                    ].join(" ")}
                    onClick={() => {
                      setInboxFilter(opt.value);
                      setFilterMenuOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-1 gap-3">
          {filteredConversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200/80 bg-white/60 p-8 text-center text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950/30 dark:text-zinc-400">
              No conversations match this filter or search.
            </div>
          ) : (
            filteredConversations.map((c) => (
              <ConversationRow
                key={c.id}
                conversation={c}
                isSelected={c.id === selectedConversationId}
                onSelect={() => selectConversation(c.id)}
              />
            ))
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-zinc-950/30">
            <p className="text-sm font-semibold">Customer context</p>
            {selectedConversation ? (
              <>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-zinc-600 dark:text-zinc-400">
                      Status
                    </dt>
                    <dd className="mt-1 font-semibold">
                      {selectedConversation.stage}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-600 dark:text-zinc-400">
                      Owner
                    </dt>
                    <dd className="mt-1 font-semibold">
                      {selectedConversation.owner}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-600 dark:text-zinc-400">
                      Last touch
                    </dt>
                    <dd className="mt-1 font-semibold">
                      {selectedConversation.lastTouchLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-600 dark:text-zinc-400">
                      Deal value
                    </dt>
                    <dd className="mt-1 font-semibold">
                      {selectedConversation.dealValue}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedConversation.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Select a conversation to see context.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-3 dark:border-white/10 dark:bg-zinc-950/30">
            <label className="sr-only" htmlFor="quick-reply">
              Quick reply
            </label>
            <textarea
              id="quick-reply"
              rows={3}
              value={composerDraft}
              onChange={(e) => setComposerDraft(e.target.value)}
              placeholder="Type a quick reply…"
              disabled={!selectedConversation}
              className="w-full resize-none rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {["Pricing", "Demo slot", "Follow-up", "Invoice"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!selectedConversation}
                    onClick={() => appendComposerTemplate(`[${label}] `)}
                    className="rounded-full border border-zinc-200/70 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-950"
                    aria-label={`Insert template ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!selectedConversation || !composerDraft.trim()}
                onClick={() => sendComposerMessage()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                Send
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
