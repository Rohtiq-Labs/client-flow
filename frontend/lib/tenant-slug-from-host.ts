/**
 * Maps Host header to CRM org slug (X-Org-Slug). PaaS preview URLs are not customer
 * subdomains — using their first label breaks login against org "default".
 */
export const tenantSlugFromHost = (host: string | null): string => {
  const h = String(host || "").trim().toLowerCase();
  const noPort = h.split(":")[0] ?? h;
  if (!noPort || noPort === "localhost" || noPort === "127.0.0.1") {
    return "default";
  }
  if (noPort.endsWith(".vercel.app") || noPort.endsWith(".netlify.app")) {
    return "default";
  }
  const parts = noPort.split(".").filter(Boolean);
  if (parts.length < 3) {
    return "default";
  }
  const slug = parts[0] ?? "default";
  return slug || "default";
};

export const isPaaSPreviewHost = (host: string | null): boolean => {
  const noPort = (host || "").split(":")[0]?.trim().toLowerCase() ?? "";
  return noPort.endsWith(".vercel.app") || noPort.endsWith(".netlify.app");
};
