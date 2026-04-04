"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/sections/dashboard/DashboardShell/LogoutButton";
import { useDashboardState } from "@/context/dashboard-state-context";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";

const uiLocale: DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

const IconButton = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <button
      type="button"
      className="grid size-10 place-items-center rounded-xl border border-zinc-200/70 bg-white/70 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-950"
      aria-label={label}
    >
      {children}
    </button>
  );
};

export const DashboardTopbar = (): React.JSX.Element => {
  const pathname = usePathname();
  const {
    searchQuery,
    setSearchQuery,
    searchInputRef,
    startNewConversation,
  } = useDashboardState();
  const navCopy = useMemo(() => getDashboardNavDict(uiLocale), []);

  const { title, subtitle, showInboxActions } = useMemo(() => {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return {
        title: navCopy.overview,
        subtitle: navCopy.overviewSubtitle,
        showInboxActions: false,
      };
    }
    if (pathname.startsWith("/dashboard/settings")) {
      return {
        title: navCopy.settings,
        subtitle: "Workspace preferences and routing",
        showInboxActions: false,
      };
    }
    if (pathname.startsWith("/dashboard/system")) {
      return {
        title: navCopy.system,
        subtitle: "Branding and Twilio credentials",
        showInboxActions: false,
      };
    }
    if (pathname.startsWith("/dashboard/leads")) {
      return {
        title: navCopy.leads,
        subtitle: "Pipeline, deal value, and stage movement",
        showInboxActions: true,
      };
    }
    if (pathname.startsWith("/dashboard/inbox")) {
      return {
        title: navCopy.inbox,
        subtitle: "Conversations and replies",
        showInboxActions: true,
      };
    }
    return {
      title: navCopy.inbox,
      subtitle: "WhatsApp conversations, deals, and tasks in one view",
      showInboxActions: true,
    };
  }, [
    navCopy.inbox,
    navCopy.leads,
    navCopy.overview,
    navCopy.overviewSubtitle,
    navCopy.settings,
    navCopy.system,
    pathname,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchInputRef]);

  return (
    <header className="sticky top-4 z-30 rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        <div
          className={[
            "hidden min-w-[320px] flex-1 sm:block",
            showInboxActions ? "" : "sm:hidden",
          ].join(" ")}
        >
          <label className="sr-only" htmlFor="dashboard-search">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 21l-4.3-4.3" />
                <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              id="dashboard-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, deals, messages…"
              className="h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-10 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center text-xs font-medium text-zinc-500 sm:flex">
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-white/10 dark:bg-white/5">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showInboxActions ? (
            <button
              type="button"
              onClick={() => startNewConversation()}
              className="hidden h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400 sm:flex"
            >
              New message
            </button>
          ) : null}

          <LogoutButton />

          <IconButton label="Notifications">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </IconButton>

          <IconButton label="Help">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" />
              <path d="M12 17h.01" />
              <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
            </svg>
          </IconButton>

          <button
            type="button"
            className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/40 dark:hover:bg-zinc-950"
            aria-label="Open profile menu"
          >
            <span
              className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-bold text-white"
              aria-hidden="true"
            >
              CF
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-sm font-semibold leading-5">
                Sales Inbox
              </span>
              <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">
                Team workspace
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              className="hidden size-4 text-zinc-500 sm:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
