import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getNewsCached } from "@/strapi/insights";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const newsItems = await getNewsCached(locale);

  return (
    <main className="container py-24 mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">News</h1>
      
      {newsItems.length === 0 ? (
        <p>No news found.</p>
      ) : (
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
      )}
    </main>
  );
}
