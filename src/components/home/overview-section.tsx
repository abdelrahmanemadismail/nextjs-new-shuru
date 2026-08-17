'use client';

import Link from 'next/link';
import {
  Target,
  Activity,
  Zap,
  CheckCircle,
  ArrowRight,
  Layers,
  Cpu,
  Users2,
  LineChart,
  Compass,
  Search,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { locales } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import type { StrapiOverviewBlock } from '@/strapi/home';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Check: <CheckCircle className="h-6 w-6 text-primary" />,
  Layers: <Layers className="h-6 w-6" />,
  Cpu: <Cpu className="h-6 w-6" />,
  Users2: <Users2 className="h-6 w-6" />,
  LineChart: <LineChart className="h-6 w-6" />,
  Compass: <Compass className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
};

function getIcon(name?: string, defaultIcon?: React.ReactNode) {
  if (!name) return defaultIcon || <Target className="h-6 w-6" />;
  return iconMap[name] || defaultIcon || <Target className="h-6 w-6" />;
}

const localePathPattern = new RegExp(`^/(${locales.join("|")})(/|$)`);
const isExternalUrl = (url: string) =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("mailto:") ||
  url.startsWith("tel:");

function toLocaleAwareUrl(url: string, locale: string) {
  if (!url || isExternalUrl(url) || url.startsWith("#")) return url;
  if (!url.startsWith("/")) return `/${locale}/${url}`;
  if (localePathPattern.test(url)) return url;
  return url === "/" ? `/${locale}` : `/${locale}${url}`;
}

export function OverviewSection({ overview }: { overview: StrapiOverviewBlock }) {
  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const isAr = locale === 'ar';

  const cards = overview.cards || [];

  return (
    <section id="solutions" className="py-16 sm:py-24 lg:py-28 bg-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100/[0.04] dark:bg-grid-slate-900/[0.04] bg-[size:20px_20px]"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {overview.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Layers className="h-3.5 w-3.5" />
              <span>{overview.badge}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {overview.title}
          </h2>
          {overview.introText && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground whitespace-pre-line">
              {overview.introText}
            </p>
          )}
        </div>

        {cards.length > 0 && (
          <div className="mx-auto mt-12 sm:mt-16 max-w-7xl">
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
                cards.length === 3
                  ? 'lg:grid-cols-3'
                  : cards.length >= 4
                  ? 'lg:grid-cols-4'
                  : 'lg:grid-cols-2'
              }`}
            >
              {cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="group relative flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 overflow-hidden"
                >
                  <div className="hidden md:block absolute top-0 end-0 -m-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10"></div>

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                          {getIcon(card.iconName, <Target className="h-6 w-6" />)}
                        </div>
                      </div>
                      {card.badge && (
                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase bg-accent/60 px-2.5 py-1 rounded-full border border-border/40">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {card.cardCtaText && (
                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>{card.cardCtaText}</span>
                      <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {overview.ctaText && overview.ctaLink && (
          <div className="mt-12 sm:mt-16 text-center">
            <Link
              href={toLocaleAwareUrl(overview.ctaLink, locale)}
              className="group inline-flex items-center justify-center rounded-full bg-accent/60 border border-border/70 px-8 py-3.5 text-base font-semibold text-foreground hover:bg-accent hover:border-primary/40 transition-all duration-300 shadow-sm"
            >
              <span>{overview.ctaText}</span>
              <ArrowRight className="ms-2 h-4 w-4 transform transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 text-primary" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
