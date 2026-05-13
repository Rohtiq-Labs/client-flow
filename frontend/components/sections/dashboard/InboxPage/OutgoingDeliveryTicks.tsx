"use client";

import type { MessageDeliveryStatus } from "@/data/inbox-mock-data";

type Labels = {
  sent: string;
  delivered: string;
  read: string;
  failed: string;
};

type OutgoingDeliveryTicksProps = {
  status: MessageDeliveryStatus;
  labels: Labels;
  variant: "outgoing";
};

const checkD = "M4 12.5 8.5 17 20 6";

export const OutgoingDeliveryTicks = ({
  status,
  labels,
  variant,
}: OutgoingDeliveryTicksProps): React.JSX.Element => {
  const readColor =
    variant === "outgoing"
      ? "text-blue-500 dark:text-blue-400"
      : "text-sky-600 dark:text-sky-400";
  const baseColor =
    variant === "outgoing"
      ? "text-white/55 dark:text-zinc-500"
      : "text-zinc-400 dark:text-zinc-500";

  if (status === "failed") {
    return (
      <span
        className="inline-flex items-center text-[11px] font-semibold text-red-400 dark:text-red-600"
        title={labels.failed}
        aria-label={labels.failed}
      >
        !
      </span>
    );
  }

  const isRead = status === "read";
  const tickClass = isRead ? readColor : baseColor;

  const aria =
    status === "read"
      ? labels.read
      : status === "delivered"
        ? labels.delivered
        : labels.sent;

  return (
    <span
      className="inline-flex shrink-0 items-center gap-px"
      title={aria}
      aria-label={aria}
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        className={["size-3.5", tickClass].join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={checkD} />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className={["-ml-2 size-3.5", tickClass].join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={checkD} />
      </svg>
    </span>
  );
};
