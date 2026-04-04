export type SignupLocale = "en" | "ur";

export type SignupPageCopy = {
  title: string;
  subtitle: string;
  badge: string;
  companyLabel: string;
  nameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordHint: string;
  submit: string;
  submitting: string;
  errorGeneric: string;
  footerHint: string;
  linkToLogin: string;
};

const en: SignupPageCopy = {
  title: "Create account",
  subtitle:
    "The first user in your workspace becomes an admin. Choose a strong password (8+ characters).",
  badge: "New workspace",
  companyLabel: "Company name",
  nameLabel: "Full name",
  emailLabel: "Email",
  passwordLabel: "Password",
  passwordHint: "At least 8 characters",
  submit: "Create account",
  submitting: "Creating account…",
  errorGeneric: "Could not create account. Try again or use a different email.",
  footerHint:
    "After signup you are signed in automatically. Invite agents from the CRM when ready.",
  linkToLogin: "Already have an account? Sign in",
};

const ur: SignupPageCopy = {
  title: "اکاؤنٹ بنائیں",
  subtitle:
    "پہلا صارف ایڈمن ہوگا۔ مضبوط پاس ورڈ (8+ حروف) استعمال کریں۔",
  badge: "نیا ورک اسپیس",
  companyLabel: "کمپنی کا نام",
  nameLabel: "پورا نام",
  emailLabel: "ای میل",
  passwordLabel: "پاس ورڈ",
  passwordHint: "کم از کم 8 حروف",
  submit: "اکاؤنٹ بنائیں",
  submitting: "بنایا جا رہا ہے…",
  errorGeneric: "اکاؤنٹ نہیں بنا۔ دوبارہ کوشش کریں یا دوسری ای میل۔",
  footerHint:
    "سائن اپ کے بعد آپ خودکار سائن ان ہیں۔",
  linkToLogin: "پہلے سے اکاؤنٹ ہے؟ سائن ان",
};

const byLocale: Record<SignupLocale, SignupPageCopy> = { en, ur };

export const getSignupPageDict = (locale: SignupLocale): SignupPageCopy =>
  byLocale[locale] ?? en;
