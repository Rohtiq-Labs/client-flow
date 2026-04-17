const ORG_COOKIE_NAME = "cf_org";

const tenantSlugFromHost = (host: string): string => {
  const h = String(host || "")
    .trim()
    .toLowerCase();
  if (!h) return "default";
  const noPort = h.split(":")[0] ?? h;
  if (noPort === "localhost" || noPort === "127.0.0.1") {
    return "default";
  }
  // On platform domains (e.g. Vercel), the subdomain is not a tenant slug.
  if (noPort.endsWith(".vercel.app")) {
    return "default";
  }
  const parts = noPort.split(".").filter(Boolean);
  if (parts.length < 3) {
    return "default";
  }
  const slug = parts[0] ?? "default";
  return slug || "default";
};

export const getCrmOrgSlug = (): string => {
  if (typeof window === "undefined") {
    return "default";
  }
  const raw = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ORG_COOKIE_NAME}=`));
  if (raw) {
    const v = decodeURIComponent(raw.split("=").slice(1).join("=").trim()).toLowerCase();
    if (v) return v;
  }
  return tenantSlugFromHost(window.location.host);
};
