export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeCookie = "locale";

export const rtlLocales = new Set<Locale>(["ar"]);

export const languageLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const isLocale = (value: string | null | undefined): value is Locale =>
  locales.includes(value as Locale);

export const getDirection = (locale: Locale) =>
  rtlLocales.has(locale) ? "rtl" : "ltr";