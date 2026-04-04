import { ActivityFeed } from "@/components/sections/dashboard/widgets/ActivityFeed/ActivityFeed";
import { DashboardKpiGrid } from "@/components/sections/dashboard/widgets/DashboardKpiGrid/DashboardKpiGrid";
import { InboxPreview } from "@/components/sections/dashboard/widgets/InboxPreview/InboxPreview";
import { TodayTasks } from "@/components/sections/dashboard/widgets/TodayTasks/TodayTasks";

export const DashboardInboxMain = (): React.JSX.Element => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <section
        id="kpis"
        className="scroll-mt-28 lg:col-span-12"
        aria-label="Key metrics"
      >
        <DashboardKpiGrid />
      </section>

      <section
        id="inbox"
        className="scroll-mt-28 lg:col-span-7"
        aria-label="WhatsApp inbox preview"
      >
        <InboxPreview />
      </section>

      <section
        id="tasks"
        className="scroll-mt-28 lg:col-span-5"
        aria-label="Tasks"
      >
        <TodayTasks />
      </section>

      <section
        id="activity"
        className="scroll-mt-28 lg:col-span-12"
        aria-label="Recent activity"
      >
        <ActivityFeed />
      </section>
    </div>
  );
};
