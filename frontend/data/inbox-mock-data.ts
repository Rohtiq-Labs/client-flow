export type LeadPipelineStatus =
  | "New"
  | "Replied"
  | "Interested"
  | "Converted"
  | "Lost";

export type LeadListBadge = LeadPipelineStatus;

export type InboxLeadAssignedTo = {
  id: string;
  name: string | null;
  email: string | null;
};

export type InboxLead = {
  id: string;
  name: string | null;
  phone: string;
  status: LeadPipelineStatus;
  listBadge: LeadListBadge;
  lastMessage: string;
  timestampLabel: string;
  lastActivityAt: number;
  unread: boolean;
  assignedTo?: InboxLeadAssignedTo | null;
};

export type MessageDirection = "in" | "out";

export type MessageDeliveryStatus = "sent" | "delivered" | "read" | "failed";

export type InboxMessage = {
  id: string;
  leadId: string;
  message: string;
  direction: MessageDirection;
  timestampLabel: string;
  createdAt: number;
  messageType?: "text" | "audio" | "image" | "mixed";
  hasAudio?: boolean;
  /** Browser URL via Next.js proxy to Express GridFS */
  audioSrc?: string | null;
  hasImage?: boolean;
  /** Browser URL via Next.js proxy to Express GridFS */
  imageSrc?: string | null;
  /** Outbound only — Twilio delivery / read receipt */
  deliveryStatus?: MessageDeliveryStatus | null;
};

export const INITIAL_INBOX_LEADS: InboxLead[] = [
  {
    id: "lead-1",
    name: "Ayesha Khan",
    phone: "+92 300 123 4567",
    status: "Interested",
    listBadge: "Interested",
    lastMessage: "Can you share pricing for the Pro plan?",
    timestampLabel: "2:18 PM",
    lastActivityAt: Date.now() - 120_000,
    unread: true,
  },
  {
    id: "lead-2",
    name: null,
    phone: "+92 301 555 0199",
    status: "New",
    listBadge: "New",
    lastMessage: "Hi — we need WhatsApp automation for our clinic.",
    timestampLabel: "1:42 PM",
    lastActivityAt: Date.now() - 2_160_000,
    unread: true,
  },
  {
    id: "lead-3",
    name: "Bilal Ahmed",
    phone: "+92 321 884 1022",
    status: "Replied",
    listBadge: "Replied",
    lastMessage: "Thanks, reviewing the proposal with finance today.",
    timestampLabel: "Yesterday",
    lastActivityAt: Date.now() - 86_400_000,
    unread: false,
  },
  {
    id: "lead-4",
    name: "Hira Noor",
    phone: "+92 334 881 2201",
    status: "Converted",
    listBadge: "Converted",
    lastMessage: "Demo confirmed for Thursday 3pm. See you then.",
    timestampLabel: "Mon",
    lastActivityAt: Date.now() - 400_000_000,
    unread: false,
  },
  {
    id: "lead-5",
    name: "Omar Siddiqui",
    phone: "+92 345 009 7711",
    status: "Interested",
    listBadge: "Interested",
    lastMessage: "Does the API support webhooks for delivery receipts?",
    timestampLabel: "Sun",
    lastActivityAt: Date.now() - 520_000_000,
    unread: false,
  },
  {
    id: "lead-6",
    name: "Fatima Raza",
    phone: "+92 302 441 0098",
    status: "New",
    listBadge: "New",
    lastMessage: "Is there a trial period for teams under 10 seats?",
    timestampLabel: "Fri",
    lastActivityAt: Date.now() - 620_000_000,
    unread: true,
  },
  {
    id: "lead-7",
    name: "Zain Malik",
    phone: "+92 333 772 1100",
    status: "Replied",
    listBadge: "Replied",
    lastMessage: "Looping in our ops lead on this thread.",
    timestampLabel: "Thu",
    lastActivityAt: Date.now() - 700_000_000,
    unread: false,
  },
  {
    id: "lead-8",
    name: null,
    phone: "+92 312 900 4455",
    status: "Interested",
    listBadge: "Interested",
    lastMessage: "We can sign by end of month if terms work.",
    timestampLabel: "Wed",
    lastActivityAt: Date.now() - 780_000_000,
    unread: false,
  },
  {
    id: "lead-9",
    name: "Nadia Hussain",
    phone: "+92 321 118 9033",
    status: "Converted",
    listBadge: "Converted",
    lastMessage: "Payment receipt attached — please confirm.",
    timestampLabel: "Tue",
    lastActivityAt: Date.now() - 900_000_000,
    unread: true,
  },
];

export const INITIAL_INBOX_MESSAGES: InboxMessage[] = [
  {
    id: "m-1",
    leadId: "lead-1",
    message: "Hi Ayesha — thanks for reaching out. Happy to help with Pro pricing.",
    direction: "out",
    timestampLabel: "2:10 PM",
    createdAt: Date.now() - 600_000,
  },
  {
    id: "m-2",
    leadId: "lead-1",
    message: "Great. We are comparing two vendors this week.",
    direction: "in",
    timestampLabel: "2:12 PM",
    createdAt: Date.now() - 480_000,
  },
  {
    id: "m-3",
    leadId: "lead-1",
    message: "Can you share pricing for the Pro plan?",
    direction: "in",
    timestampLabel: "2:18 PM",
    createdAt: Date.now() - 120_000,
  },
  {
    id: "m-4",
    leadId: "lead-2",
    message: "Hi — we need WhatsApp automation for our clinic.",
    direction: "in",
    timestampLabel: "1:42 PM",
    createdAt: Date.now() - 2_160_000,
  },
  {
    id: "m-5",
    leadId: "lead-3",
    message: "Morning Bilal — following up on the onboarding timeline we discussed.",
    direction: "out",
    timestampLabel: "Tue",
    createdAt: Date.now() - 95_000_000,
  },
  {
    id: "m-6",
    leadId: "lead-3",
    message: "Thanks, reviewing the proposal with finance today.",
    direction: "in",
    timestampLabel: "Yesterday",
    createdAt: Date.now() - 86_400_000,
  },
  {
    id: "m-7",
    leadId: "lead-4",
    message: "Locked in — calendar invite sent.",
    direction: "out",
    timestampLabel: "Mon",
    createdAt: Date.now() - 400_000_000,
  },
  {
    id: "m-8",
    leadId: "lead-4",
    message: "Demo confirmed for Thursday 3pm. See you then.",
    direction: "in",
    timestampLabel: "Mon",
    createdAt: Date.now() - 399_000_000,
  },
  {
    id: "m-9",
    leadId: "lead-5",
    message: "Yes — outbound events and read receipts are supported.",
    direction: "out",
    timestampLabel: "Sun",
    createdAt: Date.now() - 519_000_000,
  },
  {
    id: "m-10",
    leadId: "lead-5",
    message: "Does the API support webhooks for delivery receipts?",
    direction: "in",
    timestampLabel: "Sun",
    createdAt: Date.now() - 520_000_000,
  },
  {
    id: "m-11",
    leadId: "lead-6",
    message: "Is there a trial period for teams under 10 seats?",
    direction: "in",
    timestampLabel: "Fri",
    createdAt: Date.now() - 620_000_000,
  },
  {
    id: "m-12",
    leadId: "lead-7",
    message: "Looping in our ops lead on this thread.",
    direction: "in",
    timestampLabel: "Thu",
    createdAt: Date.now() - 700_000_000,
  },
  {
    id: "m-13",
    leadId: "lead-8",
    message: "We can sign by end of month if terms work.",
    direction: "in",
    timestampLabel: "Wed",
    createdAt: Date.now() - 780_000_000,
  },
  {
    id: "m-14",
    leadId: "lead-9",
    message: "Payment receipt attached — please confirm.",
    direction: "in",
    timestampLabel: "Tue",
    createdAt: Date.now() - 900_000_000,
  },
];
