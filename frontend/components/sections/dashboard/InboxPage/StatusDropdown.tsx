"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { LeadPipelineStatus } from "@/data/inbox-mock-data";

const STATUS_OPTIONS: LeadPipelineStatus[] = [
  "New",
  "Replied",
  "Interested",
  "Converted",
  "Lost",
];

type StatusDropdownProps = {
  value: LeadPipelineStatus;
  onChange: (status: LeadPipelineStatus) => void;
  disabled?: boolean;
  /** Localized option + button text */
  statusLabel: (status: LeadPipelineStatus) => string;
  listLabel: string;
};

export const StatusDropdown = ({
  value,
  onChange,
  disabled = false,
  statusLabel,
  listLabel,
}: StatusDropdownProps): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex h-9 min-w-[140px] items-center justify-between gap-2 rounded-xl border border-zinc-200/90 bg-white px-3 text-left text-sm font-medium text-zinc-900 shadow-sm outline-none transition",
          "hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-900/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-white/20 dark:focus-visible:ring-white/10",
        ].join(" ")}
      >
        <span>{statusLabel(value)}</span>
        <svg
          viewBox="0 0 24 24"
          className={[
            "size-4 shrink-0 text-zinc-500 transition dark:text-zinc-400",
            open ? "rotate-180" : "",
          ].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={listLabel}
          className="absolute right-0 z-40 mt-1.5 min-w-full overflow-hidden rounded-xl border border-zinc-200/90 bg-white py-1 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/40"
        >
          {STATUS_OPTIONS.map((opt) => {
            const selected = opt === value;
            return (
              <li key={opt} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt);
                    close();
                  }}
                  className={[
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm outline-none transition",
                    selected
                      ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-white/10 dark:text-white"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5",
                  ].join(" ")}
                >
                  {statusLabel(opt)}
                  {selected ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 text-zinc-900 dark:text-zinc-100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
