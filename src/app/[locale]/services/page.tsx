import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getServicesCached } from "@/strapi/services";
import { getPageCached } from "@/strapi/page";
import { getTestimonialsCached } from "@/strapi/home";
import { ServicesGrid } from "@/components/services/services-grid";
import { PageContent } from "@/components/page/page-content";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbTitleSetter } from "@/components/shared/breadcrumb-context";
import { HeroSection } from "@/components/home/hero-section";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const page = await getPageCached("services", locale);

  const isAr = locale === "ar";
  const defaultTitle = isAr
    ? "الخدمات الاستشارية والتنفيذية | شروع"
    : "Consulting & Execution Services | Shuru";
  const defaultDesc = isAr
    ? "منظومة متكاملة من الخدمات الاستشارية والتنفيذية في الجودة، الاستراتيجية، إدارة المشاريع PMO، التحول الرقمي، وإدارة التغيير."
    : "Integrated consulting and execution services in quality excellence, strategic planning, PMO, digital transformation, and change management.";

  const seo = page?.seo;

  return buildMetadata({
    locale,
    path: "/services",
    title: seo?.meta_title || page?.title || defaultTitle,
    description: seo?.meta_description || defaultDesc,
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

  const [services, page, testimonials] = await Promise.all([
    getServicesCached(locale),
    getPageCached("services", locale),
    getTestimonialsCached(locale),
  ]);

  const isAr = locale === "ar";
  const pageTitle = page?.title || (isAr ? "الخدمات الاستشارية" : "Consulting Services");

  // If page from Strapi has a hero block, extract it; otherwise fallback hero
  const heroBlock = page?.blocks?.find((b) => b.__component === "home.hero");
  const otherBlocks = page?.blocks?.filter((b) => b.__component !== "home.hero") || [];

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbTitleSetter path={`/${locale}/services`} title={pageTitle} />

      {/* Hero Section */}
      {heroBlock ? (
        <HeroSection hero={heroBlock as any} locale={locale} />
      ) : (
        <section className="relative overflow-hidden pt-16 pb-12 lg:pt-24 lg:pb-16 border-b border-border/50 bg-gradient-to-b from-card/30 via-background to-background text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-primary/10 blur-[130px]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
              {isAr ? "خدمات شروع الاستشارية والتنفيذية" : "Shuru Consulting & Execution Services"}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight mb-6">
              {isAr
                ? "حلول وخدمات متكاملة لتحويل الاستراتيجيات إلى واقع ملموس"
                : "Integrated Services to Turn Strategy into Reality"}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              {isAr
                ? "نقدم منظومة متكاملة من الخدمات الاستشارية والتنفيذية التي تركز على سد الفجوات التشغيلية وتحقيق الأثر المستدام للجهات الحكومية والخاصة."
                : "We offer end-to-end consulting and execution services engineered to bridge operational gaps and deliver sustainable impact."}
            </p>
          </div>
        </section>
      )}

      {/* Services Showcase Grid (Inspired by empower-sa cards showcase) */}
      <ServicesGrid
        services={services}
        locale={locale}
        badge={isAr ? "مسارات الخدمات الاستشارية" : "Consulting Tracks"}
        title={isAr ? "خدماتنا الاستشارية المتكاملة" : "Our Integrated Consulting Services"}
        introText={
          isAr
            ? "ست خدمات استشارية متخصصة تُغطي أبرز احتياجات التطوير المؤسسي — انقر على أي خدمة للاطلاع على نطاق العمل والتفاصيل الكاملة."
            : "Specialized consulting tracks engineered to bridge operational gaps — click on any service to explore detailed scope and deliverables."
        }
      />

      {/* Render additional Strapi page blocks if configured (e.g. Why choose Shuru, FAQs, Testimonials, CTA) */}
      {otherBlocks.length > 0 && (
        <PageContent
          page={{ ...page!, blocks: otherBlocks }}
          locale={locale}
          testimonials={testimonials}
        />
      )}
    </main>
  );
}
