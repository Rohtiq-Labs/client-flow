export type SettingsLocale = "en" | "ur";

export type SettingsPageCopy = {
  teamTitle: string;
  teamSubtitle: string;
  teamAdminOnly: string;
  agentNameLabel: string;
  agentEmailLabel: string;
  agentPasswordLabel: string;
  agentPasswordHint: string;
  createAgent: string;
  creatingAgent: string;
  agentsListLabel: string;
  noAgentsYet: string;
  createSuccess: string;
  createError: string;
  loadAgentsError: string;
};

const en: SettingsPageCopy = {
  teamTitle: "Team",
  teamSubtitle: "Create agent accounts. Agents sign in with email and password.",
  teamAdminOnly: "Only administrators can add agents.",
  agentNameLabel: "Full name",
  agentEmailLabel: "Email",
  agentPasswordLabel: "Temporary password",
  agentPasswordHint: "At least 8 characters. Ask the agent to change it after first login.",
  createAgent: "Create agent",
  creatingAgent: "Creating…",
  agentsListLabel: "Agents",
  noAgentsYet: "No agents yet. Create one above.",
  createSuccess: "Agent created.",
  createError: "Could not create agent.",
  loadAgentsError: "Could not load agents.",
};

const ur: SettingsPageCopy = {
  teamTitle: "ٹیم",
  teamSubtitle: "ایجنٹ اکاؤنٹ بنائیں۔ ایجنٹ ای میل اور پاس ورڈ سے سائن ان کریں۔",
  teamAdminOnly: "صرف منتظمین ایجنٹ شامل کر سکتے ہیں۔",
  agentNameLabel: "پورا نام",
  agentEmailLabel: "ای میل",
  agentPasswordLabel: "عارضی پاس ورڈ",
  agentPasswordHint: "کم از کم 8 حروف۔ پہلے سائن ان کے بعد تبدیل کرائیں۔",
  createAgent: "ایجنٹ بنائیں",
  creatingAgent: "بنایا جا رہا ہے…",
  agentsListLabel: "ایجنٹ",
  noAgentsYet: "ابھی کوئی ایجنٹ نہیں۔ اوپر سے بنائیں۔",
  createSuccess: "ایجنٹ بن گیا۔",
  createError: "ایجنٹ نہیں بنا۔",
  loadAgentsError: "ایجنٹ لوڈ نہیں ہو سکے۔",
};

const byLocale: Record<SettingsLocale, SettingsPageCopy> = { en, ur };

export const getSettingsPageDict = (locale: SettingsLocale): SettingsPageCopy =>
  byLocale[locale] ?? en;
