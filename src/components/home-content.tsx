'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/lib/i18n';

type HomeContentProps = {
  locale: Locale;
};

const cards = ['strategy', 'delivery', 'growth'] as const;

export function HomeContent({ locale }: HomeContentProps) {
  const t = useTranslations('home');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-3xl border border-border/70 bg-gradient-to-b from-background to-accent/30 p-8 shadow-sm sm:p-10 lg:p-12">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          {t('eyebrow')}
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="space-y-5">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t('description')}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/about`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t('primaryCta')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-accent"
              >
                {t('secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {cards.map((card) => (
              <article
                key={card}
                className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {t(`cards.${card}.title`)}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`cards.${card}.body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
