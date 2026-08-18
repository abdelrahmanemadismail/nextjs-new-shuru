import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import type { StrapiServiceEntry } from "@/strapi/services";
import {
  Award,
  LineChart,
  Cpu,
  Zap,
  Users2,
  ShieldCheck,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  CalendarDays,
  FileCheck2,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Award,
  LineChart,
  Cpu,
  Zap,
  Users2,
  ShieldCheck,
  Target,
};

export function ServiceDetailHero({
  service,
  locale,
}: {
  service: StrapiServiceEntry;
  locale: Locale;
}) {
  const isAr = locale === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;
  const IconComponent = (service.icon && ICON_MAP[service.icon]) || Sparkles;

  const featuresList: string[] = Array.isArray(service.features)
    ? service.features
    : [];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-border/50 bg-gradient-to-b from-card/30 via-background to-background">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute top-1/2 left-10 h-[300px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <ChevronIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link href={`/${locale}/services`} className="hover:text-primary transition-colors">
            {isAr ? "الخدمات" : "Services"}
          </Link>
          <ChevronIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
            {service.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-7">
            {/* Badge */}
            {service.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                <IconComponent className="h-3.5 w-3.5" />
                <span>{service.badge}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight mb-6">
              {service.title}
            </h1>

            {/* Short Description */}
            {service.shortDescription && (
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground mb-8">
                {service.shortDescription}
              </p>
            )}

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-2 rounded-xl bg-card/60 border border-border/60 p-3 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{isAr ? "منهجيات دولية معتمدة" : "Accredited Frameworks"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-card/60 border border-border/60 p-3 text-xs font-medium text-foreground">
                <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                <span>{isAr ? "مواءمة رؤية 2030" : "Vision 2030 Aligned"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-card/60 border border-border/60 p-3 text-xs font-medium text-foreground col-span-2 sm:col-span-1">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                <span>{isAr ? "تنفيذ ومتابعة لحظية" : "Real-time Execution"}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/${locale}/contact?service=${service.slug}`}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {isAr ? "طلب هذه الخدمة الآن" : "Request This Service"}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center justify-center rounded-xl border border-border/80 bg-card/40 px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-card hover:border-primary/40 focus:outline-none"
              >
                {isAr ? "استعراض جميع الخدمات" : "View All Services"}
              </Link>
            </div>
          </div>

          {/* Key Deliverables Highlights Box */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/60 to-primary/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {isAr ? "نطاق العمل والمخرجات الرئيسية" : "Scope & Core Deliverables"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "ما ستحصل عليه مؤسستك من هذه الخدمة" : "What your organization achieves with this service"}
                  </p>
                </div>
              </div>

              {featuresList.length > 0 ? (
                <ul className="space-y-4">
                  {featuresList.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-foreground/90">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {isAr ? "مخرجات متكاملة ومصممة خصيصاً لاحتياجات المنظمة." : "Tailored deliverables designed for your organization."}
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>{isAr ? "تخصيص كامل وفق المتطلبات" : "Fully customizable scope"}</span>
                <span className="font-semibold text-primary">{isAr ? "استشارة مجانية" : "Free Discovery Session"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
