import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getNewsItemBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import { ArticleLayout } from "@/components/insights/article-layout";
import { RichTextBlock } from "@/components/shared/rich-text-block";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbTitleSetter } from "@/components/shared/breadcrumb-context";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const news = await getNewsItemBySlugCached(slug, locale);

  if (!news) {
    return { title: "Not Found" };
  }

  const seo = news.seo;
  const ogImg = (news.cover_image || seo?.og_image) as any;

  return buildMetadata({
    locale,
    path: `/insights/news/${slug}`,
    title: seo?.meta_title || news.title,
    description: seo?.meta_description || news.description || undefined,
    keywords: seo?.meta_keywords ? seo.meta_keywords.split(",").map((k) => k.trim()) : undefined,
    ogImage: ogImg ? {
      url: ogImg.url,
      width: ogImg.width,
      height: ogImg.height,
      alt: ogImg.alternativeText,
    } : undefined,
    type: "article",
  });
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const news = await getNewsItemBySlugCached(slug, locale);
  if (!news) {
    redirect(`/${locale}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/news/${news.slug}`;

  const blocks = news.content ? [{ __component: "shared.rich-text" as const, id: 1, body: news.content }] : [];

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      <BreadcrumbTitleSetter path={`/${locale}/insights/news/${news.slug}`} title={news.title} />
      {/* News Header */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{news.title}</h1>
        {news.news_date && (
          <p className="text-sm text-neutral-500 mb-8">
            {new Date(news.news_date).toLocaleDateString(locale)}
          </p>
        )}

        {news.cover_image?.url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 bg-neutral-100">
            <Image
              src={news.cover_image.url}
              alt={news.title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* News Content */}
      <ArticleLayout
        shareUrl={pageUrl}
        shareTitle={news.title}
        locale={locale}
      >
        {blocks.map((block) => (
          <RichTextBlock key={block.id} block={block} />
        ))}
      </ArticleLayout>
    </div>
  );
}