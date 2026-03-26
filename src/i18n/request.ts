import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';
import { defaultLocale, isLocale, localeCookie } from "@/lib/i18n";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get(localeCookie)?.value;
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;
  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default
  };
});