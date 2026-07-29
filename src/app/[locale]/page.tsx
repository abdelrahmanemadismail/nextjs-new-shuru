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
import { buildMetadata } from '@/lib/seo';

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const [globalData, homeData] = await Promise.all([
    getGlobalSettings(locale),
    getHomeCached(locale)
  ]);

  const seo = homeData?.seo;
  const ogImg = seo?.og_image;
  const heroBlock = homeData?.blocks?.find(
    (b): b is import('@/strapi/home').StrapiHeroBlock => b.__component === 'home.hero'
  );

  const metadata = await buildMetadata({
    locale,
    path: "/",
    title: seo?.meta_title || heroBlock?.title || globalData?.seoTitle,
    description: seo?.meta_description || heroBlock?.subtitle || globalData?.seoDescription,
    ogType: "hero",
    cta1: heroBlock?.primaryCtaText,
    cta2: heroBlock?.secondaryCtaText,
    ogImage: ogImg ? {
      url: ogImg.url,
      width: ogImg.width,
      height: ogImg.height,
      alt: ogImg.alternativeText,
    } : undefined,
  });

  return {
    ...metadata,
    icons: globalData?.faviconUrl
      ? {
          icon: [{ url: globalData.faviconUrl }],
        }
      : undefined,
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
    <div className="min-h-dvh bg-background font-sans">
      <main>
        {homeData ? (
          <HomeContent
            locale={locale}
            homeData={homeData}
            testimonials={testimonials}
          />
        ) : (
          <div className="flex h-dvh items-center justify-center">
            <p className="text-muted-foreground text-lg">No homepage content found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
