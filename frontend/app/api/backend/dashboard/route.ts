import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * GET /api/backend/dashboard → Express GET /api/dashboard
 */
export const GET = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "dashboard", "GET");
