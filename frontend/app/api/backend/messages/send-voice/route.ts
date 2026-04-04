import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * POST /api/backend/messages/send-voice → Express POST /api/messages/send-voice (multipart)
 */
export const POST = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "messages/send-voice", "POST");
