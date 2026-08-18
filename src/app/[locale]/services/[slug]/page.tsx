import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getServiceBySlugCached, getServicesCached } from "@/strapi/services";
import { getTestimonialsCached } from "@/strapi/home";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { BlockRenderer } from "@/components/page/block-renderer";
import { ServicesGrid } from "@/components/services/services-grid";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbTitleSetter } from "@/components/shared/breadcrumb-context";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const service = await getServiceBySlugCached(slug, locale);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const seo = service.seo;
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: seo?.meta_title || `${service.title} | شروع`,
    description: seo?.meta_description || service.shortDescription || "",
    keywords: seo?.meta_keywords ? seo.meta_keywords.split(",").map((k) => k.trim()) : undefined,
    ogImage: seo?.og_image
      ? {
          url: seo.og_image.url,
          width: seo.og_image.width,
          height: seo.og_image.height,
          alt: seo.og_image.alternativeText,
        }
      : service.coverImage?.url
      ? {
          url: service.coverImage.url,
        }
      : undefined,
  });
}

export default async function SingleServicePage({ params }: Props) {
  const { locale, slug } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [service, allServices, testimonials] = await Promise.all([
    getServiceBySlugCached(slug, locale),
    getServicesCached(locale),
    getTestimonialsCached(locale),
  ]);

  if (!service) {
    notFound();
  }

  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Filter other services for the "Explore Other Tracks" section
  const otherServices = allServices.filter((s) => s.slug !== slug);

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbTitleSetter
        path={`/${locale}/services/${slug}`}
        title={service.title}
      />

      {/* Service Detail Hero */}
      <ServiceDetailHero service={service} locale={locale} />

      {/* Render Dynamic Blocks if populated in Strapi */}
      {service.blocks && service.blocks.length > 0 ? (
        <div>
          {service.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              locale={locale}
              testimonials={testimonials}
            />
          ))}
        </div>
      ) : (
        /* Fallback consultation CTA block if no custom blocks */
        <section className="py-16 bg-card/30 border-b border-border/50 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {isAr
                ? `جاهز لبدء مشروع ${service.title}؟`
                : `Ready to initiate your ${service.title} project?`}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xl mx-auto">
              {isAr
                ? "تواصل مع خبرائنا اليوم لتحديد نطاق العمل وجدولة جلسة استكشافية متخصصة لمنظمتك."
                : "Connect with our expert consultants today to define your scope and schedule a tailored discovery session."}
            </p>
            <Link
              href={`/${locale}/contact?service=${service.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <span>{isAr ? "احجز جلسة استشارية" : "Book a Consultation"}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Other Services Navigation / Showcase */}
      {otherServices.length > 0 && (
        <div className="bg-card/20 border-t border-border/40">
          <ServicesGrid
            services={otherServices.slice(0, 3)}
            locale={locale}
            badge={isAr ? "مسارات استشارية أخرى" : "Explore Other Tracks"}
            title={isAr ? "خدمات استشارية ذات صلة" : "Related Consulting Tracks"}
            introText={
              isAr
                ? "اطلع على بقية خدماتنا الاستشارية المتكاملة لتطوير كافة جوانب الأداء في منظمتك."
                : "Explore our comprehensive consulting tracks to accelerate performance across your organization."
            }
          />
        </div>
      )}
    </main>
  );
}
