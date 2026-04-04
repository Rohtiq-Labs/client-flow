"use client";

import { useAuthenticatedMediaUrl } from "@/lib/use-authenticated-media-url";

type AuthenticatedChatAudioProps = {
  src: string;
  ariaLabel: string;
  className?: string;
  loadFailedLabel: string;
};

export const AuthenticatedChatAudio = ({
  src,
  ariaLabel,
  className,
  loadFailedLabel,
}: AuthenticatedChatAudioProps): React.JSX.Element => {
  const { url, loading, error } = useAuthenticatedMediaUrl(src);

  if (error) {
    return (
      <p className="mb-2 text-xs text-red-600 dark:text-red-400" role="alert">
        {loadFailedLabel}
      </p>
    );
  }

  if (loading || !url) {
    return (
      <div
        className="mb-2 h-10 w-full min-w-[220px] max-w-md animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-700/40"
        aria-hidden="true"
      />
    );
  }

  return (
    <audio
      controls
      className={className}
      src={url}
      preload="metadata"
      aria-label={ariaLabel}
    />
  );
};
