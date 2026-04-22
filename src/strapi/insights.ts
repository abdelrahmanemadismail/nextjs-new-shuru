import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, extractMediaUrl, toAbsoluteUrl } from "@/lib/strapi";
import type { StrapiMedia, StrapiSeo } from "@/lib/strapi";

// 1. Articles
export type StrapiArticle = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  publish_date: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
};
// 2. News
export type StrapiNewsItem = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  news_date: string;
  description?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
};
// 3. Magazine Issues
export type StrapiMagazineIssue = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  publish_date: string;
  issue_number?: string;
  description?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
};
// 4. Majlis
export type StrapiMajlis = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  majlis_date: string;
  description?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
};
// 5. Podcast
export type StrapiPodcast = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  podcast_date: string;
  duration?: string;
  description?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
};

// Generic Fetcher
async function fetchInsightList<T>(
  endpoint: string,
  locale: Locale,
  tags: string[]
): Promise<T[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate", "cover_image");
  params.append("sort[0]", "createdAt:desc"); // Ideally sort by date field, but createdAt is safer if names differ

  const response = await fetch(`${getStrapiBaseUrl()}${endpoint}?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch ${endpoint} (${response.status})`);
  }

  const payload = await response.json();
  return (payload.data || []).map((item: any) => { if (item.cover_image) { item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image)); } return item; });
}

const ARTICLES_TAG = "articles";
export const getArticlesCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiArticle>("/api/articles", locale, [ARTICLES_TAG]),
  [ARTICLES_TAG],
  { revalidate: 3600, tags: [ARTICLES_TAG] }
);

const NEWS_TAG = "news-items";
export const getNewsCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiNewsItem>("/api/news-items", locale, [NEWS_TAG]),
  [NEWS_TAG],
  { revalidate: 3600, tags: [NEWS_TAG] }
);

const MAGAZINE_TAG = "magazine-issues";
export const getMagazineIssuesCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiMagazineIssue>("/api/magazine-issues", locale, [MAGAZINE_TAG]),
  [MAGAZINE_TAG],
  { revalidate: 3600, tags: [MAGAZINE_TAG] }
);

const MAJLIS_TAG = "majlises";
export const getMajlisCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiMajlis>("/api/majlises", locale, [MAJLIS_TAG]),
  [MAJLIS_TAG],
  { revalidate: 3600, tags: [MAJLIS_TAG] }
);

const PODCAST_TAG = "podcasts";
export const getPodcastsCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiPodcast>("/api/podcasts", locale, [PODCAST_TAG]),
  [PODCAST_TAG],
  { revalidate: 3600, tags: [PODCAST_TAG] }
);
