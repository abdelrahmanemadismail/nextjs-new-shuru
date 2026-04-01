import type { Metadata } from 'next';
import { HomeContent } from '@/components/home/home-content';
import {
  defaultLocale,
  hrefLang,
  isLocale,
  locales,
  siteUrl,
  type Locale,
} from '@/lib/i18n';
import { getGlobalSettings } from '@/strapi/global';
import { getHomeCached, getTestimonialsCached } from '@/strapi/home';

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const path = `/${locale}`;

  const [globalData, homeData] = await Promise.all([
    getGlobalSettings(locale),
    getHomeCached(locale)
  ]);

  const title = homeData?.seo?.meta_title || globalData?.seoTitle;
  const description = homeData?.seo?.meta_description || globalData?.seoDescription;
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

  const [homeData, testimonials] = await Promise.all([
    getHomeCached(locale),
    getTestimonialsCached(locale),
  ]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <main>
        {homeData ? (
          <HomeContent
            locale={locale}
            homeData={homeData}
            testimonials={testimonials}
          />
        ) : (
          <div className="flex h-screen items-center justify-center">
            <p className="text-muted-foreground text-lg">No homepage content found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
