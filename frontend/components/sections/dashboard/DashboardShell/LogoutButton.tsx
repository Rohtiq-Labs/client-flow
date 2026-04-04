"use client";

import { useRouter } from "next/navigation";
import { useCrmAuth } from "@/context/crm-auth-context";

export const LogoutButton = (): React.JSX.Element => {
  const router = useRouter();
  const { logout } = useCrmAuth();

  const onLogout = (): void => {
    logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className="hidden h-10 items-center justify-center rounded-xl border border-zinc-200/70 bg-white/70 px-4 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-950 sm:flex"
    >
      Logout
    </button>
  );
};

