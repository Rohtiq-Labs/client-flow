"use client";

import { InboxSidebar } from "@/components/sections/dashboard/InboxPage/InboxSidebar";

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
  return (
    <main
      id="main"
      className="flex h-[100dvh] w-full overflow-hidden bg-zinc-50/90 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <InboxSidebar />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-zinc-200/80 bg-white/90 px-5 py-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          {children}
        </div>
      </section>
    </main>
  );
};

