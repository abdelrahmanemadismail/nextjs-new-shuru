import type { Metadata } from 'next';
import { HomeContent } from '@/components/home-content';
import {
  defaultLocale,
  hrefLang,
  isLocale,
  locales,
  siteUrl,
  type Locale,
} from '@/lib/i18n';
import { getGlobalSettings } from '@/strapi/global';

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const path = `/${locale}`;
  const globalData = await getGlobalSettings(locale);
  const title = globalData?.seoTitle;
  const description = globalData?.seoDescription;
  const siteName = globalData?.siteName;

  return {
    title,
    description,
    icons: globalData?.faviconUrl
      ? {
          icon: [{ url: globalData.faviconUrl }],
        }
      : undefined,
    alternates: {
      canonical: path,
      languages: {
        ...Object.fromEntries(locales.map((item) => [hrefLang[item], `/${item}`])),
        'x-default': `/${defaultLocale}`,
      },
    },
    openGraph: {
      url: `${siteUrl}${path}`,
      locale,
      title,
      description,
      type: 'website',
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  return (
    <div className="min-h-screen bg-background font-sans">
      <main>
        <HomeContent locale={locale} />
      </main>
    </div>
  );
}
