"use client";

import { useMemo } from "react";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";
import { useDashboardState } from "@/context/dashboard-state-context";

type KpiRow = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  helper: string;
};

const TrendPill = ({
  trend,
  delta,
}: {
  trend: "up" | "down";
  delta: string;
}): React.JSX.Element => {
  const up = trend === "up";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
        up
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      ].join(" ")}
      aria-label={`Trend ${delta}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {up ? (
          <>
            <path d="M7 17l10-10" />
            <path d="M7 7h10v10" />
          </>
        ) : (
          <>
            <path d="M7 7l10 10" />
            <path d="M7 17h10V7" />
          </>
        )}
      </svg>
      <span>{delta}</span>
    </span>
  );
};

const formatPkr = (n: number): string => {
  if (n >= 1_000_000) return `₨ ${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1000) return `₨ ${Math.round(n / 1000)}k`;
  return `₨ ${n}`;
};

export const DashboardKpiGrid = (): React.JSX.Element => {
  const { kpiMetrics } = useDashboardState();

  const kpis = useMemo<KpiRow[]>(
    () => [
      {
        label: "Unread threads",
        value: String(kpiMetrics.unreadThreads),
        delta: kpiMetrics.unreadThreads > 0 ? "Action" : "Clear",
        trend: kpiMetrics.unreadThreads > 0 ? "down" : "up",
        helper: "conversations needing attention",
      },
      {
        label: "Open tasks",
        value: String(kpiMetrics.openTasks),
        delta: kpiMetrics.openTasks > 0 ? "Due" : "Done",
        trend: kpiMetrics.openTasks > 0 ? "down" : "up",
        helper: "incomplete today",
      },
      {
        label: "Open deals",
        value: String(kpiMetrics.openDeals),
        delta: "Live",
        trend: "up",
        helper: "not in Won",
      },
      {
        label: "Revenue at risk",
        value: formatPkr(kpiMetrics.revenueAtRiskPkr),
        delta: "Proposal + Negotiation",
        trend: "down",
        helper: "sum of deal values in flight",
      },
    ],
    [kpiMetrics],
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          title={kpi.label}
          subtitle={kpi.helper}
          right={<TrendPill trend={kpi.trend} delta={kpi.delta} />}
          className="overflow-hidden"
        >
          <div className="flex items-end justify-between gap-4">
            <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
            <div className="h-10 w-24 rounded-xl bg-[linear-gradient(90deg,theme(colors.emerald.500/0.12),theme(colors.sky.500/0.10))] dark:bg-[linear-gradient(90deg,theme(colors.emerald.400/0.14),theme(colors.sky.400/0.12))]" />
          </div>
        </Card>
      ))}
    </div>
  );
};
