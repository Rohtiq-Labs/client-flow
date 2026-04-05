export const crmBackendBase = (): string =>
  (process.env.NEXT_PUBLIC_CRM_BACKEND_URL || "http://127.0.0.1:3001").replace(
    /\/$/,
    "",
  );

export const crmApiPath = (segments: string[]): string =>
  `${crmBackendBase()}/api/${segments.map(encodeURIComponent).join("/")}`;
