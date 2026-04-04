import { Suspense } from "react";
import { InboxPageShell } from "@/components/sections/dashboard/InboxPage/InboxPageShell";
import {
  getInboxPageDict,
  type InboxLocale,
} from "@/data/dictionaries/inbox-page";

const inboxLocale: InboxLocale =
  process.env.NEXT_PUBLIC_UI_LOCALE === "ur" ? "ur" : "en";
const inboxFallbackCopy = getInboxPageDict(inboxLocale);

const InboxFallback = (): React.JSX.Element => (
  <div
    className="flex h-[100dvh] items-center justify-center bg-white text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400"
    role="status"
    aria-live="polite"
  >
    {inboxFallbackCopy.loadingInbox}
  </div>
);

export default function InboxPage(): React.JSX.Element {
  return (
    <Suspense fallback={<InboxFallback />}>
      <InboxPageShell />
    </Suspense>
  );
}

