import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * PATCH /api/backend/notifications/read-all → Express PATCH /api/notifications/read-all
 */
export const PATCH = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "notifications/read-all", "PATCH");
