import type { CrmAuthUser } from "@/lib/crm-client";

const STORAGE_KEY = "crm_user";

export const getCrmUser = (): CrmAuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "id" in parsed &&
      "email" in parsed &&
      "role" in parsed
    ) {
      return parsed as CrmAuthUser;
    }
    return null;
  } catch {
    return null;
  }
};

export const setCrmUser = (user: CrmAuthUser | null): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
};
