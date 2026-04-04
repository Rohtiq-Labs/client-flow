import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteCtx = { params: Promise<{ leadId: string }> };

export const GET = async (
  request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { leadId } = await context.params;
  return proxyToBackend(
    request,
    `leads/${encodeURIComponent(leadId)}/messages`,
    "GET",
  );
};
