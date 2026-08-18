import { setRequestLocale, getTranslations } from "next-intl/server";
import { RequestInfoForm } from "@/components/page/request-info-form";
import { locales, type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

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

  return buildMetadata({
    locale,
    path: "/request-info",
    title: t("title"),
    description: t("description"),
  });
}

export default async function RequestInfoPage({ params }: RequestInfoPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "requestInfo" });
  const isAr = locale === "ar";

  return (
    <main className="flex-1 bg-background">
      <div className="relative overflow-hidden py-16 sm:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 border border-primary/20 backdrop-blur-sm shadow-sm">
            <span>{t("badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            {t("title")}
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <RequestInfoForm />
      </div>
    </main>
  );
}
