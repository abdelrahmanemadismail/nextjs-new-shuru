import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getServicesCached } from "@/strapi/services";
import { getPageCached } from "@/strapi/page";
import { getTestimonialsCached } from "@/strapi/home";
import { ServicesGrid } from "@/components/services/services-grid";
import { BlockRenderer } from "@/components/page/block-renderer";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbTitleSetter } from "@/components/shared/breadcrumb-context";
import { HeroSection } from "@/components/home/hero-section";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

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
    redirect(`/${routing.defaultLocale}`);
  }

  setRequestLocale(locale);

  const [services, page, testimonials] = await Promise.all([
    getServicesCached(locale),
    getPageCached("services", locale),
    getTestimonialsCached(locale),
  ]);

  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const pageTitle = page?.title || (isAr ? "الخدمات الاستشارية والتنفيذية" : "Consulting & Execution Services");

  // Check if there is an explicit hero block or custom blocks
  const heroBlock = page?.blocks?.find((b) => b.__component === "home.hero");
  const hasServicesBlock = page?.blocks?.some((b) => b.__component === "shared.services-section");
  const otherBlocks = page?.blocks?.filter((b) => b.__component !== "home.hero") || [];
  const hasCtaBlock = otherBlocks.some((b) => b.__component === "home.cta-footer");

  const defaultTrustMetrics = isAr
    ? [
        { value: "+50", label: "برنامج تحولي ومكتب PMO مُدار", subtext: "في مختلف القطاعات الحيوية" },
        { value: "100%", label: "مواءمة مع مستهدفات رؤية 2030", subtext: "وفق أعلى معايير الحوكمة" },
        { value: "+18", label: "سنة متوسط خبرة المستشارين", subtext: "قيادات تنفيذية واستشارية" },
      ]
    : [
        { value: "+50", label: "Transformations & PMOs Managed", subtext: "Across vital economic sectors" },
        { value: "100%", label: "Vision 2030 & Regulatory Alignment", subtext: "Highest governance standards" },
        { value: "+18", label: "Years Average Consultant Experience", subtext: "Executive leaders & advisors" },
      ];

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
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAr ? "منظومة الخدمات الاستشارية والتنفيذية" : "Consulting & Execution Ecosystem"}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15] mb-6">
              {page?.title || (isAr ? "حلول وخدمات متكاملة لتحويل الاستراتيجيات إلى واقع ملموس" : "Integrated Services to Turn Strategies into Tangible Realities")}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto mb-10">
              {isAr
                ? "نقدم منظومة متكاملة من الخدمات الاستشارية والتنفيذية التي تركز على سد الفجوات التشغيلية وتحقيق الأثر المستدام للجهات الحكومية والخاصة."
                : "We provide end-to-end consulting and execution services engineered to bridge operational gaps and deliver sustainable impact for public and private organizations."}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span>{isAr ? "طلب استشارة مخصصة" : "Request a Consultation"}</span>
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <a
                href="#services-grid"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-card hover:border-primary/40 focus:outline-none"
              >
                <span>{isAr ? "استعراض الخدمات" : "Explore Services"}</span>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 border-t border-border/50 text-start">
              {defaultTrustMetrics.map((metric, idx) => (
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
          </div>
        </section>
      )}

      {/* Services Showcase Grid (rendered directly if not explicitly in blocks) */}
      {!hasServicesBlock && (
        <div id="services-grid">
          <ServicesGrid
            services={services}
            locale={locale}
          />
        </div>
      )}

      {/* Render Dynamic Strapi Page Blocks (e.g. Services Section, Challenges, Methodology/Timeline, FAQs, Testimonials, CTA) */}
      {otherBlocks.length > 0 && (
        <div className="space-y-0">
          {otherBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              locale={locale}
              testimonials={testimonials}
              services={services}
            />
          ))}
        </div>
      )}

      {/* Fallback Call to Action Banner if no home.cta-footer block exists */}
      {!hasCtaBlock && (
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-card/30 via-card/60 to-background border-t border-border/50 text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[130px]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20 mb-4">
              {isAr ? "حلول تنفيذية مخصصة" : "Tailored Execution Solutions"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              {isAr ? "هل تبحث عن شريك تنفيذي يقود مشروعك القادم بنجاح؟" : "Looking for an execution partner to lead your next initiative?"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? "تواصل مع خبرائنا لتشخيص التحديات المؤسسية وتصميم مسار استشاري وتنفيذي مخصص يحقق أهدافكم بدقة وموثوقية."
                : "Connect with our experts to diagnose operational challenges and engineer a custom execution roadmap tailored to your organizational goals."}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <span>{isAr ? "تواصل معنا الآن" : "Contact Us Today"}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
