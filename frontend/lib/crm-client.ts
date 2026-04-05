import { crmApiPath } from "@/lib/crm-api-base";
import {
  crmRequestHeaders,
  setCrmAuthToken,
} from "@/lib/crm-auth-token";
import { getCrmOrgSlug } from "@/lib/crm-org-slug";

export type CrmApiAssignedTo = {
  id: string;
  name: string | null;
  email: string | null;
};

export type CrmApiLead = {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  listBadge: string;
  lastMessage: string;
  timestampLabel: string;
  lastActivityAt: number;
  unread: boolean;
  assignedTo?: CrmApiAssignedTo | null;
};

export type CrmMessageDeliveryStatus =
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type CrmApiMessage = {
  id: string;
  leadId: string;
  message: string;
  direction: "in" | "out";
  timestampLabel: string;
  createdAt: number;
  messageType?: "text" | "audio" | "image" | "mixed";
  hasAudio?: boolean;
  audioUrl?: string | null;
  hasImage?: boolean;
  imageUrl?: string | null;
  senderId?: string | null;
  deliveryStatus?: CrmMessageDeliveryStatus | null;
};

export type CrmAuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const parseJson = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const crmFetch = async (
  segments: string[],
  init?: RequestInit,
): Promise<unknown> => {
  const res = await fetch(crmApiPath(segments), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...crmRequestHeaders(),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const text = await res.text();
  const data = parseJson(text) as { success?: boolean; error?: string } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  return data;
};

export const fetchCrmLeads = async (
  query?: Record<string, string>,
): Promise<CrmApiLead[]> => {
  const qs =
    query && Object.keys(query).length > 0
      ? `?${new URLSearchParams(query).toString()}`
      : "";
  const res = await fetch(`${crmApiPath(["leads"])}${qs}`, {
    method: "GET",
    headers: {
      ...crmRequestHeaders(),
    },
    cache: "no-store",
  });
  const text = await res.text();
  const data = parseJson(text) as {
    success?: boolean;
    leads?: CrmApiLead[];
    error?: string;
  } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  if (!data?.success || !Array.isArray(data.leads)) {
    throw new Error("Invalid leads response");
  }
  return data.leads;
};

export const fetchCrmLeadMessages = async (
  leadId: string,
): Promise<CrmApiMessage[]> => {
  const data = (await crmFetch(["leads", leadId, "messages"])) as {
    success?: boolean;
    messages?: CrmApiMessage[];
  };
  if (!data?.success || !Array.isArray(data.messages)) {
    throw new Error("Invalid messages response");
  }
  return data.messages;
};

export const patchCrmLeadStatus = async (
  leadId: string,
  status: string,
): Promise<void> => {
  const data = (await crmFetch(["leads", leadId, "status"], {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })) as { success?: boolean; error?: string };
  if (!data?.success) {
    throw new Error(data?.error ?? "Update failed");
  }
};

export const patchCrmLeadAssign = async (
  leadId: string,
  agentId: string | null,
): Promise<void> => {
  const data = (await crmFetch(["leads", leadId, "assign"], {
    method: "PATCH",
    body: JSON.stringify({ agentId }),
  })) as { success?: boolean; error?: string };
  if (!data?.success) {
    throw new Error(data?.error ?? "Assign failed");
  }
};

export type CrmDashboardPipeline = {
  new: number;
  replied: number;
  interested: number;
  converted: number;
  lost: number;
};

export type CrmDashboardRecentMessage = {
  id: string;
  leadId: string;
  leadName: string | null;
  leadPhone: string;
  message: string;
  direction: string;
  createdAt: string | null;
};

export type CrmDashboardAgentStat = {
  agentId: string;
  name: string;
  email: string | null;
  totalLeads: number;
  converted: number;
};

export type CrmDashboardData = {
  totalLeads: number;
  newLeadsToday: number;
  activeConversations: number;
  pipeline: CrmDashboardPipeline;
  recentMessages: CrmDashboardRecentMessage[];
  agentStats: CrmDashboardAgentStat[];
};

export const fetchCrmDashboard = async (): Promise<CrmDashboardData> => {
  const data = (await crmFetch(["dashboard"])) as {
    success?: boolean;
    error?: string;
  } & Partial<CrmDashboardData>;
  if (!data?.success || typeof data.totalLeads !== "number") {
    throw new Error(data?.error ?? "Invalid dashboard response");
  }
  return {
    totalLeads: data.totalLeads,
    newLeadsToday: data.newLeadsToday ?? 0,
    activeConversations: data.activeConversations ?? 0,
    pipeline: data.pipeline ?? {
      new: 0,
      replied: 0,
      interested: 0,
      converted: 0,
      lost: 0,
    },
    recentMessages: Array.isArray(data.recentMessages)
      ? data.recentMessages
      : [],
    agentStats: Array.isArray(data.agentStats) ? data.agentStats : [],
  };
};

export type CrmOrganizationInfo = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string | null;
};

export const fetchCrmOrganizationInfo = async (): Promise<CrmOrganizationInfo> => {
  const res = await fetch(crmApiPath(["org"]), {
    headers: {
      ...crmRequestHeaders(),
    },
    cache: "no-store",
  });
  const text = await res.text();
  const data = parseJson(text) as {
    success?: boolean;
    organization?: CrmOrganizationInfo;
    error?: string;
  } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  if (!data?.success || !data.organization?.id) {
    throw new Error(data?.error ?? "Invalid organization response");
  }
  return data.organization;
};

export const fetchCrmAgents = async (): Promise<
  { id: string; name: string; email: string; role: string }[]
> => {
  const data = (await crmFetch(["users"])) as {
    success?: boolean;
    users?: { id: string; name: string; email: string; role: string }[];
  };
  if (!data?.success || !Array.isArray(data.users)) {
    throw new Error("Invalid users response");
  }
  return data.users;
};

export const createCrmAgent = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string; email: string; role: string }> => {
  const data = (await crmFetch(["users", "agents"], {
    method: "POST",
    body: JSON.stringify(input),
  })) as {
    success?: boolean;
    user?: { id: string; name: string; email: string; role: string };
    error?: string;
  };
  if (!data?.success || !data.user) {
    throw new Error(data?.error ?? "Failed to create agent");
  }
  return data.user;
};

export type CrmLoginOrganization = {
  id: string;
  name: string;
  slug: string;
};

export const loginCrm = async (input: {
  email: string;
  password: string;
}): Promise<{
  token: string;
  user: CrmAuthUser;
  organization?: CrmLoginOrganization;
}> => {
  const res = await fetch(crmApiPath(["auth", "login"]), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Org-Slug": getCrmOrgSlug(),
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  const text = await res.text();
  const data = parseJson(text) as {
    success?: boolean;
    token?: string;
    user?: CrmAuthUser;
    organization?: CrmLoginOrganization;
    error?: string;
  } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  if (!data?.success || !data.token || !data.user) {
    throw new Error(data?.error ?? "Login failed");
  }
  setCrmAuthToken(data.token);
  return {
    token: data.token,
    user: data.user,
    organization: data.organization,
  };
};

export const signupCrm = async (input: {
  companyName?: string;
  name: string;
  email: string;
  password: string;
}): Promise<{
  token: string;
  user: CrmAuthUser;
  organization?: { id: string; name: string; slug: string };
}> => {
  const data = (await crmFetch(["auth", "signup"], {
    method: "POST",
    body: JSON.stringify(input),
  })) as {
    success?: boolean;
    token?: string;
    user?: CrmAuthUser;
    organization?: { id: string; name: string; slug: string };
    error?: string;
  };
  if (!data?.success || !data.token || !data.user) {
    throw new Error(data?.error ?? "Signup failed");
  }
  setCrmAuthToken(data.token);
  return {
    token: data.token,
    user: data.user,
    organization: data.organization,
  };
};

export const patchCrmOrganization = async (input: {
  name?: string;
  logo?: string;
  primaryColor?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioWhatsAppNumber?: string;
}): Promise<void> => {
  const data = (await crmFetch(["org"], {
    method: "PATCH",
    body: JSON.stringify(input),
  })) as { success?: boolean; error?: string };
  if (!data?.success) {
    throw new Error(data?.error ?? "Update failed");
  }
};

export const sendCrmWhatsAppMessage = async (input: {
  leadId: string;
  phone: string;
  message: string;
}): Promise<{ messageSid: string }> => {
  const data = (await crmFetch(["messages", "send"], {
    method: "POST",
    body: JSON.stringify(input),
  })) as {
    success?: boolean;
    messageSid?: string;
    error?: string;
  };
  if (!data?.success || !data.messageSid) {
    throw new Error(data?.error ?? "Send failed");
  }
  return { messageSid: data.messageSid };
};

export const sendCrmVoiceMessage = async (input: {
  leadId: string;
  phone: string;
  caption?: string;
  blob: Blob;
  filename?: string;
}): Promise<{ messageSid: string }> => {
  const form = new FormData();
  form.append("leadId", input.leadId);
  form.append("phone", input.phone);
  if (input.caption?.trim()) {
    form.append("caption", input.caption.trim());
  }
  form.append("audio", input.blob, input.filename ?? "voice.webm");

  const res = await fetch(crmApiPath(["messages", "send-voice"]), {
    method: "POST",
    body: form,
    headers: {
      ...crmRequestHeaders(),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const data = parseJson(text) as {
    success?: boolean;
    messageSid?: string;
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  if (!data?.success || !data.messageSid) {
    throw new Error(data?.error ?? "Send failed");
  }
  return { messageSid: data.messageSid };
};

export const sendCrmImageMessage = async (input: {
  leadId: string;
  phone: string;
  caption?: string;
  blob: Blob;
  filename?: string;
}): Promise<{ messageSid: string }> => {
  const form = new FormData();
  form.append("leadId", input.leadId);
  form.append("phone", input.phone);
  if (input.caption?.trim()) {
    form.append("caption", input.caption.trim());
  }
  form.append("image", input.blob, input.filename ?? "photo.jpg");

  const res = await fetch(crmApiPath(["messages", "send-image"]), {
    method: "POST",
    body: form,
    headers: {
      ...crmRequestHeaders(),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const data = parseJson(text) as {
    success?: boolean;
    messageSid?: string;
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  if (!data?.success || !data.messageSid) {
    throw new Error(data?.error ?? "Send failed");
  }
  return { messageSid: data.messageSid };
};

export type CrmNotificationType =
  | "whatsapp_inbound"
  | "lead_created"
  | "lead_assigned";

export type CrmNotificationMeta = {
  leadId: string;
  messageId?: string;
  preview?: string;
  leadName?: string;
  phone?: string;
  assigneeName?: string;
  assignerName?: string;
};

export type CrmNotificationRow = {
  id: string;
  type: CrmNotificationType;
  readAt: number | null;
  createdAt: number;
  meta: CrmNotificationMeta;
};

export const fetchCrmNotifications = async (query?: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{ notifications: CrmNotificationRow[]; unreadCount: number }> => {
  const params = new URLSearchParams();
  if (query?.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  if (query?.unreadOnly) {
    params.set("unreadOnly", "true");
  }
  const qs = params.toString();
  const res = await fetch(
    `${crmApiPath(["notifications"])}${qs ? `?${qs}` : ""}`,
    {
      method: "GET",
      headers: { ...crmRequestHeaders() },
      cache: "no-store",
    },
  );
  const text = await res.text();
  const data = parseJson(text) as {
    success?: boolean;
    notifications?: CrmNotificationRow[];
    unreadCount?: number;
    error?: string;
  } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText ?? "Request failed");
  }
  if (!data?.success || !Array.isArray(data.notifications)) {
    throw new Error(data?.error ?? "Invalid notifications response");
  }
  return {
    notifications: data.notifications,
    unreadCount: data.unreadCount ?? 0,
  };
};

export const patchCrmNotificationRead = async (
  notificationId: string,
): Promise<CrmNotificationRow> => {
  const data = (await crmFetch(
    ["notifications", notificationId, "read"],
    { method: "PATCH" },
  )) as {
    success?: boolean;
    notification?: CrmNotificationRow;
    error?: string;
  };
  if (!data?.success || !data.notification) {
    throw new Error(data?.error ?? "Update failed");
  }
  return data.notification;
};

export const patchCrmNotificationsReadAll = async (): Promise<number> => {
  const data = (await crmFetch(["notifications", "read-all"], {
    method: "PATCH",
  })) as { success?: boolean; modifiedCount?: number; error?: string };
  if (!data?.success) {
    throw new Error(data?.error ?? "Update failed");
  }
  return data.modifiedCount ?? 0;
};

export const logoutCrm = (): void => {
  setCrmAuthToken(null);
};
