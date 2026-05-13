"use client";

import { useMemo, useState } from "react";
import {
  CrmMobileNavBackdrop,
  CrmMobileNavMenuButton,
} from "@/components/sections/dashboard/CrmShell/crm-mobile-nav-controls";
import { InboxSidebar } from "@/components/sections/dashboard/InboxPage/InboxSidebar";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";

const uiLocale: DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

type CrmFullShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const CrmFullShell = ({
  title,
  subtitle,
  children,
}: CrmFullShellProps): React.JSX.Element => {
  const navCopy = useMemo(() => getDashboardNavDict(uiLocale), []);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <main
      id="main"
      className="relative flex h-[100dvh] w-full overflow-hidden bg-zinc-50/90 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <CrmMobileNavBackdrop
        open={navOpen}
        onClose={() => {
          setNavOpen(false);
        }}
        closeLabel={navCopy.closeNavigationMenuAria}
      />
      <InboxSidebar
        mobileDrawerOpen={navOpen}
        onMobileDrawerClose={() => {
          setNavOpen(false);
        }}
      />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-start gap-3 border-b border-zinc-200/80 bg-white/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5 dark:border-white/10 dark:bg-zinc-950/80">
          <CrmMobileNavMenuButton
            label={navCopy.openNavigationMenuAria}
            onClick={() => {
              setNavOpen(true);
            }}
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 sm:py-6">
          {children}
        </div>
      </section>
    </main>
  );
};
