import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getNewsPaginatedCached } from "@/strapi/insights";
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

  const { data: newsItems, meta } = await getNewsPaginatedCached(locale, current_page, 9);
  const t = await getTranslations({ locale, namespace: 'insights' });

  return (
    <main className="container py-24 mx-auto px-4">
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{t('tabs.news')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('tabs.subtitle')}</p>
      </div>

      {newsItems.length === 0 ? (
        <p>No news found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((news) => (
              <Link key={news.id} href={`/${locale}/insights/news/${news.slug}`} className="block group">
                <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                  <div className="aspect-video bg-muted relative">
                    {news.cover_image?.url && (
                      <img
                        src={news.cover_image.url}
                        alt={news.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">{news.title}</h2>
                    {news.description && (
                      <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{news.description}</p>
                    )}
                    {news.news_date && (
                      <time dateTime={news.news_date} className="text-sm text-muted-foreground mt-auto">
                        {new Date(news.news_date).toLocaleDateString(locale, {
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
