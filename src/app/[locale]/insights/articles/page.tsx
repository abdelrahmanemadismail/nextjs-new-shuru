import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getArticlesPaginatedCached } from "@/strapi/insights";
import Link from "next/link";
import { PaginationControls } from "@/components/ui/pagination-controls";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const current_page = isNaN(page) || page < 1 ? 1 : page;

  const { data: articles, meta } = await getArticlesPaginatedCached(locale, current_page, 9); // 9 articles per page for a 3-column grid
  const t = await getTranslations({ locale, namespace: 'insights' });

  return (
    <main className="container py-24 mx-auto px-4">
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{t('tabs.articles')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('tabs.subtitle')}</p>
      </div>

      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/${locale}/insights/articles/${article.slug}`} className="block group">
                <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                  <div className="aspect-video bg-muted relative">
                    {article.cover_image?.url && (
                      <img
                        src={article.cover_image.url}
                        alt={article.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">{article.title}</h2>
                    {article.publish_date && (
                      <time dateTime={article.publish_date} className="text-sm text-muted-foreground mt-auto">
                        {new Date(article.publish_date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <PaginationControls pageCount={meta.pagination.pageCount} currentPage={meta.pagination.page} />
        </>
      )}
    </main>
  );
}
