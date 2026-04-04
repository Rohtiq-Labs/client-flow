import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * POST /api/backend/messages/send-image → Express POST /api/messages/send-image (multipart)
 */
export const POST = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "messages/send-image", "POST");
