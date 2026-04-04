"use client";

import { useAuthenticatedMediaUrl } from "@/lib/use-authenticated-media-url";

type AuthenticatedChatImageProps = {
  src: string;
  alt: string;
  className?: string;
  loadFailedLabel: string;
};

export const AuthenticatedChatImage = ({
  src,
  alt,
  className,
  loadFailedLabel,
}: AuthenticatedChatImageProps): React.JSX.Element => {
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
        className="mb-2 h-40 w-full max-w-md animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-700/40"
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
