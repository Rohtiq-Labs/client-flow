export type DashboardNavLocale = "en" | "ur";

export type DashboardNavCopy = {
  overview: string;
  overviewSubtitle: string;
  inbox: string;
  leads: string;
  agents: string;
  settings: string;
  system: string;
};

const en: DashboardNavCopy = {
  overview: "Overview",
  overviewSubtitle: "Key metrics for your workspace",
  inbox: "Inbox",
  leads: "Leads",
  agents: "Agents",
  settings: "Settings",
  system: "System",
};

const ur: DashboardNavCopy = {
  overview: "جائزہ",
  overviewSubtitle: "آپ کے ورک اسپیس کے اہم میٹرکس",
  inbox: "ان باکس",
  leads: "لیڈز",
  agents: "ایجنٹس",
  settings: "سیٹنگز",
  system: "سسٹم",
};

const byLocale: Record<DashboardNavLocale, DashboardNavCopy> = { en, ur };

export const getDashboardNavDict = (locale: DashboardNavLocale): DashboardNavCopy =>
  byLocale[locale] ?? en;

