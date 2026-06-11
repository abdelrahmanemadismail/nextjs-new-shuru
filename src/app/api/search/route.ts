import { NextResponse } from "next/server";
import { getStrapiBaseUrl, getStrapiRequestHeaders, extractMediaUrl, toAbsoluteUrl } from "@/lib/strapi";
import { locales, defaultLocale, type Locale } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const lang = searchParams.get("locale") || defaultLocale;

  // Validate locale
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;

  if (!query.trim()) {
    return NextResponse.json({
      articles: [],
      categories: [],
      pages: [],
      authors: [],
      magazine: [],
      news: [],
      majilis: [],
    });
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const strapiUrl = getStrapiBaseUrl();
  const headers = getStrapiRequestHeaders();

  // Helper to fetch from Strapi and handle errors safely
  const fetchStrapi = async (endpoint: string, params: string) => {
    try {
      const url = `${strapiUrl}${endpoint}?locale=${locale}&${params}`;
      const response = await fetch(url, { headers });
      if (!response.ok) {
        console.error(`Search error fetching ${endpoint}: ${response.statusText}`);
        return [];
      }
      const json = await response.json();
      return json.data || [];
    } catch (err) {
      console.error(`Search fetch failure on ${endpoint}`, err);
      return [];
    }
  };

  // Build the parallel Strapi fetches
  const [
    articles,
    categories,
    pages,
    authors,
    magazines,
    news,
    majlises,
  ] = await Promise.all([
    // 1. Articles (title)
    fetchStrapi(
      "/api/articles",
      `filters[title][$containsi]=${encodedQuery}&populate[0]=cover_image&pagination[limit]=5`
    ),
    // 2. Categories (name, description)
    fetchStrapi(
      "/api/categories",
      `filters[$or][0][name][$containsi]=${encodedQuery}&filters[$or][1][description][$containsi]=${encodedQuery}&pagination[limit]=5`
    ),
    // 3. Pages (title)
    fetchStrapi(
      "/api/pages",
      `filters[title][$containsi]=${encodedQuery}&populate[0]=seo&pagination[limit]=5`
    ),
    // 4. Authors (name, jobTitle, organization)
    fetchStrapi(
      "/api/authors",
      `filters[$or][0][name][$containsi]=${encodedQuery}&filters[$or][1][jobTitle][$containsi]=${encodedQuery}&filters[$or][2][organization][$containsi]=${encodedQuery}&populate[0]=avatar&pagination[limit]=5`
    ),
    // 5. Magazine Issues (title, description)
    fetchStrapi(
      "/api/magazine-issues",
      `filters[$or][0][title][$containsi]=${encodedQuery}&filters[$or][1][description][$containsi]=${encodedQuery}&populate[0]=cover_image&pagination[limit]=5`
    ),
    // 6. News (title, description)
    fetchStrapi(
      "/api/news-items",
      `filters[$or][0][title][$containsi]=${encodedQuery}&filters[$or][1][description][$containsi]=${encodedQuery}&populate[0]=cover_image&pagination[limit]=5`
    ),
    // 7. Majlis (title, description)
    fetchStrapi(
      "/api/majlises",
      `filters[$or][0][title][$containsi]=${encodedQuery}&filters[$or][1][description][$containsi]=${encodedQuery}&populate[0]=cover_image&pagination[limit]=5`
    ),
  ]);

  // Format and normalize the output
  return NextResponse.json({
    articles: articles.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      description: item.publish_date ? new Date(item.publish_date).toLocaleDateString(locale) : "",
      url: `/${locale}/insights/articles/${item.slug}`,
      image: toAbsoluteUrl(extractMediaUrl(item.cover_image)),
    })),
    categories: categories.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.name,
      description: item.description || "",
      url: `/${locale}/insights/categories/${item.slug}`,
      image: null,
    })),
    pages: pages.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      description: item.seo?.meta_description || "",
      url: `/${locale}/${item.slug}`,
      image: null,
    })),
    authors: authors.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.name,
      description: [item.jobTitle, item.organization].filter(Boolean).join(" • "),
      url: `/${locale}/insights?tab=articles&author=${item.documentId}`,
      image: toAbsoluteUrl(extractMediaUrl(item.avatar)),
    })),
    magazine: magazines.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      description: item.description || (item.issue_number ? `Issue ${item.issue_number}` : ""),
      url: `/${locale}/insights/magazine/${item.slug}`,
      image: toAbsoluteUrl(extractMediaUrl(item.cover_image)),
    })),
    news: news.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      description: item.description || "",
      url: `/${locale}/insights/news/${item.slug}`,
      image: toAbsoluteUrl(extractMediaUrl(item.cover_image)),
    })),
    majilis: majlises.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      description: item.description || "",
      url: `/${locale}/insights/majlis/${item.slug}`,
      image: toAbsoluteUrl(extractMediaUrl(item.cover_image)),
    })),
  });
}
