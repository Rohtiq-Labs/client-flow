"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OrgBranding = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string | null;
};

type OrgBrandingContextValue = {
  organization: OrgBranding | null;
  ready: boolean;
};

const OrgBrandingContext = createContext<OrgBrandingContextValue | null>(null);

export const useOrgBranding = (): OrgBrandingContextValue => {
  const ctx = useContext(OrgBrandingContext);
  if (!ctx) {
    throw new Error("useOrgBranding must be used within OrgBrandingProvider");
  }
  return ctx;
};

type OrgBrandingProviderProps = {
  children: ReactNode;
};

const applyCssVars = (org: OrgBranding | null): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--brand-name", org?.name ?? "ClientFlow");
  root.style.setProperty("--brand-primary", org?.primaryColor ?? "#16a34a");
  root.style.setProperty("--brand-logo-url", org?.logo ?? "");
};

export const OrgBrandingProvider = ({
  children,
}: OrgBrandingProviderProps): React.JSX.Element => {
  const [organization, setOrganization] = useState<OrgBranding | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/org", { cache: "no-store" });
        const data = (await res.json()) as
          | { success?: boolean; organization?: OrgBranding }
          | null;
        if (!cancelled && data?.success && data.organization) {
          setOrganization(data.organization);
          applyCssVars(data.organization);
        } else if (!cancelled) {
          setOrganization(null);
          applyCssVars(null);
        }
      } catch {
        if (!cancelled) {
          setOrganization(null);
          applyCssVars(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<OrgBrandingContextValue>(
    () => ({ organization, ready }),
    [organization, ready],
  );

  return (
    <OrgBrandingContext.Provider value={value}>
      {children}
    </OrgBrandingContext.Provider>
  );
};

