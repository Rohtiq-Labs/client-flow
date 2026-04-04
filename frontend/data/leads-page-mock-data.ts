import type { LeadPipelineStatus } from "@/data/inbox-mock-data";

export type CrmLeadAssignedTo = {
  id: string;
  name: string | null;
  email: string | null;
};

export type CrmLeadListRow = {
  id: string;
  name: string | null;
  phone: string;
  status: LeadPipelineStatus;
  lastMessage: string;
  lastContacted: string;
  unreadMessagesCount: number;
  lastActivityAt: number;
  assignedTo: CrmLeadAssignedTo | null;
};

export type LeadStatusFilter = LeadPipelineStatus | "all";

export type LeadScopeFilter = "all" | "mine" | "unassigned";
