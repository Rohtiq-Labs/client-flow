"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/sections/dashboard/DashboardShell/DashboardSidebar";
import { DashboardTopbar } from "@/components/sections/dashboard/DashboardShell/DashboardTopbar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const isFullCrmShellRoute = (pathname: string): boolean =>
  pathname === "/dashboard" ||
  pathname === "/dashboard/" ||
  pathname === "/dashboard/inbox" ||
  pathname === "/dashboard/inbox/" ||
  pathname === "/dashboard/leads" ||
  pathname === "/dashboard/leads/" ||
  pathname === "/dashboard/system" ||
  pathname === "/dashboard/system/" ||
  pathname === "/dashboard/settings" ||
  pathname === "/dashboard/settings/";

export const DashboardLayout = ({
  children,
}: DashboardLayoutProps): React.JSX.Element => {
  const pathname = usePathname();

  if (isFullCrmShellRoute(pathname)) {
    return (
      <>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:focus:bg-zinc-950 dark:focus:text-zinc-50 dark:focus:ring-white/20"
        >
          Skip to content
        </a>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(1200px_600px_at_20%_-10%,theme(colors.emerald.100),transparent_60%),radial-gradient(900px_500px_at_90%_0%,theme(colors.sky.100),transparent_55%),linear-gradient(to_bottom,theme(colors.white),theme(colors.zinc.50))] text-zinc-950 dark:bg-[radial-gradient(1200px_600px_at_20%_-10%,theme(colors.emerald.950),transparent_60%),radial-gradient(900px_500px_at_90%_0%,theme(colors.sky.950),transparent_55%),linear-gradient(to_bottom,theme(colors.zinc.950),theme(colors.black))] dark:text-zinc-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:ring-2 focus:ring-emerald-500 dark:focus:bg-zinc-950 dark:focus:text-zinc-50"
      >
        Skip to content
      </a>
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-[280px_1fr] lg:gap-6 lg:py-6">
          <DashboardSidebar />
          <div className="min-w-0">
            <DashboardTopbar />
            <main id="main" className="mt-4 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
