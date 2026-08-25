import { type Locale } from "@/lib/i18n";
import type { StrapiServiceEntry } from "@/strapi/services";
import { ServiceCard } from "./service-card";
import { Sparkles } from "lucide-react";
import { getCardGridContainerClasses, getCardItemClasses } from "@/lib/grid-utils";
import { cn } from "@/lib/utils";

export function ServicesGrid({
  services,
  locale,
  badge,
  title,
  introText,
}: {
  services: StrapiServiceEntry[];
  locale: Locale;
  badge?: string;
  title?: string;
  introText?: string;
}) {
  const isAr = locale === "ar";

  const defaultBadge = isAr ? "منظومة الخدمات الاستشارية" : "Consulting & Advisory Tracks";
  const defaultTitle = isAr ? "خدماتنا الاستشارية والتنفيذية المتكاملة" : "Integrated Consulting & Execution Services";
  const defaultIntro = isAr
    ? "خدمات متخصصة تُغطي أبرز متطلبات التطوير المؤسسي وسد الفجوات التشغيلية — يمكن الاستفادة منها بشكل منفرد أو كمنظومة متكاملة حسب أولويات منظمتك."
    : "Specialized consulting tracks engineered to bridge operational gaps and maximize organizational impact — available individually or as an integrated system.";

  return (
    <section className="relative py-16 lg:py-24 bg-background">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{badge || defaultBadge}</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-4">
            {title || defaultTitle}
          </h2>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
            {introText || defaultIntro}
          </p>
        </div>

        {/* Services Grid (Adaptive: 3 in row, 4 as 2x2, 5 as 3+2 centered) */}
        {services.length > 0 ? (
          <div className={getCardGridContainerClasses(services.length, "gap-6 lg:gap-8")}>
            {services.map((service, index) => (
              <div key={service.id || service.slug} className={cn("h-full flex flex-col", getCardItemClasses(services.length, index))}>
                <ServiceCard
                  service={service}
                  locale={locale}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
            <p>{isAr ? "لا توجد خدمات متاحة حالياً." : "No services available at this moment."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
