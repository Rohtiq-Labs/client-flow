import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { tenantSlugFromHost } from "@/lib/tenant-slug-from-host";

const AUTH_COOKIE_NAME = "cf_auth";
const ORG_COOKIE_NAME = "cf_org";

const isAuthed = (req: NextRequest): boolean => {
  return Boolean(req.cookies.get(AUTH_COOKIE_NAME)?.value);
};

export function middleware(req: NextRequest) {
  const authed = isAuthed(req);
  const { pathname } = req.nextUrl;

  const orgSlug = tenantSlugFromHost(req.nextUrl.hostname);

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname === "/inbox" ||
    pathname.startsWith("/inbox/") ||
    pathname === "/leads" ||
    pathname.startsWith("/leads/") ||
    pathname === "/agents" ||
    pathname.startsWith("/agents/") ||
    pathname === "/system" ||
    pathname.startsWith("/system/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  if (isProtected) {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  res.cookies.set(ORG_COOKIE_NAME, orgSlug, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/leads/:path*",
    "/agents/:path*",
    "/system/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/setup",
  ],
};

