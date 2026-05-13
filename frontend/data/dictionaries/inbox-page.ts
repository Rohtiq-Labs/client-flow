import type { LeadListBadge, LeadPipelineStatus } from "@/data/inbox-mock-data";

export type InboxLocale = "en" | "ur";

export type InboxPageCopy = {
  loadingInbox: string;
  threadLoading: string;
  audioPlaybackAria: string;
  loadError: string;
  retry: string;
  emptyInboxTitle: string;
  emptyInboxHint: string;
  title: string;
  searchPlaceholder: string;
  emptySearch: string;
  chatEmptyTitle: string;
  chatEmptyHint: string;
  composerPlaceholder: string;
  sending: string;
  sendFailed: string;
  voiceRecordAria: string;
  voiceStopSendAria: string;
  voiceAttachAria: string;
  voiceRecordingLabel: string;
  sendImageAria: string;
  imageAttachmentAlt: string;
  mediaLoadFailed: string;
  statusSentAria: string;
  statusDeliveredAria: string;
  statusReadAria: string;
  statusFailedAria: string;
  statusUpdating: string;
  aiActive: string;
  badge: Record<LeadListBadge, string>;
  status: Record<LeadPipelineStatus, string>;
  leadStatusListLabel: string;
  assignedTo: string;
  assignedToUnassigned: string;
  backToConversationList: string;
};

const en: InboxPageCopy = {
  loadingInbox: "Loading inbox…",
  threadLoading: "Loading messages…",
  audioPlaybackAria: "Voice message playback",
  loadError: "Could not load inbox. Check the API and try again.",
  retry: "Retry",
  emptyInboxTitle: "No conversations yet",
  emptyInboxHint:
    "When leads message your WhatsApp number, they will appear here.",
  title: "Inbox",
  searchPlaceholder: "Search name or phone",
  emptySearch: "No conversations match your search.",
  chatEmptyTitle: "Select a conversation to start",
  chatEmptyHint:
    "Choose a lead from the list to view messages and reply.",
  composerPlaceholder: "Write a message…",
  sending: "Sending…",
  sendFailed: "Message could not be sent.",
  voiceRecordAria: "Record voice message",
  voiceStopSendAria: "Stop recording and send",
  voiceAttachAria: "Attach audio file",
  voiceRecordingLabel: "Recording…",
  sendImageAria: "Send image",
  imageAttachmentAlt: "Image attachment",
  mediaLoadFailed: "Could not load attachment.",
  statusSentAria: "Sent",
  statusDeliveredAria: "Delivered",
  statusReadAria: "Read",
  statusFailedAria: "Failed to send",
  statusUpdating: "Updating…",
  aiActive: "AI active",
  badge: {
    New: "New",
    Replied: "Replied",
    Interested: "Interested",
    Converted: "Converted",
    Lost: "Lost",
  },
  status: {
    New: "New",
    Replied: "Replied",
    Interested: "Interested",
    Converted: "Converted",
    Lost: "Lost",
  },
  leadStatusListLabel: "Lead status",
  assignedTo: "Assigned to",
  assignedToUnassigned: "Unassigned",
  backToConversationList: "Conversations",
};

const ur: InboxPageCopy = {
  loadingInbox: "ان باکس لوڈ ہو رہا ہے…",
  threadLoading: "پیغامات لوڈ ہو رہے ہیں…",
  audioPlaybackAria: "وائس پیغام چلائیں",
  loadError: "ان باکس لوڈ نہیں ہو سکا۔ API چیک کریں اور دوبارہ کوشش کریں۔",
  retry: "دوبارہ کوشش",
  emptyInboxTitle: "ابھی کوئی گفتگو نہیں",
  emptyInboxHint:
    "جب لیڈز آپ کے WhatsApp نمبر پر پیغام بھیجیں گے، وہ یہاں نظر آئیں گے۔",
  title: "ان باکس",
  searchPlaceholder: "نام یا فون تلاش کریں",
  emptySearch: "آپ کی تلاش سے کوئی گفتگو میل نہیں کھاتی۔",
  chatEmptyTitle: "گفتگو شروع کرنے کے لیے منتخب کریں",
  chatEmptyHint:
    "پیغامات دیکھنے اور جواب دینے کے لیے فہرست سے ایک لیڈ چنیں۔",
  composerPlaceholder: "پیغام لکھیں…",
  sending: "بھیجا جا رہا ہے…",
  sendFailed: "پیغام نہیں بھیجا جا سکا۔",
  voiceRecordAria: "وائس پیغام ریکارڈ کریں",
  voiceStopSendAria: "ریکارڈنگ روکیں اور بھیجیں",
  voiceAttachAria: "آڈیو فائل منسلک کریں",
  voiceRecordingLabel: "ریکارڈ ہو رہا ہے…",
  sendImageAria: "تصویر بھیجیں",
  imageAttachmentAlt: "تصویر",
  mediaLoadFailed: "منسلک فائل لوڈ نہیں ہو سکی۔",
  statusSentAria: "بھیج دیا گیا",
  statusDeliveredAria: "پہنچ گیا",
  statusReadAria: "پڑھ لیا گیا",
  statusFailedAria: "بھیجنا ناکام",
  statusUpdating: "اپ ڈیٹ ہو رہا ہے…",
  aiActive: "AI فعال",
  badge: {
    New: "نیا",
    Replied: "جواب دیا",
    Interested: "دلچسپی",
    Converted: "تبدیل",
    Lost: "ضائع",
  },
  status: {
    New: "نیا",
    Replied: "جواب دیا",
    Interested: "دلچسپی",
    Converted: "تبدیل",
    Lost: "ضائع",
  },
  leadStatusListLabel: "لیڈ کی حیثیت",
  assignedTo: "تفویض شدہ",
  assignedToUnassigned: "غیر تفویض شدہ",
  backToConversationList: "گفتگوؤں پر واپس",
};

const byLocale: Record<InboxLocale, InboxPageCopy> = { en, ur };

export const getInboxPageDict = (locale: InboxLocale): InboxPageCopy =>
  byLocale[locale] ?? en;
