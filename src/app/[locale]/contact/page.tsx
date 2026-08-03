import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/page/contact-form";
import { buildMetadata } from "@/lib/seo";
import { type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20 pb-28 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-4 border border-primary/20">
          <span>{isAr ? 'جلسة تشخيصية تخصصية' : 'Specialized Diagnostic Session'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          {isAr ? 'احجز جلسة تشخيص مع خبراء التنفيذ' : 'Book a Diagnostic Session with Execution Experts'}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'حدد نوع جهتك والتحدي الحالي، وسيقوم فريقنا بدراسة وضعكم واقتراح المسار التشغيلي والحلول المناسبة.'
            : 'Specify your entity type and current challenges. Our team will review your situation and propose the optimal operational roadmap.'}
        </p>
      </div>
      <div className="bg-card p-6 sm:p-10 rounded-3xl shadow-xl border border-border/70 backdrop-blur-sm">
        <ContactForm />
      </div>
    </div>
  );
}
