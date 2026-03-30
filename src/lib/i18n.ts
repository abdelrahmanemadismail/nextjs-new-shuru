export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localePrefix = "always" as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const localeCookie = "locale";

export const rtlLocales = new Set<Locale>(["ar"]);

export const languageLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const hrefLang: Record<Locale, string> = {
  en: "en",
  ar: "ar",
};

export const seoCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Shuru",
    description: "Shuru multilingual experience in English and Arabic.",
  },
  ar: {
    title: "شروع",
    description: "تجربة شروع متعددة اللغات بالإنجليزية والعربية.",
  },
};

export const isLocale = (value: string | null | undefined): value is Locale =>
  locales.includes(value as Locale);

export const getDirection = (locale: Locale) =>
  rtlLocales.has(locale) ? "rtl" : "ltr";