import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteCtx = { params: Promise<{ messageId: string }> };

/**
 * GET /api/backend/messages/:messageId/image → Express GET /api/messages/:messageId/image
 */
export const GET = async (
  request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { messageId } = await context.params;
  return proxyToBackend(
    request,
    `messages/${encodeURIComponent(messageId)}/image`,
    "GET",
  );
};
