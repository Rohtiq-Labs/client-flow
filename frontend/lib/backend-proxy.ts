import dns from "node:dns";
import { NextRequest, NextResponse } from "next/server";

import { isPaaSPreviewHost, tenantSlugFromHost } from "@/lib/tenant-slug-from-host";

dns.setDefaultResultOrder("ipv4first");

const DEFAULT_BACKEND = "http://127.0.0.1:3001";

export const backendBase = (): string => {
  const raw = process.env.CRM_BACKEND_URL?.trim();
  const base = (raw && raw.length > 0 ? raw : DEFAULT_BACKEND).replace(/\/$/, "");
  return base;
};

const isLocalFallbackBase = (base: string): boolean =>
  base.startsWith("http://127.0.0.1") || base.startsWith("http://localhost");

const ORG_COOKIE_NAME = "cf_org";

/**
 * Proxies to Express: `${CRM_BACKEND_URL}/api/${apiPath}`.
 */
export const proxyToBackend = async (
  request: NextRequest,
  apiPath: string,
  method: string,
): Promise<NextResponse> => {
  const base = backendBase();
  const target = `${base}/api/${apiPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const host = request.headers.get("host");
  const cookieSlug = String(request.cookies.get(ORG_COOKIE_NAME)?.value || "")
    .trim()
    .toLowerCase();
  const fromHost = tenantSlugFromHost(host);
  const orgSlug =
    isPaaSPreviewHost(host) ? fromHost : cookieSlug || fromHost;
  headers.set("X-Org-Slug", orgSlug);
  const incomingAuth = request.headers.get("authorization");
  if (incomingAuth) {
    headers.set("Authorization", incomingAuth);
  } else {
    const key = process.env.CRM_API_KEY?.trim();
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
    console.error("[backend-proxy]", apiPath, { base, target, err: e });
    const onVercel = Boolean(process.env.VERCEL);
    const hint =
      onVercel && isLocalFallbackBase(base)
        ? "CRM_BACKEND_URL is missing for this deployment environment. In Vercel: set it for Production and Preview, then redeploy."
        : undefined;
    return NextResponse.json(
      { success: false, error: "Backend unreachable", ...(hint ? { hint } : {}) },
      { status: 502 },
    );
  }
};
