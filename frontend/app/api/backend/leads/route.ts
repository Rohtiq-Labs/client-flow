import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * GET /api/backend/leads → Express GET /api/leads
 */
export const GET = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "leads", "GET");
