'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/ui/pagination-controls';
import type { PaginationMeta } from '@/strapi/insights';
import { type Locale } from '@/lib/i18n';
import { InsightsHero } from './insights-hero';
import { ArticlesGrid } from './articles-grid';
import { NewsGrid } from './news-grid';
import { MagazineGrid } from './magazine-grid';
import { MajlisGrid } from './majlis-grid';
import type { StrapiArticle, StrapiNewsItem, StrapiMagazineIssue, StrapiMajlis, StrapiPodcast } from '@/strapi/insights';

type InsightsContentProps = {
  activeTab?: string;
  currentPage?: number;
  meta?: Record<string, { pagination: PaginationMeta }>;
  locale: Locale;
  articles: StrapiArticle[];
  news: StrapiNewsItem[];
  magazines: StrapiMagazineIssue[];
  majlises: StrapiMajlis[];
  podcasts: StrapiPodcast[]; // Provide if you have a grid for it, otherwise we leave empty array
};

const defaultLabels = {
  en: {
    badge: 'Knowledge Hub',
    title: 'Explore Our Insights',
    subtitle: 'Stay updated with the latest articles, news, and perspectives.',
    articles: 'Articles',
    news: 'News',
    magazine: 'Magazine',
    majlis: 'Majlis',
    // podcasts: 'Podcasts',
  },
  ar: {
    badge: 'مركز المعرفة',
    title: 'استكشف رؤيتنا',
    subtitle: 'ابق على اطلاع بأحدث المقالات والأخبار والرؤى.',
    articles: 'مقالات',
    news: 'أخبار',
    magazine: 'مجلة',
    majlis: 'مجلس',
    // podcasts: 'بودكاست',
  }
};

export function InsightsContent({
  activeTab: initialTab = 'articles',
  currentPage = 1,
  meta,
  locale,
  articles,
  news,
  magazines,
  majlises,
  // podcasts
}: InsightsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);


  // When tab changes, we want to update the URL so we get page 1 for the new tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const labels = defaultLabels[locale] || defaultLabels['en'];

  return (
    <>
      <InsightsHero
        locale={locale}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        labels={labels}
      />
      <div className="container mx-auto px-4 pb-24 pt-12">
        {activeTab === 'articles' && <ArticlesGrid articles={articles} locale={locale} labels={labels} />}
        {activeTab === 'news' && <NewsGrid news={news} locale={locale} labels={labels} />}
        {activeTab === 'magazine' && <MagazineGrid issues={magazines} locale={locale} labels={labels} />}
        {activeTab === 'majlis' && <MajlisGrid majlises={majlises} locale={locale} labels={labels} />}
        {/* {activeTab === 'podcasts' && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            Podcasts coming soon...
          </div>
        )} */}

        {meta && meta[activeTab] && meta[activeTab].pagination.pageCount > 1 && (
          <PaginationControls
            currentPage={currentPage}
            pageCount={meta[activeTab].pagination.pageCount}
          />
        )}
      </div>
    </>
  );
}