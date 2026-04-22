import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getArticlesCached } from "@/strapi/insights";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const articles = await getArticlesCached(locale);

  return (
    <main className="container py-24 mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Articles</h1>
      
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} href={`/${locale}/insights/articles/${article.slug}`} className="block group">
              <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                {/* Fallback image if none */}
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
      )}
    </main>
  );
}
