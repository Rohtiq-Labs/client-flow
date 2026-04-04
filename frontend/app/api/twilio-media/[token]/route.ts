import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend-proxy";

type RouteCtx = { params: Promise<{ token: string }> };

const forwardHeaders = (
  from: Response,
  to: NextResponse,
  keys: readonly string[],
): void => {
  for (const k of keys) {
    const v = from.headers.get(k);
    if (v) {
      to.headers.set(k, v);
    }
  }
};

/**
 * Public proxy: Twilio fetches outbound voice here when PUBLIC_BASE_URL is your Next.js origin.
 * Twilio sends HEAD then GET — both must reach Express.
 */
export const HEAD = async (
  _request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { token } = await context.params;
  const target = `${backendBase()}/api/twilio-media/${encodeURIComponent(token)}`;

  try {
    const res = await fetch(target, { method: "HEAD", cache: "no-store" });
    const out = new NextResponse(null, { status: res.status });
    forwardHeaders(res, out, [
      "content-type",
      "content-length",
      "cache-control",
    ]);
    return out;
  } catch (e) {
    console.error("[twilio-media proxy HEAD]", e);
    return new NextResponse(null, { status: 502 });
  }
};

export const GET = async (
  _request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { token } = await context.params;
  const target = `${backendBase()}/api/twilio-media/${encodeURIComponent(token)}`;

  try {
    const res = await fetch(target, { method: "GET", cache: "no-store" });
    const buf = await res.arrayBuffer();
    const out = new NextResponse(buf, { status: res.status });
    forwardHeaders(res, out, [
      "content-type",
      "content-length",
      "cache-control",
    ]);
    return out;
  } catch (e) {
    console.error("[twilio-media proxy GET]", e);
    return NextResponse.json(
      { success: false, error: "Backend unreachable" },
      { status: 502 },
    );
  }
};
