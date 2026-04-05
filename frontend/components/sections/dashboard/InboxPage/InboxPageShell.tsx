"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ChatWindow } from "@/components/sections/dashboard/InboxPage/ChatWindow";
import { ConversationList } from "@/components/sections/dashboard/InboxPage/ConversationList";
import { InboxSidebar } from "@/components/sections/dashboard/InboxPage/InboxSidebar";
import {
  getInboxPageDict,
  type InboxLocale,
} from "@/data/dictionaries/inbox-page";
import type {
  InboxLead,
  InboxMessage,
  LeadListBadge,
  LeadPipelineStatus,
  MessageDeliveryStatus,
} from "@/data/inbox-mock-data";
import {
  fetchCrmLeadMessages,
  fetchCrmLeads,
  patchCrmLeadStatus,
  sendCrmImageMessage,
  sendCrmVoiceMessage,
  sendCrmWhatsAppMessage,
  type CrmApiLead,
  type CrmApiMessage,
} from "@/lib/crm-client";
import { formatInboxRelativeTime } from "@/lib/format-inbox-time";
import { crmSocketAuthPayload } from "@/lib/crm-socket-auth";
import { crmBackendBase } from "@/lib/crm-api-base";
import { leadStatusApiToUi, leadStatusUiToApi } from "@/lib/lead-pipeline";

const inboxLocale: InboxLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

const listBadgeFromStatus = (status: LeadPipelineStatus): LeadListBadge =>
  status;

const ingestLeads = (raw: CrmApiLead[], locale: InboxLocale): InboxLead[] =>
  raw.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    status: l.status as LeadPipelineStatus,
    listBadge: l.listBadge as LeadListBadge,
    lastMessage: l.lastMessage,
    lastActivityAt: l.lastActivityAt,
    unread: l.unread,
    timestampLabel: formatInboxRelativeTime(l.lastActivityAt, locale),
    assignedTo: l.assignedTo
      ? {
          id: l.assignedTo.id,
          name: l.assignedTo.name,
          email: l.assignedTo.email,
        }
      : null,
  }));

const apiMediaToBackendSrc = (
  url: string | null | undefined,
): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${crmBackendBase()}${path}`;
};

const apiDeliveryStatus = (m: CrmApiMessage): MessageDeliveryStatus | null => {
  if (m.direction !== "out") return null;
  const s = m.deliveryStatus;
  if (s === "delivered" || s === "read" || s === "failed") return s;
  return "sent";
};

const ingestMessages = (
  raw: CrmApiMessage[],
  locale: InboxLocale,
): InboxMessage[] =>
  raw.map((m) => ({
    id: m.id,
    leadId: m.leadId,
    message: m.message,
    direction: m.direction,
    createdAt: m.createdAt,
    timestampLabel: formatInboxRelativeTime(m.createdAt, locale),
    messageType: m.messageType,
    hasAudio: Boolean(m.hasAudio),
    audioSrc: apiMediaToBackendSrc(m.audioUrl),
    hasImage: Boolean(m.hasImage),
    imageSrc: apiMediaToBackendSrc(m.imageUrl),
    deliveryStatus: apiDeliveryStatus(m),
  }));

export const InboxPageShell = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const copy = useMemo(() => getInboxPageDict(inboxLocale), []);

  const [leads, setLeads] = useState<InboxLead[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [composerValue, setComposerValue] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const applyLeadsAndSelection = useCallback(
    (next: InboxLead[], preferLeadId: string | null): void => {
      setLeads(next);
      const pick =
        preferLeadId && next.some((l) => l.id === preferLeadId)
          ? preferLeadId
          : next[0]?.id ?? null;
      setSelectedLeadId(pick);
    },
    [],
  );

  const loadInbox = useCallback(async (): Promise<void> => {
    setLoadError(null);
    const raw = await fetchCrmLeads();
    const next = ingestLeads(raw, inboxLocale);
    const fromUrl = searchParams.get("lead");
    applyLeadsAndSelection(next, fromUrl);
  }, [applyLeadsAndSelection, searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPageLoading(true);
      try {
        await loadInbox();
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : copy.loadError,
          );
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [copy.loadError, loadInbox]);

  useEffect(() => {
    const fromUrl = searchParams.get("lead");
    if (!fromUrl || leads.length === 0) return;
    if (!leads.some((l) => l.id === fromUrl)) return;
    setSelectedLeadId(fromUrl);
  }, [searchParams, leads]);

  useEffect(() => {
    if (!selectedLeadId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setThreadLoading(true);
      try {
        const raw = await fetchCrmLeadMessages(selectedLeadId);
        if (!cancelled) {
          setMessages(ingestMessages(raw, inboxLocale));
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setThreadLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedLeadId]);

  const selectedLeadIdRef = useRef<string | null>(null);
  selectedLeadIdRef.current = selectedLeadId;

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

    const onMessage = (payload: { message: CrmApiMessage }): void => {
      const apiMsg = payload.message;
      const isSelected = apiMsg.leadId === selectedLeadIdRef.current;
      const incoming = apiMsg.direction === "in";

      setLeads((prev) => {
        const hasLead = prev.some((l) => l.id === apiMsg.leadId);
        if (!hasLead) {
          return prev;
        }
        const preview = apiMsg.message;
        const next = prev.map((l) =>
          l.id === apiMsg.leadId
            ? {
                ...l,
                lastMessage: preview,
                lastActivityAt: apiMsg.createdAt,
                timestampLabel: formatInboxRelativeTime(
                  apiMsg.createdAt,
                  inboxLocale,
                ),
                unread:
                  incoming && !isSelected
                    ? true
                    : isSelected
                      ? false
                      : l.unread,
              }
            : l,
        );
        return [...next].sort((a, b) => b.lastActivityAt - a.lastActivityAt);
      });

      if (isSelected) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === apiMsg.id)) {
            return prev;
          }
          const row = ingestMessages([apiMsg], inboxLocale)[0];
          return [...prev, row].sort((a, b) => a.createdAt - b.createdAt);
        });
      }
    };

    const onLead = (payload: { lead: CrmApiLead }): void => {
      setLeads((prev) => {
        if (prev.some((l) => l.id === payload.lead.id)) {
          return [...prev].sort((a, b) => b.lastActivityAt - a.lastActivityAt);
        }
        const row = ingestLeads([payload.lead], inboxLocale)[0];
        return [...prev, row].sort((a, b) => b.lastActivityAt - a.lastActivityAt);
      });
    };

    const onConnect = (): void => {
      console.info("[crm-socket] connected");
    };
    const onLeadStatusUpdated = (payload: {
      leadId: string;
      status: string;
    }): void => {
      const ui = leadStatusApiToUi(payload.status);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === payload.leadId
            ? { ...l, status: ui, listBadge: ui }
            : l,
        ),
      );
    };

    const onLeadAssigned = (): void => {
      void loadInbox();
    };

    const onMessageStatus = (payload: {
      messageId: string;
      leadId: string;
      deliveryStatus: string;
    }): void => {
      if (payload.leadId !== selectedLeadIdRef.current) return;
      const next: MessageDeliveryStatus =
        payload.deliveryStatus === "delivered" ||
        payload.deliveryStatus === "read" ||
        payload.deliveryStatus === "failed"
          ? payload.deliveryStatus
          : "sent";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId ? { ...m, deliveryStatus: next } : m,
        ),
      );
    };

    socket.on("connect", onConnect);
    socket.on("crm:message", onMessage);
    socket.on("crm:lead", onLead);
    socket.on("crm:message_status", onMessageStatus);
    socket.on("lead_status_updated", onLeadStatusUpdated);
    socket.on("lead_assigned", onLeadAssigned);
    socket.on("connect_error", (err: Error) => {
      console.warn("[crm-socket]", err.message);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("crm:message", onMessage);
      socket.off("crm:lead", onLead);
      socket.off("crm:message_status", onMessageStatus);
      socket.off("lead_status_updated", onLeadStatusUpdated);
      socket.off("lead_assigned", onLeadAssigned);
      socket.disconnect();
    };
  }, [inboxLocale, loadInbox]);

  const sortedLeads = useMemo(
    () => [...leads].sort((a, b) => b.lastActivityAt - a.lastActivityAt),
    [leads],
  );

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const assignedOwnerLabel = useMemo((): string | null => {
    if (!selectedLead?.assignedTo) {
      return null;
    }
    const n = selectedLead.assignedTo.name?.trim();
    if (n) {
      return n;
    }
    return selectedLead.assignedTo.email?.trim() ?? null;
  }, [selectedLead]);

  const threadMessages = useMemo(
    () =>
      selectedLeadId
        ? messages
            .filter((m) => m.leadId === selectedLeadId)
            .sort((a, b) => a.createdAt - b.createdAt)
        : [],
    [messages, selectedLeadId],
  );

  const selectLead = useCallback((id: string): void => {
    setSelectedLeadId(id);
    setComposerValue("");
    setSendError(null);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, unread: false } : l)),
    );
  }, []);

  const handleStatusChange = useCallback(
    async (status: LeadPipelineStatus): Promise<void> => {
      if (!selectedLeadId) return;
      setStatusUpdating(true);
      try {
        await patchCrmLeadStatus(selectedLeadId, leadStatusUiToApi(status));
        setLeads((prev) =>
          prev.map((l) =>
            l.id === selectedLeadId
              ? {
                  ...l,
                  status,
                  listBadge: listBadgeFromStatus(status),
                }
              : l,
          ),
        );
      } catch {
        try {
          const raw = await fetchCrmLeads();
          setLeads(ingestLeads(raw, inboxLocale));
        } catch {
          /* ignore */
        }
      } finally {
        setStatusUpdating(false);
      }
    },
    [selectedLeadId],
  );

  const sendMessage = useCallback(async (): Promise<void> => {
    if (!selectedLeadId || !selectedLead) return;
    const text = composerValue.trim();
    if (!text) return;
    setSending(true);
    setSendError(null);
    try {
      await sendCrmWhatsAppMessage({
        leadId: selectedLeadId,
        phone: selectedLead.phone,
        message: text,
      });
      setComposerValue("");
      const [rawMsgs, rawLeads] = await Promise.all([
        fetchCrmLeadMessages(selectedLeadId),
        fetchCrmLeads(),
      ]);
      setMessages(ingestMessages(rawMsgs, inboxLocale));
      setLeads(ingestLeads(rawLeads, inboxLocale));
    } catch (e) {
      setSendError(e instanceof Error ? e.message : copy.sendFailed);
    } finally {
      setSending(false);
    }
  }, [composerValue, copy.sendFailed, selectedLead, selectedLeadId]);

  const sendVoiceMessage = useCallback(
    async (blob: Blob, filename: string): Promise<void> => {
      if (!selectedLeadId || !selectedLead) return;
      setSending(true);
      setSendError(null);
      try {
        await sendCrmVoiceMessage({
          leadId: selectedLeadId,
          phone: selectedLead.phone,
          caption: composerValue.trim() || undefined,
          blob,
          filename,
        });
        setComposerValue("");
        const [rawMsgs, rawLeads] = await Promise.all([
          fetchCrmLeadMessages(selectedLeadId),
          fetchCrmLeads(),
        ]);
        setMessages(ingestMessages(rawMsgs, inboxLocale));
        setLeads(ingestLeads(rawLeads, inboxLocale));
      } catch (e) {
        setSendError(e instanceof Error ? e.message : copy.sendFailed);
      } finally {
        setSending(false);
      }
    },
    [
      composerValue,
      copy.sendFailed,
      selectedLead,
      selectedLeadId,
    ],
  );

  const sendImageMessage = useCallback(
    async (blob: Blob, filename: string): Promise<void> => {
      if (!selectedLeadId || !selectedLead) return;
      setSending(true);
      setSendError(null);
      try {
        await sendCrmImageMessage({
          leadId: selectedLeadId,
          phone: selectedLead.phone,
          caption: composerValue.trim() || undefined,
          blob,
          filename,
        });
        setComposerValue("");
        const [rawMsgs, rawLeads] = await Promise.all([
          fetchCrmLeadMessages(selectedLeadId),
          fetchCrmLeads(),
        ]);
        setMessages(ingestMessages(rawMsgs, inboxLocale));
        setLeads(ingestLeads(rawLeads, inboxLocale));
      } catch (e) {
        setSendError(e instanceof Error ? e.message : copy.sendFailed);
      } finally {
        setSending(false);
      }
    },
    [
      composerValue,
      copy.sendFailed,
      selectedLead,
      selectedLeadId,
    ],
  );

  const onRetry = useCallback(async (): Promise<void> => {
    setPageLoading(true);
    try {
      await loadInbox();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : copy.loadError);
    } finally {
      setPageLoading(false);
    }
  }, [copy.loadError, loadInbox]);

  if (pageLoading && leads.length === 0 && !loadError) {
    return (
      <div
        className="flex h-[100dvh] items-center justify-center bg-white text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        {copy.loadingInbox}
      </div>
    );
  }

  if (loadError && leads.length === 0) {
    return (
      <div
        className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-zinc-950"
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
      className="flex h-[100dvh] w-full overflow-hidden bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <InboxSidebar />
      <ConversationList
        leads={sortedLeads}
        selectedLeadId={selectedLeadId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectLead={selectLead}
        copy={copy}
        badgeLabel={(b) => copy.badge[b]}
      />
      <ChatWindow
        lead={selectedLead}
        assignedOwnerLabel={assignedOwnerLabel}
        messages={threadMessages}
        composerValue={composerValue}
        onComposerChange={setComposerValue}
        onSend={sendMessage}
        onSendVoice={(blob, filename) => {
          void sendVoiceMessage(blob, filename);
        }}
        onSendImage={(blob, filename) => {
          void sendImageMessage(blob, filename);
        }}
        onStatusChange={handleStatusChange}
        copy={copy}
        threadLoading={threadLoading}
        sending={sending}
        sendError={sendError}
        statusUpdating={statusUpdating}
      />
    </main>
  );
};
