import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const GET = async (request: NextRequest): Promise<Response> =>
  proxyToBackend(request, "org", "GET");

