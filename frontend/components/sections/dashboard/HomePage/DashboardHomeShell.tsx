"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { DashboardHomeLocale } from "@/data/dictionaries/dashboard-home-page";
import { getDashboardHomeDict } from "@/data/dictionaries/dashboard-home-page";
import {
  fetchCrmDashboard,
  fetchCrmOrganizationInfo,
  type CrmDashboardData,
} from "@/lib/crm-client";
import { crmSocketAuthPayload } from "@/lib/crm-socket-auth";
import { formatInboxRelativeTime } from "@/lib/format-inbox-time";

const uiLocale: DashboardHomeLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

const POLL_MS = 60_000;

type PipelineKey = keyof CrmDashboardData["pipeline"];

const pipelineOrder: PipelineKey[] = [
  "new",
  "replied",
  "interested",
  "converted",
  "lost",
];

const pipelineBarClass: Record<PipelineKey, string> = {
  new: "bg-zinc-500 dark:bg-zinc-400",
  replied: "bg-sky-600 dark:bg-sky-500",
  interested: "bg-amber-500 dark:bg-amber-400",
  converted: "bg-emerald-600 dark:bg-emerald-500",
  lost: "bg-red-600 dark:bg-red-500",
};

export const DashboardHomeShell = (): React.JSX.Element | null => {
  const copy = useMemo(() => getDashboardHomeDict(uiLocale), []);
  const [data, setData] = useState<CrmDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgIdRef = useRef<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const [dash, org] = await Promise.all([
        fetchCrmDashboard(),
        fetchCrmOrganizationInfo().catch(() => null),
      ]);
      setData(dash);
      if (org?.id) {
        orgIdRef.current = org.id;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_CRM_SOCKET_URL?.trim() ?? "";
    if (!base) {
      return;
    }

    const socket: Socket = io(base.replace(/\/$/, ""), {
      path: "/socket.io",
      auth: crmSocketAuthPayload(),
      transports: ["websocket", "polling"],
    });

    const onDashboardUpdated = (payload: {
      organizationId?: string;
    }): void => {
      const mine = orgIdRef.current;
      if (payload?.organizationId && mine && payload.organizationId !== mine) {
        return;
      }
      void load();
    };

    socket.on("dashboard_updated", onDashboardUpdated);
    return () => {
      socket.off("dashboard_updated", onDashboardUpdated);
      socket.disconnect();
    };
  }, [load]);

  const pipelineLabel = useMemo(
    () => ({
      new: copy.pipelineNew,
      replied: copy.pipelineReplied,
      interested: copy.pipelineInterested,
      converted: copy.pipelineConverted,
      lost: copy.pipelineLost,
    }),
    [
      copy.pipelineConverted,
      copy.pipelineInterested,
      copy.pipelineLost,
      copy.pipelineNew,
      copy.pipelineReplied,
    ],
  );

  const pipelineDenominator = useMemo(() => {
    if (!data) return 1;
    const sum = pipelineOrder.reduce(
      (acc, k) => acc + (data.pipeline[k] ?? 0),
      0,
    );
    return Math.max(data.totalLeads, sum, 1);
  }, [data]);

  if (loading && !data) {
    return (
      <div
        className="rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-300"
        role="status"
        aria-live="polite"
      >
        {copy.loading}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/40">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          onClick={() => {
            setLoading(true);
            void load();
          }}
        >
          {copy.retry}
        </button>
      </div>
    );
  }

  const d = data;
  if (!d) {
    return null;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section
        aria-label={copy.pageTitle}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label={copy.statTotalLeads}
          value={d.totalLeads}
          accent="border-l-sky-500"
        />
        <StatCard
          label={copy.statNewToday}
          value={d.newLeadsToday}
          accent="border-l-sky-600"
        />
        <StatCard
          label={copy.statActiveConversations}
          value={d.activeConversations}
          accent="border-l-blue-600"
        />
        <StatCard
          label={copy.statConverted}
          value={d.pipeline.converted}
          accent="border-l-emerald-600"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-md dark:border-white/10 dark:bg-zinc-950/60"
          aria-labelledby="pipeline-heading"
        >
          <h2
            id="pipeline-heading"
            className="text-base font-semibold text-zinc-950 dark:text-zinc-50"
          >
            {copy.pipelineTitle}
          </h2>
          <ul className="mt-4 space-y-4">
            {pipelineOrder.map((key) => {
              const count = d.pipeline[key] ?? 0;
              const pct = Math.round((count / pipelineDenominator) * 100);
              return (
                <li key={key}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {pipelineLabel[key]}
                    </span>
                    <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                      {count}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={d.totalLeads}
                    aria-label={`${pipelineLabel[key]}: ${count}`}
                  >
                    <div
                      className={[
                        "h-full rounded-full transition-[width] duration-500",
                        pipelineBarClass[key],
                      ].join(" ")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-md dark:border-white/10 dark:bg-zinc-950/60"
          aria-labelledby="agents-heading"
        >
          <h2
            id="agents-heading"
            className="text-base font-semibold text-zinc-950 dark:text-zinc-50"
          >
            {copy.agentTitle}
          </h2>
          {d.agentStats.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {copy.agentEmpty}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                    <th scope="col" className="py-2 pr-3">
                      {copy.agentColName}
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right">
                      {copy.agentColTotal}
                    </th>
                    <th scope="col" className="py-2 text-right">
                      {copy.agentColConverted}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.agentStats.map((a) => (
                    <tr
                      key={a.agentId}
                      className="border-b border-zinc-100 last:border-0 dark:border-white/5"
                    >
                      <td className="py-2.5 pr-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {a.name}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                        {a.totalLeads}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                        {a.converted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-md dark:border-white/10 dark:bg-zinc-950/60"
        aria-labelledby="recent-heading"
      >
        <h2
          id="recent-heading"
          className="text-base font-semibold text-zinc-950 dark:text-zinc-50"
        >
          {copy.recentTitle}
        </h2>
        {d.recentMessages.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            {copy.recentEmpty}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                  <th scope="col" className="py-2 pr-3">
                    {copy.recentColLead}
                  </th>
                  <th scope="col" className="py-2 pr-3">
                    {copy.recentColMessage}
                  </th>
                  <th scope="col" className="py-2 text-right">
                    {copy.recentColTime}
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.recentMessages.map((m) => {
                  const label =
                    m.leadName?.trim() ||
                    m.leadPhone ||
                    copy.emptyCell;
                  const t = m.createdAt
                    ? formatInboxRelativeTime(
                        new Date(m.createdAt).getTime(),
                        uiLocale,
                      )
                    : copy.emptyCell;
                  const dirLabel =
                    m.direction === "incoming"
                      ? copy.directionIn
                      : copy.directionOut;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-white/5"
                    >
                      <td className="max-w-[200px] py-2.5 pr-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {label}
                        </div>
                        {m.leadPhone ? (
                          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {m.leadPhone}
                          </div>
                        ) : null}
                      </td>
                      <td className="max-w-md py-2.5 pr-3">
                        <span className="line-clamp-2 text-zinc-700 dark:text-zinc-300">
                          {m.message || copy.emptyCell}
                        </span>
                        <span className="sr-only">
                          {`, ${dirLabel}`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-right text-zinc-600 dark:text-zinc-400">
                        {t}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}): React.JSX.Element => {
  return (
    <article
      className={[
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-md dark:border-white/10 dark:bg-zinc-950/60",
        "border-l-4",
        accent,
      ].join(" ")}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
    </article>
  );
};
