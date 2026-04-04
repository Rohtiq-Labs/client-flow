"use client";

import { AuthenticatedChatAudio } from "@/components/sections/dashboard/InboxPage/AuthenticatedChatAudio";
import { AuthenticatedChatImage } from "@/components/sections/dashboard/InboxPage/AuthenticatedChatImage";
import { OutgoingDeliveryTicks } from "@/components/sections/dashboard/InboxPage/OutgoingDeliveryTicks";
import type { InboxMessage } from "@/data/inbox-mock-data";

const PHOTO_PLACEHOLDER = "[Photo]";

type DeliveryLabels = {
  sent: string;
  delivered: string;
  read: string;
  failed: string;
};

type MessageBubbleProps = {
  message: InboxMessage;
  audioPlaybackAria: string;
  imageAlt: string;
  mediaLoadFailedLabel: string;
  deliveryLabels: DeliveryLabels;
};

export const MessageBubble = ({
  message,
  audioPlaybackAria,
  imageAlt,
  mediaLoadFailedLabel,
  deliveryLabels,
}: MessageBubbleProps): React.JSX.Element => {
  const isOutgoing = message.direction === "out";
  const showAudio = Boolean(message.hasAudio && message.audioSrc);
  const showImage = Boolean(message.hasImage && message.imageSrc);
  const showCaption =
    Boolean(message.message) &&
    !(showImage && message.message.trim() === PHOTO_PLACEHOLDER);

  return (
    <div
      className={[
        "flex w-full",
        isOutgoing ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[min(72ch,85%)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
          isOutgoing
            ? "rounded-br-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "rounded-bl-md border border-zinc-200/80 bg-zinc-50 text-zinc-900 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-50",
        ].join(" ")}
      >
        {showImage && message.imageSrc ? (
          <AuthenticatedChatImage
            src={message.imageSrc}
            alt={imageAlt}
            className="mb-2 max-h-64 w-full max-w-md rounded-lg object-contain"
            loadFailedLabel={mediaLoadFailedLabel}
          />
        ) : null}
        {showAudio && message.audioSrc ? (
          <AuthenticatedChatAudio
            src={message.audioSrc}
            className="mb-2 w-full min-w-[220px] max-w-md"
            ariaLabel={audioPlaybackAria}
            loadFailedLabel={mediaLoadFailedLabel}
          />
        ) : null}
        {showCaption ? (
          <p className="whitespace-pre-wrap break-words">{message.message}</p>
        ) : null}
        <div
          className={[
            "mt-1.5 flex items-end gap-1.5",
            isOutgoing ? "justify-end" : "justify-start",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] font-medium tabular-nums",
              isOutgoing
                ? "text-white/70 dark:text-zinc-600"
                : "text-zinc-500 dark:text-zinc-400",
            ].join(" ")}
          >
            {message.timestampLabel}
          </p>
          {isOutgoing && message.deliveryStatus ? (
            <OutgoingDeliveryTicks
              status={message.deliveryStatus}
              labels={deliveryLabels}
              variant="outgoing"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
