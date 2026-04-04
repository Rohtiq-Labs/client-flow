import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteCtx = { params: Promise<{ leadId: string }> };

/**
 * PATCH /api/backend/leads/:leadId/status → Express PATCH /api/leads/:leadId/status
 */
export const PATCH = async (
  request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { leadId } = await context.params;
  return proxyToBackend(
    request,
    `leads/${encodeURIComponent(leadId)}/status`,
    "PATCH",
  );
};
