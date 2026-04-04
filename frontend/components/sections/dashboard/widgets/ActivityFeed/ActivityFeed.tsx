"use client";

import { useMemo } from "react";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";
import { useDashboardState } from "@/context/dashboard-state-context";
import type { ActivityType } from "@/data/dashboard-seed";

const ActivityIcon = ({ type }: { type: ActivityType }): React.JSX.Element => {
  const common =
    "grid size-10 place-items-center rounded-xl border border-zinc-200/70 bg-white/70 text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200";

  if (type === "message") {
    return (
      <div className={common} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      </div>
    );
  }

  if (type === "deal") {
    return (
      <div className={common} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6" />
          <path d="M4 12h16l-1.5 8.5A2 2 0 0 1 16.5 22h-9a2 2 0 0 1-2-1.5L4 12Z" />
          <path d="M9 9h6" />
        </svg>
      </div>
    );
  }

  if (type === "task") {
    return (
      <div className={common} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
    );
  }

  return (
    <div className={common} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M7 8h10" />
        <path d="M7 12h10" />
        <path d="M7 16h7" />
      </svg>
    </div>
  );
};

export const ActivityFeed = (): React.JSX.Element => {
  const { activities } = useDashboardState();

  const sorted = useMemo(
    () => [...activities].sort((a, b) => b.createdAt - a.createdAt),
    [activities],
  );

  return (
    <Card title="Activity" subtitle="Everything that changed recently">
      <ol className="space-y-3" aria-label="Activity feed">
        {sorted.map((activity) => (
          <li
            key={activity.id}
            className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950/30"
          >
            <ActivityIcon type={activity.type} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{activity.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activity.time}
                </p>
              </div>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                {activity.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
};
