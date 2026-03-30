import type { MetadataRoute } from 'next';
import { locales, siteUrl } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: locale === 'en' ? 1 : 0.9,
  }));
}
