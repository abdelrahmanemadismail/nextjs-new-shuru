import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, type StrapiSeo } from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

export type ServiceTrustMetric = {
  id?: number;
  label: string;
  value: string;
  subtext?: string;
};

export interface StrapiServicesPage {
  id: number;
  documentId?: string;
  title: string;
  badge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  trustMetrics?: ServiceTrustMetric[];
  directoryBadge?: string;
  directoryTitle?: string;
  directorySubtitle?: string;
  ctaBadge?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
}

export const SERVICES_PAGE_TAG = "services-page";

const getDefaultServicesPage = (locale: Locale): StrapiServicesPage => {
  const isAr = locale === "ar";
  return {
    id: 0,
    documentId: "default-services-page",
    title: isAr ? "الخدمات الاستشارية والتنفيذية" : "Consulting & Execution Services",
    badge: isAr ? "خدمات شروع الاستشارية والتنفيذية" : "Shuru Consulting & Execution Services",
    heroTitle: isAr
      ? "حلول وخدمات متكاملة لتحويل الاستراتيجيات إلى واقع ملموس"
      : "Integrated Services to Turn Strategies into Tangible Realities",
    heroSubtitle: isAr
      ? "نقدم منظومة متكاملة من الخدمات الاستشارية والتنفيذية التي تركز على سد الفجوات التشغيلية وتحقيق الأثر المستدام للجهات الحكومية والخاصة."
      : "We offer end-to-end consulting and execution services engineered to bridge operational gaps and deliver sustainable impact for public and private organizations.",
    heroPrimaryCtaText: isAr ? "طلب استشارة مخصصة" : "Request a Consultation",
    heroPrimaryCtaLink: "/contact",
    heroSecondaryCtaText: isAr ? "استعراض مسارات الخدمات" : "Explore Service Tracks",
    heroSecondaryCtaLink: "#services-grid",
    trustMetrics: isAr
      ? [
          { value: "+50", label: "برنامج تحولي ومكتب PMO مُدار", subtext: "في مختلف القطاعات" },
          { value: "100%", label: "مواءمة مع مستهدفات رؤية 2030", subtext: "حوكمة ومعايير دولية" },
          { value: "+18", label: "سنة متوسط خبرة المستشارين", subtext: "كفاءات تنفيذية متخصصة" },
        ]
      : [
          { value: "+50", label: "Transformations & PMOs Managed", subtext: "Across key sectors" },
          { value: "100%", label: "Vision 2030 Aligned", subtext: "International standards" },
          { value: "+18", label: "Years Avg. Consultant Experience", subtext: "Specialized leaders" },
        ],
    directoryBadge: isAr ? "مسارات الخدمات الاستشارية" : "Consulting Tracks",
    directoryTitle: isAr ? "خدماتنا الاستشارية المتكاملة" : "Our Integrated Consulting Tracks",
    directorySubtitle: isAr
      ? "خدمات استشارية وتنفيذية متخصصة تُغطي أبرز احتياجات التطوير المؤسسي وسد الفجوات التشغيلية — انقر على أي خدمة للاطلاع على نطاق العمل والتفاصيل الكاملة."
      : "Specialized consulting tracks engineered to bridge operational gaps — click on any service to explore detailed scope and deliverables.",
    ctaBadge: isAr ? "حلول تنفيذية مخصصة" : "Tailored Execution Solutions",
    ctaHeadline: isAr
      ? "هل تبحث عن شريك تنفيذي يقود مشروعك القادم بنجاح؟"
      : "Looking for an execution partner to lead your next initiative?",
    ctaDescription: isAr
      ? "تواصل مع خبرائنا لتشخيص التحديات المؤسسية وتصميم مسار استشاري وتنفيذي مخصص يحقق أهدافكم بدقة وموثوقية."
      : "Connect with our experts to diagnose operational challenges and engineer a custom execution roadmap tailored to your organizational goals.",
    ctaButtonText: isAr ? "احجز جلسة استكشافية الآن" : "Book a Discovery Session",
    ctaButtonLink: "/contact",
    blocks: [],
    seo: {
      meta_title: isAr ? "الخدمات الاستشارية والتنفيذية | شروع" : "Consulting & Execution Services | Shuru",
      meta_description: isAr
        ? "منظومة متكاملة من الخدمات الاستشارية والتنفيذية في مكاتب إدارة المشاريع PMO، التخطيط الاستراتيجي، التميز المؤسسي، التحول الرقمي، وإدارة التغيير."
        : "Integrated consulting and execution tracks in PMO development, strategic planning, institutional excellence, digital transformation, and change management.",
      meta_keywords: isAr
        ? "خدمات استشارية, إدارة مشاريع, PMO, استراتيجية, تميز مؤسسي, تحول رقمي, شروع, استشارات السعودية"
        : "consulting services, execution excellence, PMO, strategy, digital transformation, Shuru, Saudi consulting",
    },
  };
};

async function fetchServicesPage(locale: Locale): Promise<StrapiServicesPage> {
  const fallback = getDefaultServicesPage(locale);

  try {
    const params = new URLSearchParams();
    params.append("locale", locale);
    params.append("populate[blocks][populate]", "*");
    params.append("populate[trustMetrics]", "*");
    params.append("populate[seo][populate]", "*");

    // 1. Try single type endpoint first: /api/services-page
    let response = await fetch(`${getStrapiBaseUrl()}/api/services-page?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { revalidate: 60, tags: [SERVICES_PAGE_TAG, `${SERVICES_PAGE_TAG}-${locale}`] },
    });

    // 2. Fallback to /api/pages?filters[slug][$eq]=services
    if (!response.ok) {
      const fallbackParams = new URLSearchParams();
      fallbackParams.append("locale", locale);
      fallbackParams.append("filters[slug][$eq]", "services");
      fallbackParams.append("populate[blocks][populate]", "*");
      fallbackParams.append("populate[trustMetrics]", "*");
      fallbackParams.append("populate[seo][populate]", "*");

      response = await fetch(`${getStrapiBaseUrl()}/api/pages?${fallbackParams.toString()}`, {
        headers: getStrapiRequestHeaders(),
        next: { revalidate: 60, tags: [SERVICES_PAGE_TAG, `${SERVICES_PAGE_TAG}-${locale}`] },
      });
    }

    if (!response.ok) {
      return fallback;
    }

    const payload = await response.json();
    const item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!item) return fallback;

    const attrs = item.attributes || item;

    // Check if overview block exists in blocks
    const overviewBlock = attrs.blocks?.find((b: any) => b.__component === "home.overview");
    const heroBlock = attrs.blocks?.find((b: any) => b.__component === "home.hero");

    return {
      id: item.id || fallback.id,
      documentId: item.documentId || String(item.id || fallback.documentId),
      title: attrs.title || fallback.title,
      badge: attrs.badge || heroBlock?.badgeText || fallback.badge,
      heroTitle: attrs.heroTitle || heroBlock?.title || fallback.heroTitle,
      heroSubtitle: attrs.heroSubtitle || heroBlock?.subtitle || fallback.heroSubtitle,
      heroPrimaryCtaText: attrs.heroPrimaryCtaText || heroBlock?.primaryCtaText || fallback.heroPrimaryCtaText,
      heroPrimaryCtaLink: attrs.heroPrimaryCtaLink || heroBlock?.primaryCtaLink || fallback.heroPrimaryCtaLink,
      heroSecondaryCtaText: attrs.heroSecondaryCtaText || heroBlock?.secondaryCtaText || fallback.heroSecondaryCtaText,
      heroSecondaryCtaLink: attrs.heroSecondaryCtaLink || heroBlock?.secondaryCtaLink || fallback.heroSecondaryCtaLink,
      trustMetrics: (attrs.trustMetrics && attrs.trustMetrics.length > 0) ? attrs.trustMetrics : fallback.trustMetrics,
      directoryBadge: attrs.directoryBadge || overviewBlock?.badge || fallback.directoryBadge,
      directoryTitle: attrs.directoryTitle || overviewBlock?.title || fallback.directoryTitle,
      directorySubtitle: attrs.directorySubtitle || overviewBlock?.introText || fallback.directorySubtitle,
      ctaBadge: attrs.ctaBadge || fallback.ctaBadge,
      ctaHeadline: attrs.ctaHeadline || fallback.ctaHeadline,
      ctaDescription: attrs.ctaDescription || fallback.ctaDescription,
      ctaButtonText: attrs.ctaButtonText || fallback.ctaButtonText,
      ctaButtonLink: attrs.ctaButtonLink || fallback.ctaButtonLink,
      blocks: attrs.blocks || [],
      seo: attrs.seo || fallback.seo,
    };
  } catch (error) {
    console.error("Error fetching services page data from Strapi:", error);
    return fallback;
  }
}

export const getServicesPageCached = unstable_cache(
  async (locale: Locale) => fetchServicesPage(locale),
  [SERVICES_PAGE_TAG],
  {
    revalidate: 60,
  }
);
