import { NextRequest, NextResponse } from "next/server";

export const backendBase = (): string =>
  (process.env.CRM_BACKEND_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

const ORG_COOKIE_NAME = "cf_org";

const tenantSlugFromHost = (host: string | null): string => {
  const h = String(host || "").trim().toLowerCase();
  if (!h) return "default";
  const noPort = h.split(":")[0] ?? h;
  if (noPort === "localhost" || noPort === "127.0.0.1") {
    return "default";
  }
  const parts = noPort.split(".").filter(Boolean);
  if (parts.length < 3) {
    // e.g. yourcrm.com (no subdomain) → default
    return "default";
  }
  const slug = parts[0] ?? "default";
  return slug || "default";
};

/**
 * Proxies to Express: `${CRM_BACKEND_URL}/api/${apiPath}`.
 */
export const proxyToBackend = async (
  request: NextRequest,
  apiPath: string,
  method: string,
): Promise<NextResponse> => {
  const target = `${backendBase()}/api/${apiPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const cookieSlug = String(request.cookies.get(ORG_COOKIE_NAME)?.value || "")
    .trim()
    .toLowerCase();
  const orgSlug = cookieSlug || tenantSlugFromHost(request.headers.get("host"));
  headers.set("X-Org-Slug", orgSlug);
  const incomingAuth = request.headers.get("authorization");
  if (incomingAuth) {
    headers.set("Authorization", incomingAuth);
  } else {
    const key = process.env.CRM_API_KEY;
    if (key) {
      headers.set("Authorization", `Bearer ${key}`);
    }
  }

  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("multipart/form-data")) {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > 0) {
        init.body = buf;
        headers.set("Content-Type", ct);
      }
    } else {
      const body = await request.text();
      if (body) {
        init.body = body;
        if (ct) {
          headers.set("Content-Type", ct);
        }
      }
    }
  }

  try {
    const res = await fetch(target, init);
    const buf = await res.arrayBuffer();
    const out = new NextResponse(buf, { status: res.status });
    const ct = res.headers.get("content-type");
    if (ct) {
      out.headers.set("Content-Type", ct);
    }
    const cc = res.headers.get("cache-control");
    if (cc) {
      out.headers.set("Cache-Control", cc);
    }
    const cd = res.headers.get("content-disposition");
    if (cd) {
      out.headers.set("Content-Disposition", cd);
    }
    return out;
  } catch (e) {
    console.error("[backend-proxy]", apiPath, e);
    return NextResponse.json(
      { success: false, error: "Backend unreachable" },
      { status: 502 },
    );
  }
};
