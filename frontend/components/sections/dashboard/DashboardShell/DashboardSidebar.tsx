"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useDashboardState } from "@/context/dashboard-state-context";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";

const uiLocale: DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.JSX.Element;
  badge?: string;
  match: "exact" | "prefix";
};

const LogoMark = ({ className }: { className?: string }): React.JSX.Element => {
  return (
    <div
      className={[
        "grid size-9 place-items-center rounded-xl",
        "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20",
        "dark:bg-emerald-500 dark:text-zinc-950",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 12a5 5 0 0 1 10 0v2a5 5 0 0 1-10 0v-2Z" />
        <path d="M9 9V7a3 3 0 0 1 6 0v2" />
      </svg>
    </div>
  );
};

const Icon = {
  Overview: ({ className }: { className?: string }): React.JSX.Element => (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3v7h7" />
      <path d="M21 21v-7h-7" />
      <path d="M3 11a9 9 0 0 1 9-9 9 9 0 0 1 9 9" />
      <path d="M21 13a9 9 0 0 1-9 9 9 9 0 0 1-9-9" />
    </svg>
  ),
  Inbox: ({ className }: { className?: string }): React.JSX.Element => (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 12V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5" />
      <path d="M22 12l-4 7H6l-4-7" />
      <path d="M2 12h6l2 3h4l2-3h6" />
    </svg>
  ),
  Leads: ({ className }: { className?: string }): React.JSX.Element => (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M22 21v-2a3 3 0 0 0-2.2-2.9" />
      <path d="M16.8 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  ),
  Settings: ({ className }: { className?: string }): React.JSX.Element => (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1a2 2 0 0 1-1.4 3.4h-.1a2 2 0 0 0-2.2 1.1 2 2 0 0 1-3.6 0 2 2 0 0 0-2.2-1.1h-.1a2 2 0 0 1-1.4-3.4l.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 1 0-6 2 2 0 0 0-.4-2.2l-.1-.1A2 2 0 0 1 5.5 3.3h.1a2 2 0 0 0 2.2-1.1 2 2 0 0 1 3.6 0 2 2 0 0 0 2.2 1.1h.1a2 2 0 0 1 1.4 3.4l-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 1 0 6Z" />
    </svg>
  ),
};

const isActivePath = (
  pathname: string,
  href: string,
  match: NavItem["match"],
): boolean => {
  if (match === "exact") {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const DashboardSidebar = (): React.JSX.Element => {
  const pathname = usePathname();
  const { conversations, kpiMetrics, sidebarStats } = useDashboardState();
  const copy = useMemo(() => getDashboardNavDict(uiLocale), []);

  const unreadInbox = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations],
  );

  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: "/dashboard",
        label: copy.overview,
        icon: Icon.Overview,
        match: "exact",
      },
      {
        href: "/dashboard/inbox",
        label: copy.inbox,
        icon: Icon.Inbox,
        badge: unreadInbox > 0 ? String(unreadInbox) : undefined,
        match: "exact",
      },
      {
        href: "/dashboard/leads",
        label: copy.leads,
        icon: Icon.Leads,
        badge:
          kpiMetrics.openDeals > 0 ? String(kpiMetrics.openDeals) : undefined,
        match: "prefix",
      },
      {
        href: "/dashboard/system",
        label: copy.system,
        icon: Icon.Settings,
        match: "prefix",
      },
      {
        href: "/dashboard/settings",
        label: copy.settings,
        icon: Icon.Settings,
        match: "prefix",
      },
    ],
    [
      copy.inbox,
      copy.leads,
      copy.overview,
      copy.settings,
      copy.system,
      kpiMetrics.openDeals,
      unreadInbox,
    ],
  );

  return (
    <aside className="lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)]">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5">
              ClientFlow
            </p>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
              WhatsApp-first CRM
            </p>
          </div>
        </div>

        <nav aria-label="Primary" className="mt-6">
          <ul className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isActivePath(pathname, item.href, item.match);
              const base =
                "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium outline-none transition";
              const activeCls = active
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-500 dark:text-zinc-950"
                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white";

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[base, activeCls].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <ItemIcon
                        className={[
                          "size-5 shrink-0",
                          active
                            ? "text-white dark:text-zinc-950"
                            : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white",
                        ].join(" ")}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                          active
                            ? "bg-white/20 text-white dark:bg-zinc-950/20 dark:text-zinc-950"
                            : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
                        ].join(" ")}
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 rounded-xl border border-zinc-200/70 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
            Today
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white p-2 text-center shadow-sm dark:bg-zinc-950/50">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">New</p>
              <p className="text-sm font-semibold">{sidebarStats.newCount}</p>
            </div>
            <div className="rounded-lg bg-white p-2 text-center shadow-sm dark:bg-zinc-950/50">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Due</p>
              <p className="text-sm font-semibold">{sidebarStats.dueCount}</p>
            </div>
            <div className="rounded-lg bg-white p-2 text-center shadow-sm dark:bg-zinc-950/50">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Won</p>
              <p className="text-sm font-semibold">{sidebarStats.wonCount}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
