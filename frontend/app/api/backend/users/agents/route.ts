import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const POST = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "users/agents", "POST");
