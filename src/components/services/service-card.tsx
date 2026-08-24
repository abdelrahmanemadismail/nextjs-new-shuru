import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import type { StrapiServiceEntry } from "@/strapi/services";
import {
  Award,
  LineChart,
  Cpu,
  Zap,
  Users2,
  Users,
  ShieldCheck,
  Shield,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Layers,
  Settings,
  Workflow,
  TrendingUp,
  BarChart3,
  PieChart,
  FolderKanban,
  Activity,
  Lightbulb,
  Compass,
  FileCheck2,
  Building2,
  Rocket,
  Scale,
  FileText,
  Globe,
  Gauge,
  Clock,
  Coins,
  Search,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Award,
  LineChart,
  Cpu,
  Zap,
  Users2,
  Users,
  ShieldCheck,
  Shield,
  Target,
  Briefcase,
  Layers,
  Settings,
  Workflow,
  TrendingUp,
  BarChart3,
  PieChart,
  FolderKanban,
  Activity,
  Sparkles,
  Lightbulb,
  Compass,
  FileCheck2,
  Building2,
  Rocket,
  Scale,
  FileText,
  Globe,
  Gauge,
  Clock,
  Coins,
  Search,
};

export function ServiceCard({
  service,
  locale,
  index = 0,
}: {
  service: StrapiServiceEntry;
  locale: Locale;
  index?: number;
}) {
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const IconComponent = (service.icon && ICON_MAP[service.icon]) || Sparkles;
  const serviceUrl = `/${locale}/services/${service.slug}`;

  // Normalized features array
  const featuresList: string[] = Array.isArray(service.features)
    ? service.features
    : [];

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 via-card/50 to-card/20 p-6 lg:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.15)]">
      {/* Subtle top gradient accent on hover */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-opacity duration-300 group-hover:via-primary/70" />

      <div>
        {/* Header: Icon & Badge */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
            <IconComponent className="h-6 w-6" />
          </div>
          {service.badge && (
            <span className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
              {service.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary mb-3">
          <Link href={serviceUrl} className="focus:outline-none">
            {service.title}
          </Link>
        </h3>

        {/* Short Description */}
        {service.shortDescription && (
          <p className="text-sm leading-relaxed text-muted-foreground mb-6 line-clamp-3">
            {service.shortDescription}
          </p>
        )}

        {/* Key Features / Deliverables List */}
        {featuresList.length > 0 && (
          <div className="border-t border-border/40 pt-4 mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">
              {isAr ? "أبرز المخرجات والحلول:" : "Key Deliverables & Scope:"}
            </h4>
            <ul className="space-y-2.5">
              {featuresList.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary/80 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer: Card CTA Link */}
      <div className="pt-4 border-t border-border/40 mt-auto">
        <Link
          href={serviceUrl}
          className="inline-flex w-full items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <span>{service.cardCtaText || (isAr ? "استكشف تفاصيل الخدمة" : "Explore Service Details")}</span>
          <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
