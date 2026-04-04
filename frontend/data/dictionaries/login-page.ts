export type LoginLocale = "en" | "ur";

export type LoginPageCopy = {
  brandLine: string;
  productTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  signInTitle: string;
  signInSubtitle: string;
  badge: string;
  emailLabel: string;
  passwordLabel: string;
  submit: string;
  submitting: string;
  errorGeneric: string;
  footerHint: string;
  linkToSignup: string;
};

const en: LoginPageCopy = {
  brandLine: "ClientFlow",
  productTitle: "WhatsApp-first CRM",
  heroTitle: "Close deals faster with a focused WhatsApp inbox",
  heroSubtitle:
    "One view for conversations, pipeline movement, and team ownership. Built for clarity and daily sales execution.",
  feature1Title: "WhatsApp-first",
  feature1Desc: "Prioritize chats that convert.",
  feature2Title: "Pipeline-aware",
  feature2Desc: "Move deals without tab-hopping.",
  feature3Title: "Team-ready",
  feature3Desc: "Roles, assignments, and accountability.",
  feature4Title: "Real-time",
  feature4Desc: "Live updates when leads move or assign.",
  signInTitle: "Sign in",
  signInSubtitle: "Use your CRM account email and password.",
  badge: "Secure",
  emailLabel: "Email",
  passwordLabel: "Password",
  submit: "Sign in",
  submitting: "Signing in…",
  errorGeneric: "Sign-in failed. Check your credentials and try again.",
  footerHint: "First user to sign up becomes admin; additional users are agents.",
  linkToSignup: "No account yet? Create one",
};

const ur: LoginPageCopy = {
  brandLine: "ClientFlow",
  productTitle: "WhatsApp پہلا CRM",
  heroTitle: "WhatsApp ان باکس سے تیزی سے ڈیلز مکمل کریں",
  heroSubtitle:
    "گفتگو، پائپ لائن، اور ٹیم کی ذمہ داری ایک جگہ۔ وضاحت اور روزانہ فروخت کے لیے۔",
  feature1Title: "WhatsApp پہلا",
  feature1Desc: "وہ چیٹیں جن سے تبدیلی ہو۔",
  feature2Title: "پائپ لائن",
  feature2Desc: "ٹیب بدلے بغیر مرحلہ بدلیں۔",
  feature3Title: "ٹیم کے لیے",
  feature3Desc: "کردار، تفویض، اور جواب دہی۔",
  feature4Title: "فوری",
  feature4Desc: "لیڈز تفویض یا تبدیل ہونے پر فوری اپ ڈیٹ۔",
  signInTitle: "سائن ان",
  signInSubtitle: "اپنا CRM ای میل اور پاس ورڈ استعمال کریں۔",
  badge: "محفوظ",
  emailLabel: "ای میل",
  passwordLabel: "پاس ورڈ",
  submit: "سائن ان",
  submitting: "سائن ان ہو رہا ہے…",
  errorGeneric: "سائن ان ناکام۔ تفصیلات چیک کریں۔",
  footerHint: "پہلا سائن اپ ایڈمن بنتا ہے؛ باقی صارف ایجنٹ۔",
  linkToSignup: "اکاؤنٹ نہیں؟ بنائیں",
};

const byLocale: Record<LoginLocale, LoginPageCopy> = { en, ur };

export const getLoginPageDict = (locale: LoginLocale): LoginPageCopy =>
  byLocale[locale] ?? en;
