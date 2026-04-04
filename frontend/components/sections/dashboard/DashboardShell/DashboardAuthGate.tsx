"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCrmAuth } from "@/context/crm-auth-context";
import { getCrmAuthToken } from "@/lib/crm-auth-token";
import { clearAuthCookie } from "@/lib/crm-auth-session";

type DashboardAuthGateProps = {
  children: React.ReactNode;
};

export const DashboardAuthGate = ({
  children,
}: DashboardAuthGateProps): React.JSX.Element => {
  const router = useRouter();
  const { ready, isAuthenticated } = useCrmAuth();

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!isAuthenticated || !getCrmAuthToken()) {
      clearAuthCookie();
      router.replace("/login?next=/inbox");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) {
    return (
      <div
        className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
};
