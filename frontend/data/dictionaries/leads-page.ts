export type LeadsLocale = "en" | "ur";

export type LeadsPageCopy = {
  loading: string;
  loadError: string;
  retry: string;
  title: string;
  subtitle: string;
  filterSrOnly: string;
  filterAll: string;
  filterNew: string;
  filterReplied: string;
  filterInterested: string;
  filterConverted: string;
  filterLost: string;
  addLead: string;
  addLeadTitle: string;
  searchSrOnly: string;
  searchPlaceholder: string;
  emptyNoDataTitle: string;
  emptyNoDataHint: string;
  emptyFilteredTitle: string;
  emptyFilteredHint: string;
  listRegionLabel: string;
  colContact: string;
  colStatus: string;
  colLastMessage: string;
  colLastContact: string;
  showing: string;
  rangeSeparator: string;
  of: string;
  previous: string;
  next: string;
  pageLabel: string;
  pageSeparator: string;
  paginationNavLabel: string;
  openInboxConversation: string;
  unreadMessages: string;
  scopeSrOnly: string;
  scopeAll: string;
  scopeMine: string;
  scopeUnassigned: string;
  colAssignee: string;
  unassigned: string;
  assignLeadLabel: string;
  assignSaving: string;
  roleAdmin: string;
  roleAgent: string;
};

const en: LeadsPageCopy = {
  loading: "Loading leads…",
  loadError: "Could not load leads. Check the API and try again.",
  retry: "Retry",
  title: "Leads",
  subtitle: "Overview of every lead — open a row to jump to Inbox.",
  filterSrOnly: "Filter by status",
  filterAll: "All statuses",
  filterNew: "New",
  filterReplied: "Replied",
  filterInterested: "Interested",
  filterConverted: "Converted",
  filterLost: "Lost",
  addLead: "Add Lead",
  addLeadTitle: "Add lead (coming soon)",
  searchSrOnly: "Search by name or phone",
  searchPlaceholder: "Search by name or phone",
  emptyNoDataTitle: "No leads found.",
  emptyNoDataHint:
    "When contacts message your WhatsApp number, they appear here as leads.",
  emptyFilteredTitle: "No leads match your search or filters.",
  emptyFilteredHint:
    "Clear the search box or set the status filter to “All statuses”.",
  listRegionLabel: "Leads list",
  colContact: "Contact",
  colStatus: "Status",
  colLastMessage: "Last message",
  colLastContact: "Last contact",
  showing: "Showing",
  rangeSeparator: "–",
  of: "of",
  previous: "Previous",
  next: "Next",
  pageLabel: "Page",
  pageSeparator: "/",
  paginationNavLabel: "Pagination",
  openInboxConversation: "Open inbox conversation with {name}",
  unreadMessages: "Unread messages",
  scopeSrOnly: "Lead scope",
  scopeAll: "All leads",
  scopeMine: "My leads",
  scopeUnassigned: "Unassigned",
  colAssignee: "Owner",
  unassigned: "Unassigned",
  assignLeadLabel: "Assign owner",
  assignSaving: "Saving…",
  roleAdmin: "Admin",
  roleAgent: "Agent",
};

const ur: LeadsPageCopy = {
  loading: "لیڈز لوڈ ہو رہے ہیں…",
  loadError: "لیڈز لوڈ نہیں ہو سکے۔ API چیک کریں اور دوبارہ کوشش کریں۔",
  retry: "دوبارہ کوشش",
  title: "لیڈز",
  subtitle: "ہر لیڈ کا خلاصہ — ان باکس میں جانے کے لیے قطار کھولیں۔",
  filterSrOnly: "حیثیت کے مطابق فلٹر",
  filterAll: "تمام حیثیتیں",
  filterNew: "نیا",
  filterReplied: "جواب دیا",
  filterInterested: "دلچسپی",
  filterConverted: "تبدیل",
  filterLost: "ضائع",
  addLead: "لیڈ شامل کریں",
  addLeadTitle: "لیڈ شامل کریں (جلد آ رہا ہے)",
  searchSrOnly: "نام یا فون سے تلاش",
  searchPlaceholder: "نام یا فون سے تلاش کریں",
  emptyNoDataTitle: "کوئی لیڈ نہیں ملا۔",
  emptyNoDataHint:
    "جب رابطے آپ کے WhatsApp نمبر پر پیغام بھیجیں گے، وہ یہاں لیڈ کے طور پر آئیں گے۔",
  emptyFilteredTitle: "آپ کی تلاش یا فلٹر سے کوئی لیڈ میل نہیں کھاتا۔",
  emptyFilteredHint:
    "تلاش خالی کریں یا فلٹر “تمام حیثیتیں” پر رکھیں۔",
  listRegionLabel: "لیڈز کی فہرست",
  colContact: "رابطہ",
  colStatus: "حیثیت",
  colLastMessage: "آخری پیغام",
  colLastContact: "آخری رابطہ",
  showing: "دکھایا جا رہا ہے",
  rangeSeparator: "–",
  of: "میں سے",
  previous: "پچھلا",
  next: "اگلا",
  pageLabel: "صفحہ",
  pageSeparator: "/",
  paginationNavLabel: "صفحہ بندی",
  openInboxConversation: "{name} کے ساتھ ان باکس گفتگو کھولیں",
  unreadMessages: "نئے پیغامات",
  scopeSrOnly: "لیڈز کا دائرہ",
  scopeAll: "تمام لیڈز",
  scopeMine: "میری لیڈز",
  scopeUnassigned: "غیر تفویض شدہ",
  colAssignee: "مالک",
  unassigned: "غیر تفویض شدہ",
  assignLeadLabel: "مالک تفویض کریں",
  assignSaving: "محفوظ ہو رہا ہے…",
  roleAdmin: "ایڈمن",
  roleAgent: "ایجنٹ",
};

const byLocale: Record<LeadsLocale, LeadsPageCopy> = { en, ur };

export const getLeadsPageDict = (locale: LeadsLocale): LeadsPageCopy =>
  byLocale[locale] ?? en;

export const openInboxAria = (copy: LeadsPageCopy, name: string): string =>
  copy.openInboxConversation.replace("{name}", name);
