export type NotificationsBellLocale = "en" | "ur";

export type NotificationsBellCopy = {
  bellAria: string;
  title: string;
  empty: string;
  markAllRead: string;
  fromAssigner: string;
  typeInbound: string;
  typeLeadCreated: string;
  typeLeadAssigned: string;
};

const en: NotificationsBellCopy = {
  bellAria: "Notifications",
  title: "Notifications",
  empty: "You’re all caught up.",
  markAllRead: "Mark all read",
  fromAssigner: "From",
  typeInbound: "New WhatsApp message",
  typeLeadCreated: "New lead",
  typeLeadAssigned: "Lead assigned to you",
};

const ur: NotificationsBellCopy = {
  bellAria: "اطلاعات",
  title: "اطلاعات",
  empty: "کوئی نئی اطلاع نہیں۔",
  markAllRead: "سب پڑھا ہوا",
  fromAssigner: "بذریعہ",
  typeInbound: "نیا WhatsApp پیغام",
  typeLeadCreated: "نئی لیڈ",
  typeLeadAssigned: "لیڈ آپ کو تفویض کی گئی",
};

const byLocale: Record<NotificationsBellLocale, NotificationsBellCopy> = {
  en,
  ur,
};

export const getNotificationsBellDict = (
  locale: NotificationsBellLocale,
): NotificationsBellCopy => byLocale[locale] ?? en;

export const notificationTitleForType = (
  type: string,
  copy: NotificationsBellCopy,
): string => {
  if (type === "whatsapp_inbound") return copy.typeInbound;
  if (type === "lead_created") return copy.typeLeadCreated;
  if (type === "lead_assigned") return copy.typeLeadAssigned;
  return copy.title;
};
