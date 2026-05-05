import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getArticleBySlugCached } from "@/strapi/insights";
import { BlockRenderer } from "@/components/page/block-renderer";
import { ArticleLayout } from "@/components/insights/article-layout";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlugCached(slug, locale);

  if (!article) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: article.seo?.meta_title || article.title,
    description: article.seo?.meta_description || undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlugCached(slug, locale);
  if (!article) {
    notFound();
  }

  // Pass an empty testimonials array since generic blocks might require it but usually don't if they aren't the testimonial block
  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Article Header */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{article.title}</h1>
        {article.publish_date && (
          <p className="text-sm text-neutral-500 mb-8">
            {new Date(article.publish_date).toLocaleDateString(locale)}
          </p>
        )}

        {article.enable_cover_image !== false && article.cover_image?.url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12">
            <Image
              src={article.cover_image.url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* Article Blocks & Layout */}
      <ArticleLayout author={article.author}>
        {article.blocks?.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            locale={locale}
            testimonials={[]}
          />
        ))}
      </ArticleLayout>
    </div>
  );
}
