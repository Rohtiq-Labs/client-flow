"use client";

import { useEffect, useRef } from "react";
import { ChatInput } from "@/components/sections/dashboard/InboxPage/ChatInput";
import { MessageBubble } from "@/components/sections/dashboard/InboxPage/MessageBubble";
import { StatusDropdown } from "@/components/sections/dashboard/InboxPage/StatusDropdown";
import type { InboxPageCopy } from "@/data/dictionaries/inbox-page";
import type { InboxLead, InboxMessage, LeadPipelineStatus } from "@/data/inbox-mock-data";

type ChatWindowProps = {
  lead: InboxLead | null;
  assignedOwnerLabel: string | null;
  messages: InboxMessage[];
  composerValue: string;
  onComposerChange: (v: string) => void;
  onSend: () => void | Promise<void>;
  onSendVoice?: (blob: Blob, filename: string) => void | Promise<void>;
  onSendImage?: (blob: Blob, filename: string) => void | Promise<void>;
  onStatusChange: (status: LeadPipelineStatus) => void | Promise<void>;
  copy: InboxPageCopy;
  threadLoading: boolean;
  sending: boolean;
  sendError: string | null;
  statusUpdating: boolean;
  navigationMenuSlot?: React.ReactNode;
  onBackToConversationList?: () => void;
};

const leadTitle = (lead: InboxLead): string =>
  lead.name?.trim() || lead.phone;

export const ChatWindow = ({
  lead,
  assignedOwnerLabel,
  messages,
  composerValue,
  onComposerChange,
  onSend,
  onSendVoice,
  onSendImage,
  onStatusChange,
  copy,
  threadLoading,
  sending,
  sendError,
  statusUpdating,
  navigationMenuSlot,
  onBackToConversationList,
}: ChatWindowProps): React.JSX.Element => {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lead?.id, messages.length]);

  if (!lead) {
    return (
      <section
        className="flex min-w-0 flex-1 flex-col bg-zinc-50/50 dark:bg-zinc-950"
        aria-label="Chat"
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="rounded-2xl border border-dashed border-zinc-200/90 bg-white/60 px-8 py-10 shadow-sm dark:border-white/10 dark:bg-zinc-900/30">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {copy.chatEmptyTitle}
            </p>
            <p className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-500">
              {copy.chatEmptyHint}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50/40 dark:bg-zinc-950"
      aria-label={`Chat with ${leadTitle(lead)}`}
    >
      <header className="flex shrink-0 flex-wrap items-start gap-2 border-b border-zinc-200/80 bg-white px-3 py-3 sm:gap-3 sm:px-5 sm:py-3.5 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
          {navigationMenuSlot ? (
            <div className="shrink-0 lg:hidden">{navigationMenuSlot}</div>
          ) : null}
          {onBackToConversationList ? (
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-800 shadow-sm outline-none transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-emerald-500 lg:hidden dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              aria-label={copy.backToConversationList}
              onClick={onBackToConversationList}
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {leadTitle(lead)}
            </h2>
            {lead.name ? (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {lead.phone}
              </p>
            ) : null}
            <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                {copy.assignedTo}
              </span>
              {": "}
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/90 bg-sky-50 px-2 py-0.5 font-semibold text-sky-900 dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-100">
                {assignedOwnerLabel ?? copy.assignedToUnassigned}
              </span>
            </p>
          </div>
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
          <span
            className="hidden items-center gap-1.5 rounded-full border border-zinc-200/90 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 sm:inline-flex dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300"
            title={copy.aiActive}
          >
            <span
              className="size-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            {copy.aiActive}
          </span>
          <StatusDropdown
            value={lead.status}
            onChange={onStatusChange}
            disabled={statusUpdating || threadLoading}
            statusLabel={(s) => copy.status[s]}
            listLabel={copy.leadStatusListLabel}
          />
        </div>
      </header>

      <div
        ref={threadRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={threadLoading}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {threadLoading ? (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              {copy.threadLoading}
            </p>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                audioPlaybackAria={copy.audioPlaybackAria}
                imageAlt={copy.imageAttachmentAlt}
                mediaLoadFailedLabel={copy.mediaLoadFailed}
                deliveryLabels={{
                  sent: copy.statusSentAria,
                  delivered: copy.statusDeliveredAria,
                  read: copy.statusReadAria,
                  failed: copy.statusFailedAria,
                }}
              />
            ))
          )}
          <div ref={scrollAnchorRef} aria-hidden="true" />
        </div>
      </div>

      <div className="shrink-0">
        {sendError ? (
          <p
            className="border-t border-red-200/80 bg-red-50 px-4 py-2 text-center text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {sendError}
          </p>
        ) : null}
        <ChatInput
          value={composerValue}
          onChange={onComposerChange}
          onSend={() => {
            void onSend();
          }}
          onSendVoice={onSendVoice}
          onSendImage={onSendImage}
          voiceUi={{
            recordAria: copy.voiceRecordAria,
            stopSendAria: copy.voiceStopSendAria,
            attachAria: copy.voiceAttachAria,
            recordingLabel: copy.voiceRecordingLabel,
          }}
          imageUi={{
            sendImageAria: copy.sendImageAria,
          }}
          placeholder={
            sending ? copy.sending : copy.composerPlaceholder
          }
          disabled={sending || threadLoading}
        />
      </div>
    </section>
  );
};
