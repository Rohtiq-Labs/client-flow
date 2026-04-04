import { getCrmAuthToken } from "@/lib/crm-auth-token";

/**
 * Socket.io `auth` for CRM: optional shared key + JWT for user-targeted events (notifications).
 */
export const crmSocketAuthPayload = (): {
  token?: string;
  jwt?: string;
} => {
  const socketKey = process.env.NEXT_PUBLIC_CRM_SOCKET_KEY?.trim();
  const jwt = getCrmAuthToken();
  const out: { token?: string; jwt?: string } = {};
  if (socketKey) {
    out.token = socketKey;
  }
  if (jwt) {
    out.jwt = jwt;
  }
  return out;
};
