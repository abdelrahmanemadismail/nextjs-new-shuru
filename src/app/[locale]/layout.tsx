import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isLocale, locales } from '@/lib/i18n';
import { SiteHeader } from '@/components/layout/site-header';

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <>
      <SiteHeader locale={locale} />
      {children}
    </>
  );
}
