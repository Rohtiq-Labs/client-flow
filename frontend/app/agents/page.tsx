import { CrmFullShell } from "@/components/sections/dashboard/CrmShell/CrmFullShell";
import { TeamAgentsSection } from "@/components/sections/dashboard/DashboardShell/TeamAgentsSection";
import type { DashboardNavLocale } from "@/data/dictionaries/dashboard-nav";
import { getDashboardNavDict } from "@/data/dictionaries/dashboard-nav";

const uiLocale: DashboardNavLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

export default function AgentsPage(): React.JSX.Element {
  const navCopy = getDashboardNavDict(uiLocale);

  return (
    <CrmFullShell title={navCopy.agents} subtitle="Manage your organization team">
      <div className="mx-auto w-full max-w-3xl">
        <TeamAgentsSection />
      </div>
    </CrmFullShell>
  );
}

