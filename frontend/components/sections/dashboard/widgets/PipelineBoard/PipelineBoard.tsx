"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/sections/dashboard/widgets/_ui/Card";
import { useDashboardState } from "@/context/dashboard-state-context";
import {
  DEAL_STAGES,
  type Deal,
  type DealStage,
} from "@/data/dashboard-seed";

const DealCard = ({
  deal,
  onStageChange,
}: {
  deal: Deal;
  onStageChange: (stage: DealStage) => void;
}): React.JSX.Element => {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{deal.title}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-400">
            {deal.company}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {deal.value}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          Owner{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {deal.owner}
          </span>
        </span>
        <span>
          Touch{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {deal.lastTouch}
          </span>
        </span>
      </div>
      <div className="mt-3">
        <label className="sr-only" htmlFor={`deal-stage-${deal.id}`}>
          Stage for {deal.title}
        </label>
        <select
          id={`deal-stage-${deal.id}`}
          value={deal.stage}
          onChange={(e) => onStageChange(e.target.value as DealStage)}
          className="h-9 w-full rounded-lg border border-zinc-200/70 bg-white px-2 text-xs font-semibold text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
        >
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const PipelineBoard = (): React.JSX.Element => {
  const {
    deals,
    moveDeal,
    addDeal,
    showAddDeal,
    setShowAddDeal,
    searchQuery,
  } = useDashboardState();

  const [newTitle, setNewTitle] = useState<string>("");
  const [newCompany, setNewCompany] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("100000");
  const [newStage, setNewStage] = useState<DealStage>("New");

  const visibleDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q),
    );
  }, [deals, searchQuery]);

  const onAddDeal = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    addDeal({
      title: newTitle,
      company: newCompany,
      valuePkr: Number(newValue),
      stage: newStage,
    });
    setNewTitle("");
    setNewCompany("");
    setNewValue("100000");
    setNewStage("New");
  };

  return (
    <Card
      title="Pipeline"
      subtitle="Deals synced with WhatsApp conversations"
      right={
        <button
          type="button"
          onClick={() => setShowAddDeal(!showAddDeal)}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-950"
          aria-expanded={showAddDeal}
        >
          Add deal
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      }
    >
      {showAddDeal ? (
        <form
          onSubmit={onAddDeal}
          className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 sm:grid-cols-2 dark:border-white/10 dark:bg-white/5"
        >
          <p className="text-sm font-semibold sm:col-span-2">New deal</p>
          <div>
            <label className="text-xs font-semibold" htmlFor="deal-title">
              Title
            </label>
            <input
              id="deal-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold" htmlFor="deal-company">
              Company
            </label>
            <input
              id="deal-company"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              required
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold" htmlFor="deal-value">
              Value (PKR)
            </label>
            <input
              id="deal-value"
              type="number"
              min={0}
              step={1000}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold" htmlFor="deal-stage-new">
              Stage
            </label>
            <select
              id="deal-stage-new"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value as DealStage)}
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950/60"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="h-10 flex-1 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950"
            >
              Create deal
            </button>
            <button
              type="button"
              onClick={() => setShowAddDeal(false)}
              className="h-10 flex-1 rounded-xl border border-zinc-200/70 text-sm font-semibold dark:border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = visibleDeals.filter((d) => d.stage === stage);
          return (
            <div
              key={stage}
              className="min-w-[260px] max-w-[260px] flex-1 rounded-2xl border border-zinc-200/70 bg-zinc-50/60 p-3 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{stage}</p>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                  {stageDeals.length}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onStageChange={(s) => moveDeal(deal.id, s)}
                  />
                ))}
                {stageDeals.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200/80 bg-white/60 p-4 text-center text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-950/30 dark:text-zinc-400">
                    No deals in this stage (or hidden by search).
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
