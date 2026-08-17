'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Building2,
  LineChart,
  Activity,
  Target,
  Layers,
  Sparkles,
} from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import type { StrapiHeroBlock } from '@/strapi/home';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="h-3.5 w-3.5 text-primary" />,
  BarChart3: <BarChart3 className="h-3.5 w-3.5 text-primary" />,
  Zap: <Zap className="h-3.5 w-3.5 text-primary" />,
  Building2: <Building2 className="h-3.5 w-3.5 text-primary" />,
  LineChart: <LineChart className="h-3.5 w-3.5 text-primary" />,
  Activity: <Activity className="h-3.5 w-3.5 text-primary" />,
  Target: <Target className="h-3.5 w-3.5 text-primary" />,
  Layers: <Layers className="h-3.5 w-3.5 text-primary" />,
  ShieldCheck: <ShieldCheck className="h-3.5 w-3.5 text-primary" />,
};

function getAudienceIcon(name?: string) {
  if (!name) return <Sparkles className="h-3.5 w-3.5 text-primary" />;
  return iconMap[name] || <Sparkles className="h-3.5 w-3.5 text-primary" />;
}

export function HeroSection({ hero, locale }: { hero: StrapiHeroBlock; locale: Locale }) {
  const isRtl = locale === 'ar';
  const Icon = isRtl ? ArrowLeft : ArrowRight;

  const primaryCtaText = hero?.primaryCtaText;
  const primaryCtaLink = hero?.primaryCtaLink
    ? (hero.primaryCtaLink.startsWith('/') ? `/${locale}${hero.primaryCtaLink}` : hero.primaryCtaLink)
    : null;

  const secondaryCtaText = hero?.secondaryCtaText;
  const secondaryCtaLink = hero?.secondaryCtaLink
    ? (hero.secondaryCtaLink.startsWith('/') ? `/${locale}${hero.secondaryCtaLink}` : hero.secondaryCtaLink)
    : null;

  const showShowcase = hero?.showShowcase !== false && (hero?.showcaseTitle || (hero?.metrics && hero.metrics.length > 0));

  return (
    <section className="relative overflow-hidden bg-background pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
      {/* Background gradients */}
      <div className="absolute inset-x-0 top-0 h-[700px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/5 pointer-events-none" />
      <div className="hidden md:block absolute top-1/4 -start-32 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] opacity-40"></div>
      <div className="hidden md:block absolute top-1/4 -end-32 -z-10 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] opacity-40"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Optional Eyebrow Positioning Pill */}
        {hero.badgeText && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-6 sm:mb-8 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>{hero.badgeText}</span>
          </div>
        )}

        {/* Hero Title */}
        <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight py-2 leading-[1.15]">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 dark:from-white dark:via-gray-200 dark:to-gray-400 drop-shadow-sm">
            {hero.title}
          </span>
        </h1>

        {/* Subtitle */}
        {hero.subtitle && (
          <p className="mx-auto mt-5 sm:mt-8 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground font-medium whitespace-pre-line">
            {hero.subtitle}
          </p>
        )}

        {/* Target Audience / Sectors Badges from Strapi */}
        {hero.targetAudiences && hero.targetAudiences.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-foreground/80 font-medium">
            {hero.targetAudiences.map((aud, idx) => (
              <span
                key={aud.id || idx}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent/50 px-3 py-1.5 border border-border/60"
              >
                {getAudienceIcon(aud.iconName)}
                {aud.label}
              </span>
            ))}
          </div>
        )}

        {/* Action CTA Buttons */}
        {(primaryCtaText || secondaryCtaText) && (
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {primaryCtaText && primaryCtaLink && (
              <Link
                href={primaryCtaLink}
                className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-primary px-8 sm:px-10 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {primaryCtaText}
                  <Icon className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </Link>
            )}

            {secondaryCtaText && secondaryCtaLink && (
              <Link
                href={secondaryCtaLink}
                className="group inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-border/80 bg-card/80 backdrop-blur-sm px-8 sm:px-10 text-base font-semibold text-foreground shadow-sm hover:bg-accent/40 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        )}

        {/* Dynamic Visual Showcase & Metrics Widget from Strapi */}
        {showShowcase && (
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
            {(hero.showcaseTitle || hero.showcaseBadge) && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-start border-b border-border/50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    {hero.showcaseTitle && (
                      <h4 className="font-bold text-sm sm:text-base text-foreground">
                        {hero.showcaseTitle}
                      </h4>
                    )}
                    {hero.showcaseSubtitle && (
                      <p className="text-xs text-muted-foreground">
                        {hero.showcaseSubtitle}
                      </p>
                    )}
                  </div>
                </div>
                {hero.showcaseBadge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {hero.showcaseBadge}
                  </div>
                )}
              </div>
            )}

            {hero.metrics && hero.metrics.length > 0 && (
              <div
                className={`grid grid-cols-2 ${
                  hero.metrics.length === 3
                    ? 'md:grid-cols-3'
                    : hero.metrics.length >= 4
                    ? 'md:grid-cols-4'
                    : 'md:grid-cols-2'
                } gap-3 sm:gap-4 text-start`}
              >
                {hero.metrics.map((metric, idx) => (
                  <div
                    key={metric.id || idx}
                    className="p-3 sm:p-4 rounded-xl bg-accent/30 border border-border/40"
                  >
                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                      {metric.label}
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-foreground">
                      {metric.value}
                    </span>
                    {metric.progressPercent != null && (
                      <div className="w-full bg-accent/60 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, metric.progressPercent))}%` }}
                        ></div>
                      </div>
                    )}
                    {metric.subtext && (
                      <span className="text-[11px] text-primary font-semibold block mt-1">
                        {metric.subtext}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
