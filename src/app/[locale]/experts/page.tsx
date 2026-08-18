import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { locales, type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getExperts } from "@/strapi/experts";
import { getPageCached } from "@/strapi/page";
import { getTestimonialsCached } from "@/strapi/home";
import { DeliveryModelSection } from "@/components/experts/delivery-model-section";
import { ExpertsGrid } from "@/components/experts/experts-grid";
import { ExpertsHero } from "@/components/experts/experts-hero";
import { BlockRenderer } from "@/components/page/block-renderer";

type ExpertsPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: ExpertsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const pageData = await getPageCached("experts", locale);
  const heroBlock = pageData?.blocks?.find((b) => b.__component === "home.hero");

  const isAr = locale === "ar";
  const defaultTitle = isAr
    ? "شبكة الخبراء والمستشارين التنفيذيين | شروع"
    : "Network of Senior Experts & Advisors | Shuru";
  const defaultDesc = isAr
    ? "نخبة من المستشارين والخبراء التنفيذيين المتخصصين في قيادة التحول، وبناء مكاتب إدارة المشاريع PMO، والحوكمة، والذكاء المؤسسي."
    : "A premier network of executive consultants and subject matter experts specializing in transformation leadership, PMO, and governance.";

  return buildMetadata({
    locale,
    path: "/experts",
    title: pageData?.seo?.meta_title || heroBlock?.title || defaultTitle,
    description: pageData?.seo?.meta_description || heroBlock?.subtitle || defaultDesc,
    keywords: pageData?.seo?.meta_keywords
      ? pageData.seo.meta_keywords.split(",").map((s) => s.trim())
      : undefined,
    ogType: "hero",
    cta1: heroBlock?.primaryCtaText || (isAr ? "طلب استشارة" : "Request Consultation"),
    cta2: heroBlock?.secondaryCtaText || (isAr ? "استكشاف الخبراء" : "Explore Experts"),
  });
}

export default async function ExpertsPage({ params }: ExpertsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  setRequestLocale(locale);

  const [pageData, experts, testimonials] = await Promise.all([
    getPageCached("experts", locale),
    getExperts(locale),
    getTestimonialsCached(locale),
  ]);

  const heroBlock = pageData?.blocks?.find((b) => b.__component === "home.hero");
  const timelineBlock = pageData?.blocks?.find((b) => b.__component === "shared.timeline-section");
  const otherBlocks = pageData?.blocks?.filter(
    (b) => b.__component !== "home.hero" && b.__component !== "shared.timeline-section"
  ) || [];

  return (
    <main className="flex-1 bg-background">
      {/* 1. Hero Section */}
      <ExpertsHero
        locale={locale}
        badgeText={heroBlock?.badgeText}
        title={heroBlock?.title}
        subtitle={heroBlock?.subtitle}
        primaryCtaText={heroBlock?.primaryCtaText}
        primaryCtaLink={heroBlock?.primaryCtaLink}
        secondaryCtaText={heroBlock?.secondaryCtaText}
        secondaryCtaLink={heroBlock?.secondaryCtaLink || "#experts-directory"}
      />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl space-y-16">
        {/* 2. Structured 4-Tier Delivery Model */}
        {timelineBlock ? (
          <BlockRenderer block={timelineBlock} locale={locale} testimonials={testimonials} />
        ) : (
          <DeliveryModelSection locale={locale} />
        )}

        {/* 3. Experts Directory & Interactive Filter Grid */}
        <ExpertsGrid experts={experts} locale={locale} />

        {/* 4. Additional Dynamic Strapi Blocks (e.g. Challenges, FAQs, Quote, CTA) */}
        {otherBlocks.map((block) => (
          <div key={block.id} className="pt-4">
            <BlockRenderer block={block} locale={locale} testimonials={testimonials} />
          </div>
        ))}
      </div>
    </main>
  );
}
