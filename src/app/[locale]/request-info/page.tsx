import { setRequestLocale, getTranslations } from "next-intl/server";
import { RequestInfoForm } from "@/components/page/request-info-form";
import { locales, type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getRequestInfoPageCached } from "@/strapi/request-info-page";

type RequestInfoPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: RequestInfoPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "requestInfo" });
  const pageData = await getRequestInfoPageCached(locale);

  return buildMetadata({
    locale,
    path: "/request-info",
    title: pageData?.seo?.meta_title || pageData?.heroTitle || t("title"),
    description: pageData?.seo?.meta_description || pageData?.heroSubtitle || t("description"),
    keywords: pageData?.seo?.meta_keywords
      ? pageData.seo.meta_keywords.split(",").map((s) => s.trim())
      : undefined,
  });
}

export default async function RequestInfoPage({ params }: RequestInfoPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "requestInfo" });
  const pageData = await getRequestInfoPageCached(locale);

  return (
    <main className="flex-1 bg-background">
      <div className="relative overflow-hidden py-16 sm:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 border border-primary/20 backdrop-blur-sm shadow-sm">
            <span>{pageData?.badge || t("badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            {pageData?.heroTitle || t("title")}
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {pageData?.heroSubtitle || t("description")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <RequestInfoForm
          workflowBadge={pageData?.workflowBadge}
          workflowTitle={pageData?.workflowTitle}
          workflowStep1Number={pageData?.workflowStep1Number}
          workflowStep1Title={pageData?.workflowStep1Title}
          workflowStep1Desc={pageData?.workflowStep1Desc}
          workflowStep2Number={pageData?.workflowStep2Number}
          workflowStep2Title={pageData?.workflowStep2Title}
          workflowStep2Desc={pageData?.workflowStep2Desc}
          workflowStep3Number={pageData?.workflowStep3Number}
          workflowStep3Title={pageData?.workflowStep3Title}
          workflowStep3Desc={pageData?.workflowStep3Desc}
          consentText={pageData?.consentText}
        />
      </div>
    </main>
  );
}
