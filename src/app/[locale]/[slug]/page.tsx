import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getPageCached } from "@/strapi/page";
import { getTestimonialsCached } from "@/strapi/home";
import { PageContent } from "@/components/page/page-content";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const page = await getPageCached(slug, locale);

  if (!page) {
    return {
      title: "Not Found",
    };
  }

  const seo = page.seo;
  return {
    title: seo?.meta_title || page.title,
    description: seo?.meta_description || "",
    // We would map here seo details
  };
}

export default async function DynamicPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [page, testimonials] = await Promise.all([
    getPageCached(slug, locale),
    getTestimonialsCached(locale),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <main>
      <PageContent page={page} locale={locale} testimonials={testimonials} />
    </main>
  );
}