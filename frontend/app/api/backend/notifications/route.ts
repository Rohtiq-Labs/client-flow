import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * GET /api/backend/notifications → Express GET /api/notifications
 */
export const GET = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "notifications", "GET");
