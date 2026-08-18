import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, type StrapiSeo } from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

export interface StrapiExpertsPage {
  id: number;
  documentId?: string;
  title: string;
  badge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  deliveryModelBadge?: string;
  deliveryModelTitle?: string;
  deliveryModelSubtitle?: string;
  directoryBadge?: string;
  directoryTitle?: string;
  directorySubtitle?: string;
  ctaBadge?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
}

export const EXPERTS_PAGE_TAG = "experts-page";

async function fetchExpertsPage(locale: Locale): Promise<StrapiExpertsPage | null> {
  try {
    const params = new URLSearchParams();
    params.append("locale", locale);
    params.append("populate[blocks][populate]", "*");
    params.append("populate[seo][populate]", "*");

    // Try single type endpoint first: /api/experts-page
    let response = await fetch(`${getStrapiBaseUrl()}/api/experts-page?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { tags: [EXPERTS_PAGE_TAG] },
    });

    if (!response.ok) {
      // Fallback to /api/pages?filters[slug][$eq]=experts
      const fallbackParams = new URLSearchParams();
      fallbackParams.append("locale", locale);
      fallbackParams.append("filters[slug][$eq]", "experts");
      fallbackParams.append("populate[blocks][populate]", "*");
      fallbackParams.append("populate[seo][populate]", "*");

      response = await fetch(`${getStrapiBaseUrl()}/api/pages?${fallbackParams.toString()}`, {
        headers: getStrapiRequestHeaders(),
        next: { tags: [EXPERTS_PAGE_TAG] },
      });
    }

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!item) return null;

    const attrs = item.attributes || item;

    return {
      id: item.id,
      documentId: item.documentId || String(item.id),
      title: attrs.title || "",
      badge: attrs.badge,
      heroTitle: attrs.heroTitle,
      heroSubtitle: attrs.heroSubtitle,
      heroPrimaryCtaText: attrs.heroPrimaryCtaText,
      heroPrimaryCtaLink: attrs.heroPrimaryCtaLink,
      heroSecondaryCtaText: attrs.heroSecondaryCtaText,
      heroSecondaryCtaLink: attrs.heroSecondaryCtaLink,
      deliveryModelBadge: attrs.deliveryModelBadge,
      deliveryModelTitle: attrs.deliveryModelTitle,
      deliveryModelSubtitle: attrs.deliveryModelSubtitle,
      directoryBadge: attrs.directoryBadge,
      directoryTitle: attrs.directoryTitle,
      directorySubtitle: attrs.directorySubtitle,
      ctaBadge: attrs.ctaBadge,
      ctaHeadline: attrs.ctaHeadline,
      ctaDescription: attrs.ctaDescription,
      ctaButtonText: attrs.ctaButtonText,
      ctaButtonLink: attrs.ctaButtonLink,
      blocks: attrs.blocks || [],
      seo: attrs.seo,
    };
  } catch (error) {
    console.error("Error fetching experts page data:", error);
    return null;
  }
}

export const getExpertsPageCached = unstable_cache(
  async (locale: Locale) => fetchExpertsPage(locale),
  [EXPERTS_PAGE_TAG],
  {
    revalidate: 3600,
  }
);
