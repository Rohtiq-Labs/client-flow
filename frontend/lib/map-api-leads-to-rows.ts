import type { InboxLocale } from "@/data/dictionaries/inbox-page";
import type { LeadPipelineStatus } from "@/data/inbox-mock-data";
import type { CrmLeadListRow } from "@/data/leads-page-mock-data";
import type { CrmApiLead } from "@/lib/crm-client";
import { formatInboxRelativeTime } from "@/lib/format-inbox-time";

export const mapApiLeadsToRows = (
  api: CrmApiLead[],
  locale: InboxLocale,
): CrmLeadListRow[] =>
  api.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    status: l.status as LeadPipelineStatus,
    lastMessage: l.lastMessage ?? "",
    lastContacted: formatInboxRelativeTime(l.lastActivityAt, locale),
    unreadMessagesCount: l.unread ? 1 : 0,
    lastActivityAt: l.lastActivityAt,
    assignedTo: l.assignedTo
      ? {
          id: l.assignedTo.id,
          name: l.assignedTo.name,
          email: l.assignedTo.email,
        }
      : null,
  }));
