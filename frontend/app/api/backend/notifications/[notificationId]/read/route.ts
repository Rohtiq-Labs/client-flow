import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteCtx = { params: Promise<{ notificationId: string }> };

/**
 * PATCH /api/backend/notifications/:id/read → Express PATCH /api/notifications/:id/read
 */
export const PATCH = async (
  request: NextRequest,
  context: RouteCtx,
): Promise<Response> => {
  const { notificationId } = await context.params;
  return proxyToBackend(
    request,
    `notifications/${encodeURIComponent(notificationId)}/read`,
    "PATCH",
  );
};
