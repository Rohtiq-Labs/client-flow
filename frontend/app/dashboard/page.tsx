import { CrmFullShell } from "@/components/sections/dashboard/CrmShell/CrmFullShell";
import { DashboardHomeShell } from "@/components/sections/dashboard/HomePage/DashboardHomeShell";
import type { DashboardHomeLocale } from "@/data/dictionaries/dashboard-home-page";
import { getDashboardHomeDict } from "@/data/dictionaries/dashboard-home-page";

const uiLocale: DashboardHomeLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";
const dashboardHomeCopy = getDashboardHomeDict(uiLocale);

export default function DashboardPage(): React.JSX.Element {
  return (
    <CrmFullShell
      title={dashboardHomeCopy.pageTitle}
      subtitle={dashboardHomeCopy.pageSubtitle}
    >
      <DashboardHomeShell />
    </CrmFullShell>
  );
}
