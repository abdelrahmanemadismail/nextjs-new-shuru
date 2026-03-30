import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';
import { defaultLocale, isLocale, localeCookie } from "@/lib/i18n";

export default getRequestConfig(async ({requestLocale}) => {
  const store = await cookies();
  const localeFromUrl = await requestLocale;
  const localeFromCookie = store.get(localeCookie)?.value;

  const resolvedLocale =
    (isLocale(localeFromUrl) && localeFromUrl) ||
    (isLocale(localeFromCookie) && localeFromCookie) ||
    defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default
  };
});