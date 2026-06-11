import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, extractMediaUrl, toAbsoluteUrl } from "@/lib/strapi";
import type { StrapiMedia, StrapiSeo } from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

// 1. Articles
export type StrapiArticle = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  publish_date: string;
  is_featured?: boolean;
  enable_cover_image?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
  categories?: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
  }>;
};
// 2. News
export type StrapiNewsItem = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  news_date: string;
  description?: string;
  content?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
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
  seo?: StrapiSeo;
};
// 4. Majlis
export type StrapiMajlis = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  majlis_date: string;
  description?: string;
  content?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  seo?: StrapiSeo;
  guests?: Array<{
    id: number;
    name: string;
    title?: string;
  }>;
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
  content?: string;
  is_featured?: boolean;
  cover_image?: StrapiMedia;
  video_file?: StrapiMedia;
  video_url?: string;
  audio_url?: string;
  seo?: StrapiSeo;
  guests?: Array<{
    id: number;
    name: string;
    title?: string;
  }>;
};

// Generic Fetcher
async function fetchInsightList<T>(
  endpoint: string,
  locale: Locale,
  tags: string[],
  sortField: string = "createdAt",
  extraParams: Record<string, string> = {}
): Promise<T[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);

  const hasPopulate = Object.keys(extraParams).some(k => k.startsWith("populate"));
  if (!hasPopulate) {
    params.append("populate", "cover_image");
  }

  params.append("sort[0]", `${sortField}:desc`);

  for (const [key, value] of Object.entries(extraParams)) {
    params.append(key, value);
  }

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
  async (locale: Locale) => fetchInsightList<StrapiArticle>("/api/articles", locale, [ARTICLES_TAG], "publish_date", {
    "populate[0]": "cover_image",
    "populate[1]": "categories"
  }),
  [ARTICLES_TAG],
  { revalidate: 3600, tags: [ARTICLES_TAG] }
);

const NEWS_TAG = "news-items";
export const getNewsCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiNewsItem>("/api/news-items", locale, [NEWS_TAG], "news_date"),
  [NEWS_TAG],
  { revalidate: 3600, tags: [NEWS_TAG] }
);

const MAGAZINE_TAG = "magazine-issues";
export const getMagazineIssuesCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiMagazineIssue>("/api/magazine-issues", locale, [MAGAZINE_TAG], "publish_date"),
  [MAGAZINE_TAG],
  { revalidate: 3600, tags: [MAGAZINE_TAG] }
);

const MAJLIS_TAG = "majlises";
export const getMajlisCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiMajlis>("/api/majlises", locale, [MAJLIS_TAG], "majlis_date"),
  [MAJLIS_TAG],
  { revalidate: 3600, tags: [MAJLIS_TAG] }
);

const PODCAST_TAG = "podcasts";
export const getPodcastsCached = unstable_cache(
  async (locale: Locale) => fetchInsightList<StrapiPodcast>("/api/podcasts", locale, [PODCAST_TAG], "podcast_date"),
  [PODCAST_TAG],
  { revalidate: 3600, tags: [PODCAST_TAG] }
);


export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
};

async function fetchInsightListPaginated<T>(
  endpoint: string,
  locale: Locale,
  tags: string[],
  page: number = 1,
  pageSize: number = 10,
  sortField: string = "createdAt",
  extraParams: Record<string, string> = {}
): Promise<PaginatedResult<T>> {
  const params = new URLSearchParams();
  params.append("locale", locale);

  const hasPopulate = Object.keys(extraParams).some(k => k.startsWith("populate"));
  if (!hasPopulate) {
    params.append("populate", "cover_image");
  }

  if (sortField.includes(":")) {
    params.append("sort[0]", sortField);
  } else {
    params.append("sort[0]", `${sortField}:desc`);
  }

  params.append("pagination[page]", page.toString());
  params.append("pagination[pageSize]", pageSize.toString());

  for (const [key, value] of Object.entries(extraParams)) {
    params.append(key, value);
  }

  const response = await fetch(`${getStrapiBaseUrl()}${endpoint}?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags },
  });

  if (!response.ok) {
    if (response.status === 404) return { data: [], meta: { pagination: { page, pageSize, pageCount: 0, total: 0 } } };
    throw new Error(`Failed to fetch ${endpoint} (${response.status})`);
  }

  const payload = await response.json();
  const data = (payload.data || []).map((item: any) => {
    if (item.cover_image) { item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image)); }
    return item;
  });
  const meta = payload.meta || { pagination: { page, pageSize, pageCount: 0, total: 0 } };

  return { data, meta };
}

export const getArticlesPaginatedCached = (
  locale: Locale,
  page: number = 1,
  pageSize: number = 12,
  authorId?: string,
  searchQuery?: string,
  categorySlug?: string | string[],
  sortOrder: "newest" | "oldest" = "newest"
) => {
  const categoryKey = Array.isArray(categorySlug) ? categorySlug.join(",") : (categorySlug || "all");
  const cacheKey = [
    ARTICLES_TAG,
    "paginated",
    locale,
    page.toString(),
    pageSize.toString(),
    authorId || "all",
    searchQuery || "",
    categoryKey,
    sortOrder
  ];
  return unstable_cache(
    async () => {
      const extraParams: Record<string, string> = {
        "populate[0]": "cover_image",
        "populate[1]": "categories"
      };
      if (authorId) {
        extraParams["filters[author][documentId][$eq]"] = authorId;
      }
      if (categorySlug && categorySlug !== "all") {
        if (Array.isArray(categorySlug)) {
          categorySlug.forEach((slugVal, index) => {
            extraParams[`filters[categories][slug][$in][${index}]`] = slugVal;
          });
        } else {
          extraParams["filters[categories][slug][$eq]"] = categorySlug;
        }
      }
      if (searchQuery) {
        extraParams["filters[$or][0][title][$containsi]"] = searchQuery;
        extraParams["filters[$or][1][description][$containsi]"] = searchQuery;
      }
      const sortField = sortOrder === "oldest" ? "publish_date:asc" : "publish_date:desc";
      return fetchInsightListPaginated<StrapiArticle>(
        "/api/articles",
        locale,
        [ARTICLES_TAG],
        page,
        pageSize,
        sortField,
        extraParams
      );
    },
    cacheKey,
    { revalidate: 3600, tags: [ARTICLES_TAG] }
  )();
};

export const getNewsPaginatedCached = (
  locale: Locale,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string,
  sortOrder: "newest" | "oldest" = "newest"
) => {
  const cacheKey = [
    NEWS_TAG,
    "paginated",
    locale,
    page.toString(),
    pageSize.toString(),
    searchQuery || "",
    sortOrder
  ];
  return unstable_cache(
    async () => {
      const extraParams: Record<string, string> = {};
      if (searchQuery) {
        extraParams["filters[$or][0][title][$containsi]"] = searchQuery;
        extraParams["filters[$or][1][description][$containsi]"] = searchQuery;
      }
      const sortField = sortOrder === "oldest" ? "news_date:asc" : "news_date:desc";
      return fetchInsightListPaginated<StrapiNewsItem>(
        "/api/news-items",
        locale,
        [NEWS_TAG],
        page,
        pageSize,
        sortField,
        extraParams
      );
    },
    cacheKey,
    { revalidate: 3600, tags: [NEWS_TAG] }
  )();
};

export const getMagazineIssuesPaginatedCached = (
  locale: Locale,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string,
  sortOrder: "newest" | "oldest" = "newest"
) => {
  const cacheKey = [
    MAGAZINE_TAG,
    "paginated",
    locale,
    page.toString(),
    pageSize.toString(),
    searchQuery || "",
    sortOrder
  ];
  return unstable_cache(
    async () => {
      const extraParams: Record<string, string> = {};
      if (searchQuery) {
        extraParams["filters[$or][0][title][$containsi]"] = searchQuery;
        extraParams["filters[$or][1][description][$containsi]"] = searchQuery;
      }
      const sortField = sortOrder === "oldest" ? "publish_date:asc" : "publish_date:desc";
      return fetchInsightListPaginated<StrapiMagazineIssue>(
        "/api/magazine-issues",
        locale,
        [MAGAZINE_TAG],
        page,
        pageSize,
        sortField,
        extraParams
      );
    },
    cacheKey,
    { revalidate: 3600, tags: [MAGAZINE_TAG] }
  )();
};

export const getMajlisPaginatedCached = (
  locale: Locale,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string,
  sortOrder: "newest" | "oldest" = "newest"
) => {
  const cacheKey = [
    MAJLIS_TAG,
    "paginated",
    locale,
    page.toString(),
    pageSize.toString(),
    searchQuery || "",
    sortOrder
  ];
  return unstable_cache(
    async () => {
      const extraParams: Record<string, string> = {};
      if (searchQuery) {
        extraParams["filters[$or][0][title][$containsi]"] = searchQuery;
        extraParams["filters[$or][1][description][$containsi]"] = searchQuery;
      }
      const sortField = sortOrder === "oldest" ? "majlis_date:asc" : "majlis_date:desc";
      return fetchInsightListPaginated<StrapiMajlis>(
        "/api/majlises",
        locale,
        [MAJLIS_TAG],
        page,
        pageSize,
        sortField,
        extraParams
      );
    },
    cacheKey,
    { revalidate: 3600, tags: [MAJLIS_TAG] }
  )();
};

export const getPodcastsPaginatedCached = (
  locale: Locale,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string,
  sortOrder: "newest" | "oldest" = "newest"
) => {
  const cacheKey = [
    PODCAST_TAG,
    "paginated",
    locale,
    page.toString(),
    pageSize.toString(),
    searchQuery || "",
    sortOrder
  ];
  return unstable_cache(
    async () => {
      const extraParams: Record<string, string> = {};
      if (searchQuery) {
        extraParams["filters[$or][0][title][$containsi]"] = searchQuery;
        extraParams["filters[$or][1][description][$containsi]"] = searchQuery;
      }
      const sortField = sortOrder === "oldest" ? "podcast_date:asc" : "podcast_date:desc";
      return fetchInsightListPaginated<StrapiPodcast>(
        "/api/podcasts",
        locale,
        [PODCAST_TAG],
        page,
        pageSize,
        sortField,
        extraParams
      );
    },
    cacheKey,
    { revalidate: 3600, tags: [PODCAST_TAG] }
  )();
};

export type StrapiAuthor = {
  id: number;
  documentId: string;
  name: string;
  jobTitle?: string;
  organization?: string;
  linkedin_url?: string;
  avatar?: StrapiMedia;
};

export type StrapiArticleDetail = StrapiArticle & {
  blocks?: StrapiPageBlock[];
  author?: StrapiAuthor;
  enable_cover_image?: boolean;
};

async function fetchArticleBySlug(slug: string, locale: Locale): Promise<StrapiArticleDetail | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[blocks][populate]", "*");
  params.append("populate[author][populate][avatar]", "true");
  params.append("populate[categories][fields][0]", "name");
  params.append("populate[categories][fields][1]", "slug");

  const response = await fetch(`${getStrapiBaseUrl()}/api/articles?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [ARTICLES_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch article ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const article = payload.data?.[0];
  if (!article) return null;

  if (article.cover_image) {
    article.cover_image.url = toAbsoluteUrl(extractMediaUrl(article.cover_image));
  }

  if (article.author?.avatar) {
    article.author.avatar.url = toAbsoluteUrl(extractMediaUrl(article.author.avatar));
  }

  // Also normalize media inside blocks if needed, matching `normalizePage` from page.ts
  // Though wait, does normalizePage from page.ts export its normalization function? Let's check!

  return article as StrapiArticleDetail;
}

export const getArticleBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchArticleBySlug(slug, locale),
  [ARTICLES_TAG],
  { revalidate: 3600 }
);

export type StrapiMagazineIssueDetail = StrapiMagazineIssue & {
  seo?: StrapiSeo;
  pdf_attachment?: StrapiMedia;
  articles?: StrapiArticle[];
};

async function fetchMagazineIssueBySlug(slug: string, locale: Locale): Promise<StrapiMagazineIssueDetail | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[pdf_attachment]", "true");
  params.append("populate[articles][populate][cover_image]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/magazine-issues?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [MAGAZINE_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch magazine issue ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const issue = payload.data?.[0];
  if (!issue) return null;

  if (issue.cover_image) {
    issue.cover_image.url = toAbsoluteUrl(extractMediaUrl(issue.cover_image));
  }

  if (issue.pdf_attachment) {
    issue.pdf_attachment.url = toAbsoluteUrl(extractMediaUrl(issue.pdf_attachment));
  }

  if (issue.articles) {
    issue.articles = issue.articles.map((art: any) => {
      if (art.cover_image) {
        art.cover_image.url = toAbsoluteUrl(extractMediaUrl(art.cover_image));
      }
      return art;
    });
  }

  return issue as StrapiMagazineIssueDetail;
}

export const getMagazineIssueBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchMagazineIssueBySlug(slug, locale),
  [MAGAZINE_TAG],
  { revalidate: 3600 }
);

async function fetchMajlisBySlug(slug: string, locale: Locale): Promise<StrapiMajlis | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[guests]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/majlises?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [MAJLIS_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch majlis ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.cover_image) {
    item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
  }

  return item as StrapiMajlis;
}

export const getMajlisBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchMajlisBySlug(slug, locale),
  [MAJLIS_TAG],
  { revalidate: 3600 }
);

async function fetchNewsItemBySlug(slug: string, locale: Locale): Promise<StrapiNewsItem | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");

  const response = await fetch(`${getStrapiBaseUrl()}/api/news-items?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [NEWS_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch news item ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.cover_image) {
    item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
  }

  return item as StrapiNewsItem;
}

export const getNewsItemBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchNewsItemBySlug(slug, locale),
  [NEWS_TAG],
  { revalidate: 3600 }
);

async function fetchPodcastBySlug(slug: string, locale: Locale): Promise<StrapiPodcast | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[cover_image]", "true");
  params.append("populate[seo][populate]", "*");
  params.append("populate[video_file]", "true");
  params.append("populate[guests]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/podcasts?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [PODCAST_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch podcast ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.cover_image) {
    item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
  }
  if (item.video_file) {
    item.video_file.url = toAbsoluteUrl(extractMediaUrl(item.video_file));
  }

  return item as StrapiPodcast;
}

export const getPodcastBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchPodcastBySlug(slug, locale),
  [PODCAST_TAG],
  { revalidate: 3600 }
);

export type StrapiCategory = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  articles?: StrapiArticle[];
  children_categories?: StrapiCategory[];
  parent_category?: StrapiCategory;
};

async function fetchCategoryBySlug(slug: string, locale: string): Promise<StrapiCategory | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[articles][populate][cover_image]", "true");
  params.append("populate[children_categories]", "true");
  params.append("populate[parent_category]", "true");

  const response = await fetch(`${getStrapiBaseUrl()}/api/categories?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: ["categories", slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch category ${slug} (${response.status})`);
  }

  const payload = await response.json();
  const item = payload.data?.[0];
  if (!item) return null;

  if (item.articles) {
    item.articles = item.articles.map((art: any) => {
      if (art.cover_image) {
        art.cover_image.url = toAbsoluteUrl(extractMediaUrl(art.cover_image));
      }
      return art;
    });
  }

  return item as StrapiCategory;
}

export const getCategoryBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchCategoryBySlug(slug, locale),
  ["categories"],
  { revalidate: 3600 }
);

async function fetchCategoriesList(locale: string): Promise<StrapiCategory[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate[children_categories]", "true");
  params.append("populate[parent_category]", "true");
  params.append("populate[articles][populate][cover_image]", "true");
  params.append("sort[0]", "createdAt:desc");

  const response = await fetch(`${getStrapiBaseUrl()}/api/categories?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: ["categories"] },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    if (response.status === 401) return [];
    throw new Error(`Failed to fetch categories list (${response.status})`);
  }

  const payload = await response.json();
  return payload.data || [];
}

export const getCategoriesCached = unstable_cache(
  async (locale: Locale) => fetchCategoriesList(locale),
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);

async function fetchAuthor(documentId: string, locale: Locale): Promise<StrapiAuthor | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate[avatar][fields][0]", "url");

  const response = await fetch(`${getStrapiBaseUrl()}/api/authors/${documentId}?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: ["authors", documentId] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch author ${documentId} (${response.status})`);
  }

  const payload = await response.json();
  const author = payload.data;
  if (!author) return null;

  if (author.avatar) {
    author.avatar.url = toAbsoluteUrl(extractMediaUrl(author.avatar));
  }

  return author as StrapiAuthor;
}

export const getAuthorCached = (documentId: string, locale: Locale) => {
  const cacheKey = ["authors", documentId, locale];
  return unstable_cache(
    async () => fetchAuthor(documentId, locale),
    cacheKey,
    { revalidate: 3600, tags: ["authors"] }
  )();
};
