const STORAGE_KEY = "crm_jwt";

export const getCrmAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setCrmAuthToken = (token: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
};

export const crmAuthHeaders = (): Record<string, string> => {
  const t = getCrmAuthToken();
  if (!t) {
    return {};
  }
  return { Authorization: `Bearer ${t}` };
};

export const crmRequestHeaders = (): Record<string, string> => ({
  ...crmAuthHeaders(),
});
