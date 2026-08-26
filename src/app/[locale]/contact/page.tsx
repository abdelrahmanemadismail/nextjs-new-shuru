import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/page/contact-form";
import { PageContent } from "@/components/page/page-content";
import { buildMetadata } from "@/lib/seo";
import { type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { getContactPageCached } from "@/strapi/contact-page";
import { getPageCached } from "@/strapi/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? (rawLocale as Locale) : defaultLocale;
  const [t, contactPage, genericPage] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getContactPageCached(locale).catch(() => null),
    getPageCached("contact", locale).catch(() => null),
  ]);

  const page = contactPage || genericPage;

  return buildMetadata({
    locale,
    path: "/contact",
    title: contactPage?.seo?.meta_title || contactPage?.heroTitle || page?.title || t("title"),
    description: contactPage?.seo?.meta_description || contactPage?.heroSubtitle || page?.seo?.meta_description || t("description"),
    keywords: contactPage?.seo?.meta_keywords
      ? contactPage.seo.meta_keywords.split(",").map((k) => k.trim())
      : page?.seo?.meta_keywords
      ? page.seo.meta_keywords.split(",").map((k) => k.trim())
      : undefined,
  });
}

export default async function ContactUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? (rawLocale as Locale) : defaultLocale;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const [t, contactPage, genericPage] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getContactPageCached(locale).catch(() => null),
    getPageCached("contact", locale).catch(() => null),
  ]);

  const page = contactPage || genericPage;
  const heroBlock = page?.blocks?.find((b) => b.__component === "home.hero") as any;
  const otherBlocks = page?.blocks?.filter((b) => b.__component !== "home.hero") || [];

  const badgeText = contactPage?.badge || heroBlock?.badgeText || (isAr ? "جلسة تشخيصية تخصصية" : "Specialized Diagnostic Session");
  const titleText = contactPage?.heroTitle || contactPage?.title || heroBlock?.title || page?.title || (isAr ? "احجز جلسة تشخيص مع خبراء التنفيذ" : "Book a Diagnostic Session with Execution Experts");
  const descText = contactPage?.heroSubtitle || heroBlock?.subtitle || (isAr
    ? "حدد نوع جهتك والتحدي الحالي، وسيقوم فريقنا بدراسة وضعكم واقتراح المسار التشغيلي والحلول المناسبة."
    : "Specify your entity type and current challenges. Our team will review your situation and propose the optimal operational roadmap.");

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20 pb-28 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-4 border border-primary/20">
          <span>{badgeText}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          {titleText}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {descText}
        </p>
      </div>
      <div className="bg-card p-6 sm:p-10 rounded-3xl shadow-xl border border-border/70 backdrop-blur-sm">
        <ContactForm
          step1Title={contactPage?.step1Title}
          entityTypeLabel={contactPage?.entityTypeLabel}
          entityTypeOptions={contactPage?.entityTypeOptions}
          desiredServiceLabel={contactPage?.desiredServiceLabel}
          desiredServiceOptions={contactPage?.desiredServiceOptions}
          challengeLabel={contactPage?.challengeLabel}
          challengeOptions={contactPage?.challengeOptions}
          step2Title={contactPage?.step2Title}
          fullNameLabel={contactPage?.fullNameLabel}
          emailLabel={contactPage?.emailLabel}
          phoneLabel={contactPage?.phoneLabel}
          companyLabel={contactPage?.companyLabel}
          preferredDateLabel={contactPage?.preferredDateLabel}
          messageLabel={contactPage?.messageLabel}
          submitButtonText={contactPage?.submitButtonText}
          submittingButtonText={contactPage?.submittingButtonText}
          successMessage={contactPage?.successMessage}
        />
      </div>

      {otherBlocks.length > 0 && (
        <div className="mt-16">
          <PageContent
            page={{ ...(page as any), blocks: otherBlocks }}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
