"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCrmAuth } from "@/context/crm-auth-context";
import {
  getLeadsPageDict,
  type LeadsLocale,
} from "@/data/dictionaries/leads-page";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";
import { NotificationsBell } from "@/components/sections/dashboard/InboxPage/NotificationsBell";

type NavItem = {
  href: string;
  label: string;
  match: "exact" | "prefix";
  icon: (props: { className?: string }) => React.JSX.Element;
};

const uiLocale: LeadsLocale & DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

const LogoMark = ({ className }: { className?: string }): React.JSX.Element => {
  return (
    <div
      className={[
        "grid size-9 place-items-center rounded-xl bg-zinc-900 text-white shadow-sm",
        "dark:bg-zinc-100 dark:text-zinc-900",
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
  Users: ({ className }: { className?: string }): React.JSX.Element => (
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

export const InboxSidebar = (): React.JSX.Element => {
  const pathname = usePathname();
  const { user, logout } = useCrmAuth();
  const router = useRouter();
  const leadsCopy = useMemo(() => getLeadsPageDict(uiLocale), []);
  const navCopy = useMemo(() => getDashboardNavDict(uiLocale), []);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: "/dashboard",
        label: navCopy.overview,
        icon: Icon.Overview,
        match: "exact",
      },
      {
        href: "/inbox",
        label: navCopy.inbox,
        icon: Icon.Inbox,
        match: "exact",
      },
      {
        href: "/leads",
        label: navCopy.leads,
        icon: Icon.Leads,
        match: "prefix",
      },
      {
        href: "/agents",
        label: navCopy.agents,
        icon: Icon.Users,
        match: "prefix",
      },
      {
        href: "/system",
        label: navCopy.system,
        icon: Icon.Settings,
        match: "prefix",
      },
      {
        href: "/settings",
        label: navCopy.settings,
        icon: Icon.Settings,
        match: "prefix",
      },
    ],
    [
      navCopy.agents,
      navCopy.inbox,
      navCopy.leads,
      navCopy.overview,
      navCopy.settings,
      navCopy.system,
    ],
  );

  const workspaceSubtitle = useMemo((): string => {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return navCopy.overview;
    }
    if (pathname.startsWith("/settings")) {
      return navCopy.settings;
    }
    if (pathname.startsWith("/system")) {
      return navCopy.system;
    }
    if (pathname.startsWith("/agents")) {
      return navCopy.agents;
    }
    if (pathname.startsWith("/leads")) {
      return navCopy.leads;
    }
    if (pathname.startsWith("/inbox")) {
      return navCopy.inbox;
    }
    return navCopy.inbox;
  }, [
    navCopy.agents,
    navCopy.inbox,
    navCopy.leads,
    navCopy.overview,
    navCopy.settings,
    navCopy.system,
    pathname,
  ]);

  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col border-r border-zinc-200/80 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-950/80"
      aria-label="Workspace navigation"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              ClientFlow
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {workspaceSubtitle}
            </p>
          </div>
        </div>
        <NotificationsBell />
      </div>

      <nav className="px-2" aria-label="Primary">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            const active = isActivePath(pathname, item.href, item.match);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition",
                    active
                      ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-white dark:ring-white/10"
                      : "text-zinc-600 hover:bg-white/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                    "focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/20",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <ItemIcon className="size-5 shrink-0 opacity-80" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-zinc-200/80 p-3 dark:border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2.5 shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/60 dark:ring-white/10">
          <span
            className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-bold text-white dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900"
            aria-hidden="true"
          >
            {user?.name
              ? user.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "CF"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {user?.name ?? "—"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span
                className={[
                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  user?.role === "admin"
                    ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200",
                ].join(" ")}
              >
                {user?.role === "admin"
                  ? leadsCopy.roleAdmin
                  : leadsCopy.roleAgent}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
              router.refresh();
            }}
            className="hidden h-9 items-center justify-center rounded-xl border border-zinc-200/70 bg-white/70 px-3 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-950 sm:inline-flex"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
