import { Suspense } from "react";
import { LeadsPageShell } from "@/components/sections/dashboard/LeadsPage/LeadsPageShell";
import type { InboxLocale } from "@/data/dictionaries/inbox-page";
import { getLeadsPageDict } from "@/data/dictionaries/leads-page";

const uiLocale: InboxLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";
const leadsCopy = getLeadsPageDict(uiLocale);

const LeadsFallback = (): React.JSX.Element => (
  <div
    className="flex h-[100dvh] items-center justify-center bg-zinc-50/90 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
    role="status"
    aria-live="polite"
  >
    {leadsCopy.loading}
  </div>
);

export default function LeadsPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LeadsFallback />}>
      <LeadsPageShell />
    </Suspense>
  );
}

