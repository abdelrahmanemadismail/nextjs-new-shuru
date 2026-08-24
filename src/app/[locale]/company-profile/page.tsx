import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CompanyProfileViewer } from "@/components/page/company-profile-viewer";
import { BlockRenderer } from "@/components/page/block-renderer";
import { locales, type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getCompanyProfilePageCached } from "@/strapi/company-profile-page";
import { getTestimonialsCached } from "@/strapi/home";

type CompanyProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "companyProfile" });

  const pageData = await getCompanyProfilePageCached(locale as Locale);
  const heroBlock = pageData?.blocks?.find((b) => b.__component === "home.hero");

  const title = pageData?.seo?.meta_title || pageData?.heroTitle || pageData?.title || heroBlock?.title || t("title");
  const description = pageData?.seo?.meta_description || pageData?.heroSubtitle || heroBlock?.subtitle || t("subtitle");

  return buildMetadata({
    locale,
    path: "/company-profile",
    title,
    description,
    keywords: pageData?.seo?.meta_keywords
      ? pageData.seo.meta_keywords.split(",").map((s) => s.trim())
      : undefined,
  });
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "companyProfile" });
  const [pageData, testimonials] = await Promise.all([
    getCompanyProfilePageCached(locale),
    getTestimonialsCached(locale),
  ]);

  const heroBlock = pageData?.blocks?.find((b) => b.__component === "home.hero");
  const otherBlocks = pageData?.blocks?.filter((b) => b.__component !== "home.hero") || [];

  const badgeText = pageData?.badge || heroBlock?.badgeText || t("badge");
  const heroTitle = pageData?.heroTitle || pageData?.title || heroBlock?.title || t("title");
  const heroSubtitle = pageData?.heroSubtitle || heroBlock?.subtitle || t("subtitle");

  return (
    <main className="flex-1 bg-background">
      <div className="relative overflow-hidden py-16 sm:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 border border-primary/20 backdrop-blur-sm shadow-sm">
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            {heroTitle}
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-5xl space-y-12">
        <CompanyProfileViewer
          pdfUrl={pageData?.pdfUrl || "/documents/shuru-company-profile.pdf"}
          fileName={pageData?.fileName || "shuru-company-profile.pdf"}
          fileTitle={pageData?.fileTitle}
          fileSubtitle={pageData?.fileSubtitle}
          downloadButtonText={pageData?.downloadButtonText}
          openNewTabButtonText={pageData?.openNewTabButtonText}
          shareButtonText={pageData?.shareButtonText}
          previewBadge={pageData?.previewBadge}
          pillars={pageData?.pillars}
          ctaBadge={pageData?.ctaBadge}
          ctaTitle={pageData?.ctaTitle}
          ctaSubtitle={pageData?.ctaSubtitle}
          ctaPrimaryButtonText={pageData?.ctaPrimaryButtonText}
          ctaPrimaryButtonLink={pageData?.ctaPrimaryButtonLink}
          ctaSecondaryButtonText={pageData?.ctaSecondaryButtonText}
          ctaSecondaryButtonLink={pageData?.ctaSecondaryButtonLink}
        />

        {/* Additional Dynamic Strapi Blocks (e.g. challenges, testimonials, timeline, quote, rich-text) */}
        {otherBlocks.map((block) => (
          <div key={block.id} className="pt-6">
            <BlockRenderer block={block} locale={locale} testimonials={testimonials} />
          </div>
        ))}
      </div>
    </main>
  );
}
