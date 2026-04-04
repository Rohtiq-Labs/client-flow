"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCrmAuthToken } from "@/lib/crm-auth-token";
import { getCrmUser } from "@/lib/crm-auth-user";
import { clearCrmSession, persistCrmSession } from "@/lib/crm-auth-session";
import type { CrmAuthUser } from "@/lib/crm-client";

type CrmAuthContextValue = {
  user: CrmAuthUser | null;
  ready: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  login: (
    token: string,
    user: CrmAuthUser,
    organizationSlug?: string | null,
  ) => void;
  logout: () => void;
};

const CrmAuthContext = createContext<CrmAuthContextValue | null>(null);

export const useCrmAuth = (): CrmAuthContextValue => {
  const ctx = useContext(CrmAuthContext);
  if (!ctx) {
    throw new Error("useCrmAuth must be used within CrmAuthProvider");
  }
  return ctx;
};

type CrmAuthProviderProps = {
  children: ReactNode;
};

export const CrmAuthProvider = ({
  children,
}: CrmAuthProviderProps): React.JSX.Element => {
  const [user, setUser] = useState<CrmAuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getCrmAuthToken();
    const u = getCrmUser();
    if (t && u) {
      setUser(u);
    } else if (!t || !u) {
      clearCrmSession();
      setUser(null);
    }
    setReady(true);
  }, []);

  const login = useCallback(
    (token: string, nextUser: CrmAuthUser, organizationSlug?: string | null) => {
      persistCrmSession(token, nextUser, organizationSlug);
      setUser(nextUser);
    },
    [],
  );

  const logout = useCallback(() => {
    clearCrmSession();
    setUser(null);
  }, []);

  const value = useMemo<CrmAuthContextValue>(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isAgent: user?.role === "agent",
      login,
      logout,
    }),
    [user, ready, login, logout],
  );

  return (
    <CrmAuthContext.Provider value={value}>{children}</CrmAuthContext.Provider>
  );
};
