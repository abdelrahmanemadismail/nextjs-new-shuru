import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { defaultLocale, isLocale, locales } from '@/lib/i18n';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Toaster } from '@/components/ui/sonner';
import { DynamicBreadcrumb } from '@/components/shared/dynamic-breadcrumb';
import { BreadcrumbProvider } from '@/components/shared/breadcrumb-context';

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
    redirect(`/${defaultLocale}`);
  }

  setRequestLocale(locale);

  return (
    <BreadcrumbProvider>
      <SiteHeader locale={locale} />
      <DynamicBreadcrumb locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
      <Toaster />
    </BreadcrumbProvider>
  );
}
