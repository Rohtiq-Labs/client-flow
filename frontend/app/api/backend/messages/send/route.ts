import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * POST /api/backend/messages/send → Express POST /api/messages/send
 */
export const POST = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "messages/send", "POST");
