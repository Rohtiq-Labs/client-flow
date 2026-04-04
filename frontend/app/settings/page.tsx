import { DashboardSettingsMain } from "@/components/sections/dashboard/DashboardShell/DashboardSettingsMain";
import { CrmFullShell } from "@/components/sections/dashboard/CrmShell/CrmFullShell";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";

const uiLocale: DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export default function SettingsPage(): React.JSX.Element {
  const navCopy = getDashboardNavDict(uiLocale);

  return (
    <CrmFullShell
      title={navCopy.settings}
      subtitle="Workspace preferences and routing"
    >
      <div className="mx-auto w-full max-w-3xl">
        <DashboardSettingsMain />
      </div>
    </CrmFullShell>
  );
}

