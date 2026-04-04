export type SystemLocale = "en" | "ur";

export type SystemPageCopy = {
  title: string;
  subtitle: string;
  adminOnly: string;
  twilioSidLabel: string;
  twilioTokenLabel: string;
  twilioNumberLabel: string;
  primaryColorLabel: string;
  save: string;
  saving: string;
  saveError: string;
  saveSuccess: string;
};

const en: SystemPageCopy = {
  title: "System settings",
  subtitle: "Organization branding and WhatsApp (Twilio) connection",
  adminOnly: "Only administrators can update system settings.",
  twilioSidLabel: "Twilio Account SID",
  twilioTokenLabel: "Twilio Auth Token",
  twilioNumberLabel: "Twilio WhatsApp Number",
  primaryColorLabel: "Primary color (optional)",
  save: "Save changes",
  saving: "Saving…",
  saveError: "Could not save settings.",
  saveSuccess: "Settings saved.",
};

const ur: SystemPageCopy = {
  title: "سسٹم سیٹنگز",
  subtitle: "ادارے کی برانڈنگ اور واٹس ایپ (Twilio) کنکشن",
  adminOnly: "صرف منتظمین سسٹم سیٹنگز اپڈیٹ کر سکتے ہیں۔",
  twilioSidLabel: "Twilio اکاؤنٹ SID",
  twilioTokenLabel: "Twilio آتھ ٹوکن",
  twilioNumberLabel: "Twilio واٹس ایپ نمبر",
  primaryColorLabel: "پرائمری رنگ (اختیاری)",
  save: "محفوظ کریں",
  saving: "محفوظ ہو رہا ہے…",
  saveError: "سیٹنگز محفوظ نہیں ہو سکیں۔",
  saveSuccess: "سیٹنگز محفوظ ہو گئیں۔",
};

const byLocale: Record<SystemLocale, SystemPageCopy> = { en, ur };

export const getSystemPageDict = (locale: SystemLocale): SystemPageCopy =>
  byLocale[locale] ?? en;

