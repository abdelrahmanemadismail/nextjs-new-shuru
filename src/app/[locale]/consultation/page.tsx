import { setRequestLocale, getTranslations } from "next-intl/server";
import { ConsultationForm } from "@/components/page/consultation-form";
import { PageContent } from "@/components/page/page-content";
import { locales, type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getPageCached } from "@/strapi/page";

type ConsultationPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: ConsultationPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? (rawLocale as Locale) : defaultLocale;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: "consultation" }),
    getPageCached("consultation", locale).catch(() => null),
  ]);

  return buildMetadata({
    locale,
    path: "/consultation",
    title: page?.seo?.meta_title || page?.title || t("title"),
    description: page?.seo?.meta_description || t("description"),
    keywords: page?.seo?.meta_keywords
      ? page.seo.meta_keywords.split(",").map((s) => s.trim())
      : undefined,
  });
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? (rawLocale as Locale) : defaultLocale;
  setRequestLocale(locale);

  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: "consultation" }),
    getPageCached("consultation", locale).catch(() => null),
  ]);

  const heroBlock = page?.blocks?.find((b) => b.__component === "home.hero") as any;
  const otherBlocks = page?.blocks?.filter((b) => b.__component !== "home.hero") || [];

  const titleText = page?.title || heroBlock?.title || t("title");
  const descText = heroBlock?.subtitle || t("description");

  return (
    <div className="container mx-auto px-4 py-24 pb-32 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{titleText}</h1>
        <p className="text-muted-foreground text-lg">{descText}</p>
      </div>
      <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
        <ConsultationForm />
      </div>

      {otherBlocks.length > 0 && (
        <div className="mt-16">
          <PageContent
            page={{ ...page!, blocks: otherBlocks }}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
