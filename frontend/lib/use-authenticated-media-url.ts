"use client";

import { useEffect, useState } from "react";
import { crmRequestHeaders } from "@/lib/crm-auth-token";

type State = {
  url: string | null;
  loading: boolean;
  error: boolean;
};

/**
 * Fetches a same-origin CRM media URL with the JWT so img/audio can display
 * bytes (plain src= does not send Authorization).
 */
export const useAuthenticatedMediaUrl = (
  src: string | null | undefined,
): State => {
  const [state, setState] = useState<State>({
    url: null,
    loading: Boolean(src),
    error: false,
  });

  useEffect(() => {
    if (!src) {
      setState({ url: null, loading: false, error: false });
      return;
    }

    const ac = new AbortController();
    const urlRef: { current: string | null } = { current: null };

    setState({ url: null, loading: true, error: false });

    const run = async (): Promise<void> => {
      try {
        const res = await fetch(src, {
          signal: ac.signal,
          credentials: "omit",
          headers: {
            ...crmRequestHeaders(),
          },
        });
        if (!res.ok) {
          throw new Error(String(res.status));
        }
        const blob = await res.blob();
        if (ac.signal.aborted) {
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        if (ac.signal.aborted) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        urlRef.current = objectUrl;
        setState({ url: objectUrl, loading: false, error: false });
      } catch {
        if (ac.signal.aborted) {
          return;
        }
        setState({ url: null, loading: false, error: true });
      }
    };

    void run();

    return () => {
      ac.abort();
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [src]);

  return state;
};
