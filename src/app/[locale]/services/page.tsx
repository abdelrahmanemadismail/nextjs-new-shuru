import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getServicesCached } from "@/strapi/services";
import { getServicesPageCached } from "@/strapi/services-page";
import { getTestimonialsCached } from "@/strapi/home";
import { ServicesGrid } from "@/components/services/services-grid";
import { BlockRenderer } from "@/components/page/block-renderer";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbTitleSetter } from "@/components/shared/breadcrumb-context";
import { HeroSection } from "@/components/home/hero-section";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Award } from "lucide-react";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const servicesPage = await getServicesPageCached(locale);

  const isAr = locale === "ar";
  const defaultTitle = isAr
    ? "الخدمات الاستشارية والتنفيذية | شروع"
    : "Consulting & Execution Services | Shuru";
  const defaultDesc = isAr
    ? "منظومة متكاملة من الخدمات الاستشارية والتنفيذية في الجودة، الاستراتيجية، إدارة المشاريع PMO، التحول الرقمي، وإدارة التغيير."
    : "Integrated consulting and execution services in quality excellence, strategic planning, PMO, digital transformation, and change management.";

  const seo = servicesPage?.seo;

  return buildMetadata({
    locale,
    path: "/services",
    title: seo?.meta_title || servicesPage?.title || defaultTitle,
    description: seo?.meta_description || servicesPage?.heroSubtitle || defaultDesc,
    keywords: seo?.meta_keywords
      ? seo.meta_keywords.split(",").map((k) => k.trim())
      : ["استشارات", "خدمات استشارية", "شروع", "إدارة مشاريع", "جودة", "استراتيجية"],
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [services, servicesPage, testimonials] = await Promise.all([
    getServicesCached(locale),
    getServicesPageCached(locale),
    getTestimonialsCached(locale),
  ]);

  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const pageTitle = servicesPage?.title || (isAr ? "الخدمات الاستشارية والتنفيذية" : "Consulting Services");

  // Check if there is an explicit hero block or custom blocks
  const heroBlock = servicesPage?.blocks?.find((b) => b.__component === "home.hero");
  const otherBlocks = servicesPage?.blocks?.filter((b) => b.__component !== "home.hero") || [];
  const hasCtaBlock = otherBlocks.some((b) => b.__component === "home.cta-footer");

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbTitleSetter path={`/${locale}/services`} title={pageTitle} />

      {/* Hero Section */}
      {heroBlock ? (
        <HeroSection hero={heroBlock as any} locale={locale} />
      ) : (
        <section className="relative overflow-hidden pt-16 pb-14 lg:pt-24 lg:pb-20 border-b border-border/50 bg-gradient-to-b from-card/40 via-background to-background text-center">
          {/* Ambient background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-[140px]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            {servicesPage?.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{servicesPage.badge}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15] mb-6">
              {servicesPage?.heroTitle}
            </h1>

            {/* Subtitle */}
            {servicesPage?.heroSubtitle && (
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto mb-10">
                {servicesPage.heroSubtitle}
              </p>
            )}

            {/* Hero CTAs */}
            {(servicesPage?.heroPrimaryCtaText || servicesPage?.heroSecondaryCtaText) && (
              <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
                {servicesPage.heroPrimaryCtaText && (
                  <Link
                    href={servicesPage.heroPrimaryCtaLink || `/${locale}/contact`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <span>{servicesPage.heroPrimaryCtaText}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                )}
                {servicesPage.heroSecondaryCtaText && (
                  <a
                    href={servicesPage.heroSecondaryCtaLink || "#services-grid"}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-card hover:border-primary/40 focus:outline-none"
                  >
                    <span>{servicesPage.heroSecondaryCtaText}</span>
                  </a>
                )}
              </div>
            )}

            {/* Trust Metrics Bar */}
            {servicesPage?.trustMetrics && servicesPage.trustMetrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 border-t border-border/50 text-start">
                {servicesPage.trustMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{metric.value}</div>
                      <div className="text-xs font-medium text-foreground/85">{metric.label}</div>
                      {metric.subtext && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{metric.subtext}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services Showcase Grid */}
      <div id="services-grid">
        <ServicesGrid
          services={services}
          locale={locale}
          badge={servicesPage?.directoryBadge}
          title={servicesPage?.directoryTitle}
          introText={servicesPage?.directorySubtitle}
        />
      </div>

      {/* Render Dynamic Strapi Page Blocks (e.g. Challenges, Methodology/Timeline, FAQs, Testimonials) */}
      {otherBlocks.length > 0 && (
        <div className="space-y-0">
          {otherBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              locale={locale}
              testimonials={testimonials}
            />
          ))}
        </div>
      )}

      {/* Fallback Call to Action Banner if no home.cta-footer block exists */}
      {!hasCtaBlock && servicesPage?.ctaHeadline && (
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-card/30 via-card/60 to-background border-t border-border/50 text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[130px]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {servicesPage.ctaBadge && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20 mb-4">
                {servicesPage.ctaBadge}
              </span>
            )}
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              {servicesPage.ctaHeadline}
            </h2>
            {servicesPage.ctaDescription && (
              <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                {servicesPage.ctaDescription}
              </p>
            )}
            <Link
              href={servicesPage.ctaButtonLink || `/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <span>{servicesPage.ctaButtonText || (isAr ? "تواصل معنا الآن" : "Contact Us Today")}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
