import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, type StrapiSeo } from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

export interface StrapiRequestInfoPage {
  id: number;
  documentId?: string;
  title: string;
  badge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  workflowBadge?: string;
  workflowTitle?: string;
  workflowStep1Number?: string;
  workflowStep1Title?: string;
  workflowStep1Desc?: string;
  workflowStep2Number?: string;
  workflowStep2Title?: string;
  workflowStep2Desc?: string;
  workflowStep3Number?: string;
  workflowStep3Title?: string;
  workflowStep3Desc?: string;
  consentText?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
}

export const REQUEST_INFO_PAGE_TAG = "request-info-page";

async function fetchRequestInfoPage(locale: Locale): Promise<StrapiRequestInfoPage | null> {
  try {
    const params = new URLSearchParams();
    params.append("locale", locale);
    params.append("populate[blocks][populate]", "*");
    params.append("populate[seo][populate]", "*");

    // 1. Try /api/request-info-page
    let response = await fetch(`${getStrapiBaseUrl()}/api/request-info-page?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { tags: [REQUEST_INFO_PAGE_TAG] },
    });

    // 2. Try /api/info-request-page
    if (!response.ok) {
      response = await fetch(`${getStrapiBaseUrl()}/api/info-request-page?${params.toString()}`, {
        headers: getStrapiRequestHeaders(),
        next: { tags: [REQUEST_INFO_PAGE_TAG] },
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
      workflowBadge: attrs.workflowBadge,
      workflowTitle: attrs.workflowTitle,
      workflowStep1Number: attrs.workflowStep1Number,
      workflowStep1Title: attrs.workflowStep1Title,
      workflowStep1Desc: attrs.workflowStep1Desc,
      workflowStep2Number: attrs.workflowStep2Number,
      workflowStep2Title: attrs.workflowStep2Title,
      workflowStep2Desc: attrs.workflowStep2Desc,
      workflowStep3Number: attrs.workflowStep3Number,
      workflowStep3Title: attrs.workflowStep3Title,
      workflowStep3Desc: attrs.workflowStep3Desc,
      consentText: attrs.consentText,
      blocks: attrs.blocks || [],
      seo: attrs.seo,
    };
  } catch (error) {
    console.error("Error fetching request-info page data:", error);
    return null;
  }
}

export const getRequestInfoPageCached = unstable_cache(
  async (locale: Locale) => fetchRequestInfoPage(locale),
  [REQUEST_INFO_PAGE_TAG],
  {
    revalidate: 3600,
  }
);
