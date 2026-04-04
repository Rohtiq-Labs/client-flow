"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { InboxLocale } from "@/data/dictionaries/inbox-page";
import {
  getNotificationsBellDict,
  notificationTitleForType,
} from "@/data/dictionaries/notifications-bell";
import {
  fetchCrmNotifications,
  patchCrmNotificationRead,
  patchCrmNotificationsReadAll,
  type CrmNotificationRow,
} from "@/lib/crm-client";
import { crmSocketAuthPayload } from "@/lib/crm-socket-auth";
import { formatInboxRelativeTime } from "@/lib/format-inbox-time";

const uiLocale: InboxLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";

const subtitleFor = (
  n: CrmNotificationRow,
  copy: ReturnType<typeof getNotificationsBellDict>,
): string => {
  if (n.type === "whatsapp_inbound") {
    return (
      n.meta.preview?.trim() ||
      n.meta.phone ||
      n.meta.leadName ||
      ""
    );
  }
  if (n.type === "lead_assigned") {
    const from = n.meta.assignerName
      ? `${copy.fromAssigner} ${n.meta.assignerName}`
      : "";
    return [from, n.meta.phone].filter(Boolean).join(" · ").trim();
  }
  return n.meta.phone || n.meta.leadName || "";
};

export const NotificationsBell = (): React.JSX.Element => {
  const copy = getNotificationsBellDict(uiLocale);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CrmNotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoadError(null);
    try {
      const { notifications, unreadCount: uc } = await fetchCrmNotifications({
        limit: 40,
      });
      setItems(notifications);
      setUnreadCount(uc);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  useEffect(() => {
    void load();
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

    const onNotification = (payload: {
      notification?: CrmNotificationRow;
    }): void => {
      const n = payload.notification;
      if (!n?.id) return;
      setItems((prev) => {
        if (prev.some((x) => x.id === n.id)) {
          return prev;
        }
        return [n, ...prev].slice(0, 50);
      });
      if (n.readAt === null) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("crm:notification", onNotification);
    return () => {
      socket.off("crm:notification", onNotification);
      socket.disconnect();
    };
  }, []);

  const updatePanelPosition = useCallback((): void => {
    const btn = buttonRef.current;
    if (!btn) {
      return;
    }
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const gap = 8;
    const maxW = 320;
    const rightEdge = r.right;
    const width = Math.max(
      1,
      Math.min(maxW, vw - 2 * gap, Math.max(1, rightEdge - gap)),
    );
    let left = rightEdge - width;
    if (left + width > vw - gap) {
      left = vw - gap - width;
    }
    left = Math.max(gap, left);
    setPanelPos({
      top: r.bottom + gap,
      left,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (
        rootRef.current?.contains(t) ||
        panelRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const onOpen = (): void => {
    setOpen((v) => !v);
    void load();
  };

  const onMarkAll = async (): Promise<void> => {
    try {
      await patchCrmNotificationsReadAll();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: Date.now() })));
      setUnreadCount(0);
    } catch {
      void load();
    }
  };

  const onPick = async (n: CrmNotificationRow): Promise<void> => {
    if (!n.readAt) {
      try {
        const updated = await patchCrmNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? updated : x)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        void load();
      }
    }
    setOpen(false);
  };

  const badge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={onOpen}
        className="relative grid size-9 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900"
        aria-label={copy.bellAria}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {badge ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-[1.125rem] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-tight text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open && panelPos ? (
        <div
          ref={panelRef}
          className="fixed z-[300] box-border max-w-[calc(100vw-16px)] rounded-xl border border-zinc-200/90 bg-white py-2 shadow-xl dark:border-white/10 dark:bg-zinc-950"
          style={{
            top: panelPos.top,
            left: panelPos.left,
            width: panelPos.width,
          }}
          role="menu"
          aria-label={copy.title}
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 pb-2 dark:border-white/10">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {copy.title}
            </p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  void onMarkAll();
                }}
                className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {copy.markAllRead}
              </button>
            ) : null}
          </div>

          {loadError ? (
            <p className="px-3 py-4 text-center text-xs text-red-600 dark:text-red-400">
              {loadError}
            </p>
          ) : null}

          <ul className="max-h-[min(60vh,360px)] overflow-y-auto py-1">
            {items.length === 0 && !loadError ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {copy.empty}
              </li>
            ) : null}
            {items.map((n) => {
              const unread = n.readAt === null;
              const href = `/inbox?lead=${encodeURIComponent(n.meta.leadId)}`;
              return (
                <li key={n.id} role="none">
                  <Link
                    href={href}
                    role="menuitem"
                    onClick={() => {
                      void onPick(n);
                    }}
                    className={[
                      "block max-w-full px-3 py-2.5 text-left break-words transition",
                      unread
                        ? "bg-sky-50/80 dark:bg-sky-950/30"
                        : "hover:bg-zinc-50 dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                      {notificationTitleForType(n.type, copy)}
                    </p>
                    {n.meta.leadName ? (
                      <p className="mt-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {n.meta.leadName}
                      </p>
                    ) : null}
                    {subtitleFor(n, copy) ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {subtitleFor(n, copy)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                      {formatInboxRelativeTime(n.createdAt, uiLocale)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
