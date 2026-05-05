import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getMagazineIssueBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import { ArticlesGrid } from "@/components/insights/articles-grid";
import ReactMarkdown from 'react-markdown';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: issue.seo?.meta_title || issue.title,
    description: issue.seo?.meta_description || issue.description || undefined,
  };
}

export default async function MagazineIssuePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const issue = await getMagazineIssueBySlugCached(slug, locale);
  if (!issue) {
    notFound();
  }

  const labels = {
    empty: locale === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found here.',
    readMore: locale === 'ar' ? 'اقرأ المزيد' : 'Read More',
    featured: locale === 'ar' ? 'مميز' : 'Featured',
  };

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Magazine Issue Header */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{issue.title}</h1>
        {issue.publish_date && (
          <p className="text-sm text-neutral-500 mb-8">
            {new Date(issue.publish_date).toLocaleDateString(locale)}
          </p>
        )}

        {issue.cover_image?.url && (
          <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] rounded-xl overflow-hidden mb-12 shadow-lg">
            <Image
              src={issue.cover_image.url}
              alt={issue.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* Overview and Content */}
      <section className="container mx-auto px-4 max-w-4xl">
        {issue.description && (
          <div className="prose prose-neutral md:prose-lg mb-12 max-w-none">
            <ReactMarkdown>{issue.description}</ReactMarkdown>
          </div>
        )}

        {issue.pdf_attachment?.url && (
          <div className="mb-16 text-center">
            <a
              href={issue.pdf_attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              {locale === 'ar' ? 'تحميل المجلة (PDF)' : 'Download Magazine (PDF)'}
            </a>
          </div>
        )}

        {issue.articles && issue.articles.length > 0 && (
          <div className="mt-16 pt-16 border-t border-neutral-200">
            <h2 className="text-2xl font-bold mb-8">
              {locale === 'ar' ? 'مقالات هذا العدد' : 'Articles in this issue'}
            </h2>
            <ArticlesGrid articles={issue.articles} locale={locale} labels={labels} />
          </div>
        )}
      </section>
    </div>
  );
}
