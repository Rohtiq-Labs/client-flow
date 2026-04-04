import { DashboardSystemMain } from "@/components/sections/dashboard/DashboardShell/DashboardSystemMain";
import { CrmFullShell } from "@/components/sections/dashboard/CrmShell/CrmFullShell";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";
import type { SystemLocale } from "@/data/dictionaries/system-page";
import { getSystemPageDict } from "@/data/dictionaries/system-page";

const uiLocale: DashboardNavLocale & SystemLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export default function SystemPage(): React.JSX.Element {
  const navCopy = getDashboardNavDict(uiLocale);
  const copy = getSystemPageDict(uiLocale);

  return (
    <CrmFullShell title={navCopy.system} subtitle={copy.subtitle}>
      <div className="mx-auto w-full max-w-2xl">
        <DashboardSystemMain />
      </div>
    </CrmFullShell>
  );
}

