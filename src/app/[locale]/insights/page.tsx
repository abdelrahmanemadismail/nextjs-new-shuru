import {
  getArticlesPaginatedCached,
  getNewsPaginatedCached,
  getMagazineIssuesPaginatedCached,
  getMajlisPaginatedCached,
  getPodcastsPaginatedCached,
  getAuthorCached,
  getCategoriesCached
} from "@/strapi/insights";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";

import { InsightsContent } from "@/components/insights/insights-content";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);


  const sp = await searchParams;
  const tab = typeof sp.tab === 'string' ? sp.tab : 'articles';
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const current_page = isNaN(page) || page < 1 ? 1 : page;
  const authorId = typeof sp.author === 'string' ? sp.author : undefined;
  
  const searchQuery = typeof sp.q === 'string' ? sp.q : undefined;
  const categorySlug = typeof sp.category === 'string' ? sp.category : undefined;
  const sortOrder = sp.sort === 'oldest' ? 'oldest' : 'newest';

  const [author, articlesData, newsData, magazinesData, majlisesData, podcastsData, categories] = await Promise.all([
    authorId ? getAuthorCached(authorId, locale) : Promise.resolve(null),
    getArticlesPaginatedCached(locale, tab === 'articles' ? current_page : 1, 9, authorId, searchQuery, categorySlug, sortOrder),
    getNewsPaginatedCached(locale, tab === 'news' ? current_page : 1, 9, searchQuery, sortOrder),
    getMagazineIssuesPaginatedCached(locale, tab === 'magazine' ? current_page : 1, 9, searchQuery, sortOrder),
    getMajlisPaginatedCached(locale, tab === 'majlis' ? current_page : 1, 9, searchQuery, sortOrder),
    getPodcastsPaginatedCached(locale, tab === 'podcasts' ? current_page : 1, 9, searchQuery, sortOrder),
    getCategoriesCached(locale),
  ]);
  

  return (
    <main className="flex flex-col min-h-screen">
      <InsightsContent
        activeTab={tab}
        currentPage={current_page}
        meta={{
          articles: articlesData.meta,
          news: newsData.meta,
          magazines: magazinesData.meta,
          majlises: majlisesData.meta,
          podcasts: podcastsData.meta
        }}
        locale={locale}
        articles={articlesData.data}
        news={newsData.data}
        magazines={magazinesData.data}
        majlises={majlisesData.data}
        podcasts={podcastsData.data}
        author={author || undefined}
        categories={categories}
        searchQuery={searchQuery || ""}
        categorySlug={categorySlug || "all"}
        sortOrder={sortOrder}
      />
    </main>
  );
}
