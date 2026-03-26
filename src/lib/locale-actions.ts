'use server';

import { cookies } from 'next/headers';
import { localeCookie, isLocale } from './i18n';

export async function setLocale(locale: string) {
  if (!isLocale(locale)) {
    throw new Error('Invalid locale');
  }

  const cookieStore = await cookies();
  cookieStore.set(localeCookie, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
