"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { InboxSidebar } from "@/components/sections/dashboard/InboxPage/InboxSidebar";
import { LeadsHeader } from "@/components/sections/dashboard/LeadsPage/LeadsHeader";
import { LeadsList } from "@/components/sections/dashboard/LeadsPage/LeadsList";
import { useCrmAuth } from "@/context/crm-auth-context";
import type { InboxLocale } from "@/data/dictionaries/inbox-page";
import { getLeadsPageDict } from "@/data/dictionaries/leads-page";
import {
  type CrmLeadListRow,
  type LeadScopeFilter,
  type LeadStatusFilter,
} from "@/data/leads-page-mock-data";
import {
  fetchCrmAgents,
  fetchCrmLeads,
  patchCrmLeadAssign,
} from "@/lib/crm-client";
import { crmSocketAuthPayload } from "@/lib/crm-socket-auth";
import { mapApiLeadsToRows } from "@/lib/map-api-leads-to-rows";

const PAGE_SIZE = 5;

const uiLocale: InboxLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

const getLeadsQuery = (
  scope: LeadScopeFilter,
  isAdmin: boolean,
): Record<string, string> | undefined => {
  if (!isAdmin) {
    return undefined;
  }
  if (scope === "mine") {
    return { assignedTo: "me" };
  }
  if (scope === "unassigned") {
    return { assignedTo: "none" };
  }
  return undefined;
};

const filterLeads = (
  leads: CrmLeadListRow[],
  q: string,
  status: LeadStatusFilter,
): CrmLeadListRow[] => {
  const needle = q.trim().toLowerCase();
  return leads.filter((l) => {
    if (status !== "all" && l.status !== status) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const name = (l.name ?? "").toLowerCase();
    const phone = l.phone.toLowerCase().replace(/\s/g, "");
    const owner = (l.assignedTo?.name ?? l.assignedTo?.email ?? "").toLowerCase();
    const n = needle.replace(/\s/g, "");
    return (
      name.includes(needle) ||
      phone.includes(n) ||
      owner.includes(needle)
    );
  });
};

export const LeadsPageShell = (): React.JSX.Element => {
  const copy = useMemo(() => getLeadsPageDict(uiLocale), []);
  const { isAdmin, ready: authReady } = useCrmAuth();

  const [rows, setRows] = useState<CrmLeadListRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<LeadScopeFilter>("all");
  const [page, setPage] = useState(1);

  const [agents, setAgents] = useState<{ id: string; name: string; email: string }[]>(
    [],
  );
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);

  const showScopeFilter = isAdmin;
  const showAssign = isAdmin;

  const loadLeads = useCallback(async (): Promise<void> => {
    setLoadError(null);
    const q = getLeadsQuery(scopeFilter, isAdmin);
    const api = await fetchCrmLeads(q);
    setRows(mapApiLeadsToRows(api, uiLocale));
  }, [isAdmin, scopeFilter]);

  const loadAgents = useCallback(async (): Promise<void> => {
    if (!isAdmin) {
      setAgents([]);
      return;
    }
    try {
      const list = await fetchCrmAgents();
      setAgents(
        list.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        })),
      );
    } catch {
      setAgents([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    void loadAgents();
  }, [authReady, loadAgents]);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    let cancelled = false;
    (async () => {
      setPageLoading(true);
      try {
        await loadLeads();
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : copy.loadError);
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, copy.loadError, loadLeads]);

  const base = process.env.NEXT_PUBLIC_CRM_SOCKET_URL?.trim() ?? "";
  useEffect(() => {
    if (!base || !authReady) {
      return;
    }
    const socket: Socket = io(base.replace(/\/$/, ""), {
      path: "/socket.io",
      auth: crmSocketAuthPayload(),
      transports: ["websocket", "polling"],
    });

    const onAssigned = (): void => {
      void loadLeads();
    };

    socket.on("lead_assigned", onAssigned);
    return () => {
      socket.off("lead_assigned", onAssigned);
      socket.disconnect();
    };
  }, [authReady, base, loadLeads]);

  const onAssign = useCallback(
    async (leadId: string, agentId: string | null): Promise<void> => {
      setAssigningLeadId(leadId);
      try {
        await patchCrmLeadAssign(leadId, agentId);
        await loadLeads();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : copy.loadError);
      } finally {
        setAssigningLeadId(null);
      }
    },
    [copy.loadError, loadLeads],
  );

  const filtered = useMemo(
    () => filterLeads(rows, searchQuery, statusFilter),
    [rows, searchQuery, statusFilter],
  );

  const totalCount = filtered.length;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const safePage = Math.min(page, pageCount);
  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const onSearchChange = useCallback((q: string): void => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const onStatusFilterChange = useCallback((f: LeadStatusFilter): void => {
    setStatusFilter(f);
    setPage(1);
  }, []);

  const onScopeFilterChange = useCallback((f: LeadScopeFilter): void => {
    setScopeFilter(f);
    setPage(1);
  }, []);

  const onPageChange = useCallback((p: number): void => {
    setPage(p);
  }, []);

  const onAddLead = useCallback((): void => {
    // UI-only placeholder for future create flow
  }, []);

  const emptyTitle =
    rows.length > 0 && totalCount === 0
      ? copy.emptyFilteredTitle
      : copy.emptyNoDataTitle;

  const emptyDescription =
    rows.length > 0 && totalCount === 0
      ? copy.emptyFilteredHint
      : copy.emptyNoDataHint;

  const onRetry = useCallback(async (): Promise<void> => {
    setPageLoading(true);
    try {
      await loadLeads();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : copy.loadError);
    } finally {
      setPageLoading(false);
    }
  }, [copy.loadError, loadLeads]);

  if (!authReady) {
    return (
      <div
        className="flex h-[100dvh] items-center justify-center bg-zinc-50/90 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        {copy.loading}
      </div>
    );
  }

  if (pageLoading && rows.length === 0 && !loadError) {
    return (
      <div
        className="flex h-[100dvh] items-center justify-center bg-zinc-50/90 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        {copy.loading}
      </div>
    );
  }

  if (loadError && rows.length === 0) {
    return (
      <div
        className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-50/90 px-6 text-center dark:bg-zinc-950"
        role="alert"
      >
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-300">
          {copy.loadError}
        </p>
        <p className="max-w-md text-xs text-zinc-500">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            void onRetry();
          }}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {copy.retry}
        </button>
      </div>
    );
  }

  return (
    <main
      id="main"
      className="flex h-[100dvh] w-full overflow-hidden bg-zinc-50/90 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <InboxSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50/50 dark:bg-zinc-950">
        <LeadsHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          scopeFilter={scopeFilter}
          onScopeFilterChange={onScopeFilterChange}
          showScopeFilter={showScopeFilter}
          onAddLead={onAddLead}
          copy={copy}
        />
        <LeadsList
          leads={pageSlice}
          page={safePage}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={onPageChange}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          copy={copy}
          showAssign={showAssign}
          agents={agents}
          assigningLeadId={assigningLeadId}
          onAssign={onAssign}
        />
      </div>
    </main>
  );
};
