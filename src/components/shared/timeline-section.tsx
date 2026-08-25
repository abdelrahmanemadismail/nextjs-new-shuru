import Link from 'next/link';
import {
  Search,
  Compass,
  Rocket,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Workflow,
  Target,
  Activity,
  Zap,
} from 'lucide-react';
import type { StrapiTimelineStep } from '@/strapi/page';
import { locales, type Locale } from '@/lib/i18n';
import { getCardGridContainerClasses, getCardItemClasses } from '@/lib/grid-utils';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Compass,
  Rocket,
  GraduationCap,
  Chart: Activity,
  Blueprint: Compass,
  Implementation: Rocket,
  Empowerment: GraduationCap,
  Target,
  Activity,
  Zap,
  Workflow,
  Layers,
};

function getStepIcon(name?: string) {
  if (!name) return Sparkles;
  return iconMap[name] || Sparkles;
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

interface TimelineSectionProps {
  badge?: string;
  title: string;
  introText?: string;
  steps: StrapiTimelineStep[];
  ctaText?: string;
  ctaLink?: string;
  locale?: Locale;
}

export function TimelineSection({
  badge,
  title,
  introText,
  steps = [],
  ctaText,
  ctaLink,
  locale = 'ar',
}: TimelineSectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-background border-t border-border/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
          {badge && (
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mt-4">
            {title}
          </h2>
          {introText && (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground whitespace-pre-line">
              {introText}
            </p>
          )}
        </div>

        {/* Timeline Steps Grid */}
        {steps.length > 0 && (
          <div className={getCardGridContainerClasses(steps.length, "gap-6 relative")}>
            {steps.map((step, index) => {
              const Icon = getStepIcon(step.icon);
              const stepNumber = step.number || `0${index + 1}`;
              return (
                <div
                  key={step.id || index}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 h-full",
                    getCardItemClasses(steps.length, index)
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black text-primary/30 group-hover:text-primary transition-colors">
                        {stepNumber}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  {step.deliverable && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-lg w-full">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{step.deliverable}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {ctaText && ctaLink && (
          <div className="mt-12 text-center">
            <Link
              href={toLocaleAwareUrl(ctaLink, locale)}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}