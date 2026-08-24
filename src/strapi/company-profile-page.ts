import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import {
  getStrapiBaseUrl,
  getStrapiRequestHeaders,
  extractMediaUrl,
  toAbsoluteUrl,
  type StrapiSeo,
  type StrapiMedia,
} from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

export interface CompanyProfilePillar {
  title: string;
  description: string;
  iconName?: string;
}

export interface StrapiCompanyProfilePage {
  id: number;
  documentId?: string;
  title: string;
  badge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  fileTitle?: string;
  fileSubtitle?: string;
  pdfUrl?: string;
  fileName?: string;
  downloadButtonText?: string;
  openNewTabButtonText?: string;
  shareButtonText?: string;
  previewBadge?: string;
  pillar1Title?: string;
  pillar1Desc?: string;
  pillar1Icon?: string;
  pillar2Title?: string;
  pillar2Desc?: string;
  pillar2Icon?: string;
  pillar3Title?: string;
  pillar3Desc?: string;
  pillar3Icon?: string;
  pillars?: CompanyProfilePillar[];
  ctaBadge?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryButtonText?: string;
  ctaPrimaryButtonLink?: string;
  ctaSecondaryButtonText?: string;
  ctaSecondaryButtonLink?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
}

export const COMPANY_PROFILE_PAGE_TAG = "company-profile-page";

async function fetchCompanyProfilePage(locale: Locale): Promise<StrapiCompanyProfilePage | null> {
  try {
    const params = new URLSearchParams();
    params.append("locale", locale);
    params.append("populate[blocks][populate]", "*");
    params.append("populate[pdfMedia]", "*");
    params.append("populate[seo][populate]", "*");

    // 1. Try /api/company-profile-page
    let response = await fetch(`${getStrapiBaseUrl()}/api/company-profile-page?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { revalidate: 60, tags: [COMPANY_PROFILE_PAGE_TAG] },
    });

    // 2. Try /api/company-profile
    if (!response.ok) {
      response = await fetch(`${getStrapiBaseUrl()}/api/company-profile?${params.toString()}`, {
        headers: getStrapiRequestHeaders(),
        next: { revalidate: 60, tags: [COMPANY_PROFILE_PAGE_TAG] },
      });
    }

    // 3. Fallback to /api/pages?filters[slug][$eq]=company-profile
    if (!response.ok) {
      const fallbackParams = new URLSearchParams();
      fallbackParams.append("locale", locale);
      fallbackParams.append("filters[slug][$eq]", "company-profile");
      fallbackParams.append("populate[blocks][populate]", "*");
      fallbackParams.append("populate[pdfMedia]", "*");
      fallbackParams.append("populate[seo][populate]", "*");

      response = await fetch(`${getStrapiBaseUrl()}/api/pages?${fallbackParams.toString()}`, {
        headers: getStrapiRequestHeaders(),
        next: { revalidate: 60, tags: [COMPANY_PROFILE_PAGE_TAG] },
      });
    }

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!item) return null;

    const attrs = item.attributes || item;

    // Resolve PDF media URL
    let resolvedPdfUrl = attrs.pdfUrl;
    if (attrs.pdfMedia) {
      const rawMediaUrl = extractMediaUrl(attrs.pdfMedia as StrapiMedia);
      if (rawMediaUrl) {
        resolvedPdfUrl = toAbsoluteUrl(rawMediaUrl) || rawMediaUrl;
      }
    }

    // Build pillars array
    const pillars: CompanyProfilePillar[] = [];
    if (attrs.pillar1Title || attrs.pillar1Desc) {
      pillars.push({
        title: attrs.pillar1Title || "",
        description: attrs.pillar1Desc || "",
        iconName: attrs.pillar1Icon || "Building2",
      });
    }
    if (attrs.pillar2Title || attrs.pillar2Desc) {
      pillars.push({
        title: attrs.pillar2Title || "",
        description: attrs.pillar2Desc || "",
        iconName: attrs.pillar2Icon || "Zap",
      });
    }
    if (attrs.pillar3Title || attrs.pillar3Desc) {
      pillars.push({
        title: attrs.pillar3Title || "",
        description: attrs.pillar3Desc || "",
        iconName: attrs.pillar3Icon || "Shield",
      });
    }

    return {
      id: item.id,
      documentId: item.documentId || String(item.id),
      title: attrs.title || "",
      badge: attrs.badge,
      heroTitle: attrs.heroTitle,
      heroSubtitle: attrs.heroSubtitle,
      fileTitle: attrs.fileTitle,
      fileSubtitle: attrs.fileSubtitle,
      pdfUrl: resolvedPdfUrl,
      fileName: attrs.fileName,
      downloadButtonText: attrs.downloadButtonText,
      openNewTabButtonText: attrs.openNewTabButtonText,
      shareButtonText: attrs.shareButtonText,
      previewBadge: attrs.previewBadge,
      pillar1Title: attrs.pillar1Title,
      pillar1Desc: attrs.pillar1Desc,
      pillar1Icon: attrs.pillar1Icon,
      pillar2Title: attrs.pillar2Title,
      pillar2Desc: attrs.pillar2Desc,
      pillar2Icon: attrs.pillar2Icon,
      pillar3Title: attrs.pillar3Title,
      pillar3Desc: attrs.pillar3Desc,
      pillar3Icon: attrs.pillar3Icon,
      pillars: pillars.length > 0 ? pillars : undefined,
      ctaBadge: attrs.ctaBadge,
      ctaTitle: attrs.ctaTitle,
      ctaSubtitle: attrs.ctaSubtitle,
      ctaPrimaryButtonText: attrs.ctaPrimaryButtonText,
      ctaPrimaryButtonLink: attrs.ctaPrimaryButtonLink,
      ctaSecondaryButtonText: attrs.ctaSecondaryButtonText,
      ctaSecondaryButtonLink: attrs.ctaSecondaryButtonLink,
      blocks: attrs.blocks || [],
      seo: attrs.seo,
    };
  } catch (error) {
    console.error("Error fetching company profile page data:", error);
    return null;
  }
}

export const getCompanyProfilePageCached = unstable_cache(
  async (locale: Locale) => fetchCompanyProfilePage(locale),
  [COMPANY_PROFILE_PAGE_TAG],
  {
    revalidate: 60,
  }
);
