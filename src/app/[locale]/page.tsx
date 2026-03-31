import type { Metadata } from 'next';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ModeToggle } from '@/components/theme-toggle';
import { HomeContent } from '@/components/home-content';
import {
  defaultLocale,
  hrefLang,
  isLocale,
  locales,
  seoCopy,
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
  const copy = seoCopy[locale];
  const globalData = await getGlobalSettings(locale);
  const title = globalData?.seoTitle || copy.title;
  const description = globalData?.seoDescription || copy.description;
  const siteName = globalData?.siteName || 'Shuru';

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <LocaleSwitcher currentLocale={locale} />
        <ModeToggle />
      </div>
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-white px-16 py-32 dark:bg-black sm:items-start">
        <HomeContent />
      </main>
    </div>
  );
}
