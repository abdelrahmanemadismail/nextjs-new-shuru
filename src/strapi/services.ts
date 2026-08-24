import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import {
  extractMediaUrl,
  getStrapiBaseUrl,
  getStrapiRequestHeaders,
  toAbsoluteUrl,
  type StrapiMedia,
  type StrapiSeo,
} from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

export type StrapiServiceEntry = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  badge?: string;
  shortDescription?: string;
  icon?: string;
  coverImage?: StrapiMedia | null;
  features?: string[];
  order?: number;
  isFeatured?: boolean;
  cardCtaText?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
};

export type StrapiServicesPayload = {
  data?: any[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export const SERVICES_TAG = "services";

export const normalizeFeatures = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === "string" ? item.trim() : (item?.title || item?.name || item?.label || "").trim()))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeService = (raw: any): StrapiServiceEntry => {
  const item = raw.attributes || raw;
  let coverImage = item.coverImage;
  if (coverImage) {
    const url = extractMediaUrl(coverImage);
    if (url) {
      coverImage = {
        ...coverImage,
        url: toAbsoluteUrl(url) || url,
      };
    }
  }

  // Normalize dynamic zone blocks
  const blocks = (item.blocks || []).map((block: any) => {
    if (block.__component === "home.hero" && block.image) {
      const url = extractMediaUrl(block.image);
      return {
        ...block,
        image: {
          ...block.image,
          url: toAbsoluteUrl(url) || url,
        },
      };
    }
    return block;
  });

  return {
    id: raw.id || item.id,
    documentId: raw.documentId || item.documentId || String(raw.id || item.id),
    title: item.title || "",
    slug: item.slug || "",
    badge: item.badge,
    shortDescription: item.shortDescription,
    icon: item.icon,
    coverImage: coverImage || null,
    features: normalizeFeatures(item.features),
    order: typeof item.order === "number" ? item.order : 0,
    isFeatured: Boolean(item.isFeatured),
    cardCtaText: item.cardCtaText,
    blocks,
    seo: item.seo,
  };
};

async function fetchServices(locale: Locale): Promise<StrapiServiceEntry[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("sort", "order:asc");
  params.append("populate[coverImage][populate]", "*");
  params.append("populate[blocks][populate]", "*");
  params.append("populate[seo][populate]", "*");
  params.append("pagination[pageSize]", "100");

  try {
    const response = await fetch(`${getStrapiBaseUrl()}/api/services?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { tags: [SERVICES_TAG, `services-${locale}`], revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Failed to fetch Strapi services (${response.status})`);
    }

    const payload = (await response.json()) as StrapiServicesPayload;
    return (payload.data || []).map(normalizeService);
  } catch (error) {
    console.error("Error fetching services from Strapi:", error);
    return [];
  }
}

async function fetchServiceBySlug(slug: string, locale: Locale): Promise<StrapiServiceEntry | null> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[coverImage][populate]", "*");
  params.append("populate[blocks][populate]", "*");
  params.append("populate[seo][populate]", "*");

  try {
    const response = await fetch(`${getStrapiBaseUrl()}/api/services?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { tags: [SERVICES_TAG, `service-${slug}`, `service-${slug}-${locale}`], revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch Strapi service with slug ${slug} (${response.status})`);
    }

    const payload = (await response.json()) as StrapiServicesPayload;
    const entry = payload.data?.[0];
    return entry ? normalizeService(entry) : null;
  } catch (error) {
    console.error(`Error fetching service ${slug} from Strapi:`, error);
    return null;
  }
}

export const getServicesCached = unstable_cache(
  async (locale: Locale) => fetchServices(locale),
  [SERVICES_TAG],
  {
    revalidate: 60,
    tags: [SERVICES_TAG],
  }
);

export const getServiceBySlugCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchServiceBySlug(slug, locale),
  [SERVICES_TAG],
  {
    revalidate: 60,
    tags: [SERVICES_TAG],
  }
);
