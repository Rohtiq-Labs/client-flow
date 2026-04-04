import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteCtx = { params: Promise<{ messageId: string }> };

/**
 * GET /api/backend/messages/:messageId/audio → Express (GridFS audio stream).
 */
export const GET = async (
  request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { messageId } = await context.params;
  return proxyToBackend(
    request,
    `messages/${encodeURIComponent(messageId)}/audio`,
    "GET",
  );
};
