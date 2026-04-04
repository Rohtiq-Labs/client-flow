import { ActivityFeed } from "@/components/sections/dashboard/widgets/ActivityFeed/ActivityFeed";
import { DashboardKpiGrid } from "@/components/sections/dashboard/widgets/DashboardKpiGrid/DashboardKpiGrid";
import { PipelineBoard } from "@/components/sections/dashboard/widgets/PipelineBoard/PipelineBoard";

export const DashboardLeadsMain = (): React.JSX.Element => {
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
        id="pipeline"
        className="scroll-mt-28 lg:col-span-12"
        aria-label="Deal pipeline"
      >
        <PipelineBoard />
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
