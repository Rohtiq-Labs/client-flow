export type DashboardHomeLocale = "en" | "ur";

export type DashboardHomeCopy = {
  pageTitle: string;
  pageSubtitle: string;
  loadError: string;
  retry: string;
  loading: string;
  statTotalLeads: string;
  statNewToday: string;
  statActiveConversations: string;
  statConverted: string;
  pipelineTitle: string;
  pipelineNew: string;
  pipelineReplied: string;
  pipelineInterested: string;
  pipelineConverted: string;
  pipelineLost: string;
  agentTitle: string;
  agentColName: string;
  agentColTotal: string;
  agentColConverted: string;
  agentEmpty: string;
  recentTitle: string;
  recentEmpty: string;
  recentColLead: string;
  recentColMessage: string;
  recentColTime: string;
  directionIn: string;
  directionOut: string;
  emptyCell: string;
};

const en: DashboardHomeCopy = {
  pageTitle: "Overview",
  pageSubtitle: "Key metrics for your workspace",
  loadError: "Could not load dashboard. Try again.",
  retry: "Retry",
  loading: "Loading metrics…",
  statTotalLeads: "Total leads",
  statNewToday: "New today",
  statActiveConversations: "Active conversations",
  statConverted: "Converted leads",
  pipelineTitle: "Pipeline",
  pipelineNew: "New",
  pipelineReplied: "Replied",
  pipelineInterested: "Interested",
  pipelineConverted: "Converted",
  pipelineLost: "Lost",
  agentTitle: "Agent performance",
  agentColName: "Agent",
  agentColTotal: "Total leads",
  agentColConverted: "Converted",
  agentEmpty: "No assigned leads yet.",
  recentTitle: "Recent messages",
  recentEmpty: "No messages yet.",
  recentColLead: "Lead",
  recentColMessage: "Message",
  recentColTime: "Time",
  directionIn: "In",
  directionOut: "Out",
  emptyCell: "—",
};

const ur: DashboardHomeCopy = {
  pageTitle: "جائزہ",
  pageSubtitle: "آپ کے ورک اسپیس کے اہم میٹرکس",
  loadError: "ڈیش بورڈ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
  retry: "دوبارہ کوشش",
  loading: "میٹرکس لوڈ ہو رہے ہیں…",
  statTotalLeads: "کل لیڈز",
  statNewToday: "آج نئے",
  statActiveConversations: "فعال گفتگو",
  statConverted: "تبدیل شدہ لیڈز",
  pipelineTitle: "پائپ لائن",
  pipelineNew: "نیا",
  pipelineReplied: "جواب دیا",
  pipelineInterested: "دلچسپی",
  pipelineConverted: "تبدیل",
  pipelineLost: "ضائع",
  agentTitle: "ایجنٹ کارکردگی",
  agentColName: "ایجنٹ",
  agentColTotal: "کل لیڈز",
  agentColConverted: "تبدیل",
  agentEmpty: "ابھی کوئی تفویض شدہ لیڈ نہیں۔",
  recentTitle: "حالیہ پیغامات",
  recentEmpty: "ابھی کوئی پیغام نہیں۔",
  recentColLead: "لیڈ",
  recentColMessage: "پیغام",
  recentColTime: "وقت",
  directionIn: "ان",
  directionOut: "آؤٹ",
  emptyCell: "—",
};

const byLocale: Record<DashboardHomeLocale, DashboardHomeCopy> = { en, ur };

export const getDashboardHomeDict = (
  locale: DashboardHomeLocale,
): DashboardHomeCopy => byLocale[locale] ?? en;
