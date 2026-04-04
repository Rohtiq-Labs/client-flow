import { setCrmAuthToken } from "@/lib/crm-auth-token";
import { setCrmUser } from "@/lib/crm-auth-user";
import type { CrmAuthUser } from "@/lib/crm-client";

const AUTH_COOKIE_NAME = "cf_auth";
const ORG_COOKIE_NAME = "cf_org";

const maxAgeSeconds = 7 * 24 * 60 * 60;

const setAuthCookie = (): void => {
  document.cookie = `${AUTH_COOKIE_NAME}=1; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

const setOrgSlugCookie = (slug: string): void => {
  const s = slug.trim().toLowerCase();
  if (!s) {
    return;
  }
  document.cookie = `${ORG_COOKIE_NAME}=${encodeURIComponent(s)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

export const clearAuthCookie = (): void => {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const clearOrgCookie = (): void => {
  document.cookie = `${ORG_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const persistCrmSession = (
  token: string,
  user: CrmAuthUser,
  organizationSlug?: string | null,
): void => {
  setCrmAuthToken(token);
  setCrmUser(user);
  setAuthCookie();
  if (organizationSlug) {
    setOrgSlugCookie(organizationSlug);
  }
};

export const clearCrmSession = (): void => {
  setCrmAuthToken(null);
  setCrmUser(null);
  clearAuthCookie();
  clearOrgCookie();
};
