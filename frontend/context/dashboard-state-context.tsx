"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Activity,
  ActivityType,
  Conversation,
  Deal,
  DealStage,
  InboxFilter,
  TaskItem,
  TaskPriority,
} from "@/data/dashboard-seed";
import {
  DEAL_STAGES,
  initialActivities,
  initialConversations,
  initialDeals,
  initialTasks,
} from "@/data/dashboard-seed";

const createId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const formatPkr = (n: number): string => {
  if (n >= 1_000_000) return `₨ ${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1000) return `₨ ${Math.round(n / 1000)}k`;
  return `₨ ${n}`;
};

const relativeTimeLabel = (): string => "Just now";

type DashboardStateContextValue = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;

  inboxFilter: InboxFilter;
  setInboxFilter: (f: InboxFilter) => void;
  filterMenuOpen: boolean;
  setFilterMenuOpen: (open: boolean) => void;

  conversations: Conversation[];
  selectedConversationId: string | null;
  selectConversation: (id: string) => void;
  filteredConversations: Conversation[];
  selectedConversation: Conversation | undefined;

  composerDraft: string;
  setComposerDraft: (v: string) => void;
  appendComposerTemplate: (snippet: string) => void;
  sendComposerMessage: () => void;

  tasks: TaskItem[];
  toggleTaskDone: (id: string) => void;
  addTask: (input: {
    title: string;
    relatedTo: string;
    due: string;
    priority: TaskPriority;
  }) => void;
  showAddTask: boolean;
  setShowAddTask: (v: boolean) => void;

  deals: Deal[];
  moveDeal: (dealId: string, stage: DealStage) => void;
  addDeal: (input: {
    title: string;
    company: string;
    valuePkr: number;
    stage: DealStage;
  }) => void;
  showAddDeal: boolean;
  setShowAddDeal: (v: boolean) => void;

  activities: Activity[];
  startNewConversation: () => void;

  sidebarStats: { newCount: number; dueCount: number; wonCount: number };
  kpiMetrics: {
    unreadThreads: number;
    openTasks: number;
    openDeals: number;
    revenueAtRiskPkr: number;
  };
};

const DashboardStateContext = createContext<DashboardStateContextValue | null>(
  null,
);

export const useDashboardState = (): DashboardStateContextValue => {
  const ctx = useContext(DashboardStateContext);
  if (!ctx) {
    throw new Error("useDashboardState must be used within DashboardStateProvider");
  }
  return ctx;
};

type DashboardStateProviderProps = {
  children: ReactNode;
};

export const DashboardStateProvider = ({
  children,
}: DashboardStateProviderProps): React.JSX.Element => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    ...initialConversations,
  ]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(() => initialConversations[0]?.id ?? null);
  const [composerDraft, setComposerDraft] = useState<string>("");
  const [tasks, setTasks] = useState<TaskItem[]>(() => [...initialTasks]);
  const [deals, setDeals] = useState<Deal[]>(() => [...initialDeals]);
  const [activities, setActivities] = useState<Activity[]>(() => [
    ...initialActivities,
  ]);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [showAddDeal, setShowAddDeal] = useState<boolean>(false);

  const pushActivity = useCallback(
    (input: { type: ActivityType; title: string; detail: string }) => {
      const createdAt = Date.now();
      const next: Activity = {
        id: createId("act"),
        type: input.type,
        title: input.title,
        detail: input.detail,
        time: relativeTimeLabel(),
        createdAt,
      };
      setActivities((prev) => [next, ...prev].slice(0, 50));
    },
    [],
  );

  const selectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }, []);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((c) => {
      if (inboxFilter === "unread" && c.unread === 0) return false;
      if (
        inboxFilter !== "all" &&
        inboxFilter !== "unread" &&
        c.stage !== inboxFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [conversations, inboxFilter, searchQuery]);

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  const appendComposerTemplate = useCallback((snippet: string) => {
    setComposerDraft((prev) => {
      const next = prev.trim().length ? `${prev.trim()}\n${snippet}` : snippet;
      return next;
    });
  }, []);

  const sendComposerMessage = useCallback(() => {
    const text = composerDraft.trim();
    if (!text || !selectedConversationId) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? {
              ...c,
              lastMessage: text,
              time: "now",
              unread: 0,
              lastTouchLabel: "Just now",
            }
          : c,
      ),
    );
    const conv = conversations.find((c) => c.id === selectedConversationId);
    pushActivity({
      type: "message",
      title: "Message sent",
      detail: conv
        ? `To ${conv.name}: ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`
        : text.slice(0, 80),
    });
    setComposerDraft("");
  }, [composerDraft, conversations, pushActivity, selectedConversationId]);

  const toggleTaskDone = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const nextDone = !t.done;
          if (nextDone) {
            pushActivity({
              type: "task",
              title: "Task completed",
              detail: t.title,
            });
          }
          return { ...t, done: nextDone };
        }),
      );
    },
    [pushActivity],
  );

  const addTask = useCallback(
    (input: {
      title: string;
      relatedTo: string;
      due: string;
      priority: TaskPriority;
    }) => {
      const title = input.title.trim();
      if (!title) return;
      const item: TaskItem = {
        id: createId("task"),
        title,
        relatedTo: input.relatedTo.trim() || "Unassigned",
        due: input.due.trim() || "Today",
        priority: input.priority,
        done: false,
      };
      setTasks((prev) => [item, ...prev]);
      pushActivity({
        type: "task",
        title: "Task created",
        detail: `${title} (${item.relatedTo})`,
      });
      setShowAddTask(false);
    },
    [pushActivity],
  );

  const moveDeal = useCallback(
    (dealId: string, stage: DealStage) => {
      let movedTitle = "";
      setDeals((prev) => {
        const deal = prev.find((d) => d.id === dealId);
        if (!deal || deal.stage === stage) return prev;
        movedTitle = deal.title;
        return prev.map((d) =>
          d.id === dealId ? { ...d, stage, lastTouch: "now" } : d,
        );
      });
      if (movedTitle) {
        pushActivity({
          type: "deal",
          title: "Deal stage updated",
          detail: `${movedTitle} → ${stage}`,
        });
      }
    },
    [pushActivity],
  );

  const addDeal = useCallback(
    (input: {
      title: string;
      company: string;
      valuePkr: number;
      stage: DealStage;
    }) => {
      const title = input.title.trim();
      const company = input.company.trim();
      if (!title || !company || !Number.isFinite(input.valuePkr)) return;
      const deal: Deal = {
        id: createId("deal"),
        title,
        company,
        owner: "You",
        value: formatPkr(input.valuePkr),
        valuePkr: Math.max(0, Math.round(input.valuePkr)),
        lastTouch: "now",
        stage: input.stage,
      };
      setDeals((prev) => [deal, ...prev]);
      pushActivity({
        type: "deal",
        title: "Deal created",
        detail: `${title} — ${company}`,
      });
      setShowAddDeal(false);
    },
    [pushActivity],
  );

  const startNewConversation = useCallback(() => {
    const id = createId("c");
    const conv: Conversation = {
      id,
      name: "New contact",
      phone: "+92 —",
      lastMessage: "Draft a first message below.",
      time: "now",
      unread: 0,
      stage: "New",
      dealValue: "—",
      owner: "You",
      lastTouchLabel: "Just now",
      tags: ["New"],
    };
    setConversations((prev) => [conv, ...prev]);
    setSelectedConversationId(id);
    pushActivity({
      type: "note",
      title: "New conversation",
      detail: "Started a new WhatsApp thread (local only until backend sync).",
    });
    setComposerDraft("");
  }, [pushActivity]);

  const sidebarStats = useMemo(() => {
    const newCount = conversations.filter((c) => c.unread > 0).length;
    const dueCount = tasks.filter((t) => !t.done).length;
    const wonCount = deals.filter((d) => d.stage === "Won").length;
    return { newCount, dueCount, wonCount };
  }, [conversations, deals, tasks]);

  const kpiMetrics = useMemo(() => {
    const unreadThreads = conversations.filter((c) => c.unread > 0).length;
    const openTasks = tasks.filter((t) => !t.done).length;
    const openDeals = deals.filter((d) => d.stage !== "Won").length;
    const revenueAtRiskPkr = deals
      .filter((d) => d.stage === "Proposal" || d.stage === "Negotiation")
      .reduce((sum, d) => sum + d.valuePkr, 0);
    return {
      unreadThreads,
      openTasks,
      openDeals,
      revenueAtRiskPkr,
    };
  }, [conversations, deals, tasks]);

  const value = useMemo<DashboardStateContextValue>(
    () => ({
      searchQuery,
      setSearchQuery,
      searchInputRef,
      inboxFilter,
      setInboxFilter,
      filterMenuOpen,
      setFilterMenuOpen,
      conversations,
      selectedConversationId,
      selectConversation,
      filteredConversations,
      selectedConversation,
      composerDraft,
      setComposerDraft,
      appendComposerTemplate,
      sendComposerMessage,
      tasks,
      toggleTaskDone,
      addTask,
      showAddTask,
      setShowAddTask,
      deals,
      moveDeal,
      addDeal,
      showAddDeal,
      setShowAddDeal,
      activities,
      startNewConversation,
      sidebarStats,
      kpiMetrics,
    }),
    [
      searchQuery,
      inboxFilter,
      filterMenuOpen,
      conversations,
      selectedConversationId,
      selectConversation,
      filteredConversations,
      selectedConversation,
      composerDraft,
      appendComposerTemplate,
      sendComposerMessage,
      tasks,
      toggleTaskDone,
      addTask,
      showAddTask,
      deals,
      moveDeal,
      addDeal,
      showAddDeal,
      activities,
      startNewConversation,
      sidebarStats,
      kpiMetrics,
    ],
  );

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  );
};
