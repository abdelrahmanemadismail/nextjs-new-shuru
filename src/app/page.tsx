import { getLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ModeToggle } from '@/components/theme-toggle';
import { HomeContent } from '@/components/home-content';
import type { Locale } from '@/lib/i18n';

export default async function Home() {
  const locale = await getLocale() as Locale;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <LocaleSwitcher currentLocale={locale} />
        <ModeToggle />
      </div>
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <HomeContent />
      </main>
    </div>
  );
}
