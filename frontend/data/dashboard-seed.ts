export type ConversationStage = "New" | "Qualified" | "Proposal" | "Won";

export type Conversation = {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  stage: ConversationStage;
  dealValue: string;
  owner: string;
  lastTouchLabel: string;
  tags: string[];
};

export type DealStage =
  | "New"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won";

export type Deal = {
  id: string;
  title: string;
  company: string;
  owner: string;
  value: string;
  valuePkr: number;
  lastTouch: string;
  stage: DealStage;
  conversationId?: string;
};

export type TaskPriority = "Low" | "Medium" | "High";

export type TaskItem = {
  id: string;
  title: string;
  due: string;
  priority: TaskPriority;
  relatedTo: string;
  done: boolean;
};

export type ActivityType = "message" | "deal" | "task" | "note";

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  time: string;
  createdAt: number;
};

export type InboxFilter = "all" | "unread" | ConversationStage;

export const DEAL_STAGES: DealStage[] = [
  "New",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
];

export const initialConversations: Conversation[] = [
  {
    id: "c1",
    name: "Ayesha Khan",
    phone: "+92 300 123 4567",
    lastMessage: "Can you share pricing for the Pro plan?",
    time: "2m",
    unread: 2,
    stage: "Qualified",
    dealValue: "₨ 120k",
    owner: "You",
    lastTouchLabel: "2 minutes ago",
    tags: ["Pricing", "Demo", "Enterprise"],
  },
  {
    id: "c2",
    name: "Bilal Ahmed",
    phone: "+92 301 555 0199",
    lastMessage: "We need integration with our Google Sheet.",
    time: "18m",
    unread: 0,
    stage: "Proposal",
    dealValue: "₨ 95k",
    owner: "Sara",
    lastTouchLabel: "18 minutes ago",
    tags: ["Integration", "Sheets"],
  },
  {
    id: "c3",
    name: "Hira Noor",
    phone: "+92 334 881 2201",
    lastMessage: "Please confirm onboarding timeline.",
    time: "1h",
    unread: 3,
    stage: "New",
    dealValue: "—",
    owner: "You",
    lastTouchLabel: "1 hour ago",
    tags: ["Onboarding"],
  },
  {
    id: "c4",
    name: "Umair Raza",
    phone: "+92 345 900 7712",
    lastMessage: "Sent the invoice. Waiting for approval.",
    time: "3h",
    unread: 0,
    stage: "Won",
    dealValue: "₨ 60k",
    owner: "You",
    lastTouchLabel: "3 hours ago",
    tags: ["Invoice", "Won"],
  },
];

export const initialDeals: Deal[] = [
  {
    id: "d1",
    title: "ClientFlow Pro (3 seats)",
    company: "Khan Traders",
    owner: "You",
    value: "₨ 120k",
    valuePkr: 120_000,
    lastTouch: "2m",
    stage: "Qualified",
    conversationId: "c1",
  },
  {
    id: "d2",
    title: "WhatsApp automation setup",
    company: "Noor Boutique",
    owner: "Sara",
    value: "₨ 80k",
    valuePkr: 80_000,
    lastTouch: "1h",
    stage: "New",
  },
  {
    id: "d3",
    title: "Team inbox + CRM migration",
    company: "Ahmad & Co",
    owner: "You",
    value: "₨ 240k",
    valuePkr: 240_000,
    lastTouch: "18m",
    stage: "Proposal",
  },
  {
    id: "d4",
    title: "Enterprise annual plan",
    company: "Raza Logistics",
    owner: "Hassan",
    value: "₨ 1.2m",
    valuePkr: 1_200_000,
    lastTouch: "3d",
    stage: "Negotiation",
  },
  {
    id: "d5",
    title: "Onboarding + training",
    company: "Umair Studio",
    owner: "You",
    value: "₨ 60k",
    valuePkr: 60_000,
    lastTouch: "Today",
    stage: "Won",
    conversationId: "c4",
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Reply with Pro plan pricing + voice note",
    due: "In 30m",
    priority: "High",
    relatedTo: "Ayesha Khan",
    done: false,
  },
  {
    id: "t2",
    title: "Schedule demo call and confirm agenda",
    due: "Today",
    priority: "Medium",
    relatedTo: "Bilal Ahmed",
    done: false,
  },
  {
    id: "t3",
    title: "Send onboarding checklist PDF",
    due: "Today",
    priority: "Low",
    relatedTo: "Hira Noor",
    done: true,
  },
  {
    id: "t4",
    title: "Follow up on invoice approval",
    due: "EOD",
    priority: "Medium",
    relatedTo: "Umair Raza",
    done: false,
  },
];

const now = Date.now();

export const initialActivities: Activity[] = [
  {
    id: "a1",
    type: "message",
    title: "Incoming message",
    detail: "Ayesha asked for Pro plan pricing",
    time: "2m ago",
    createdAt: now - 120_000,
  },
  {
    id: "a2",
    type: "deal",
    title: "Deal moved to Proposal",
    detail: "Ahmad & Co — Team inbox + CRM migration",
    time: "18m ago",
    createdAt: now - 1_080_000,
  },
  {
    id: "a3",
    type: "task",
    title: "Task created",
    detail: "Follow up on invoice approval (Umair Studio)",
    time: "1h ago",
    createdAt: now - 3_600_000,
  },
  {
    id: "a4",
    type: "note",
    title: "Note added",
    detail: "Customer prefers voice notes and quick WhatsApp calls",
    time: "Today",
    createdAt: now - 8_640_000,
  },
];
