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
  features?: string[] | null;
  order?: number;
  isFeatured?: boolean;
  cardCtaText?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
};

export type StrapiServicesPayload = {
  data?: StrapiServiceEntry[];
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

const normalizeService = (service: StrapiServiceEntry): StrapiServiceEntry => {
  if (service.coverImage) {
    service.coverImage.url = toAbsoluteUrl(extractMediaUrl(service.coverImage)) || service.coverImage.url;
  }

  // Normalize image URLs in dynamic zone blocks if present
  service.blocks?.forEach((block) => {
    if (block.__component === 'home.hero' && block.image) {
      block.image.url = toAbsoluteUrl(extractMediaUrl(block.image));
    }
  });

  return service;
};

async function fetchServices(locale: Locale): Promise<StrapiServiceEntry[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("sort", "order:asc");
  params.append("populate[coverImage][fields][0]", "url");
  params.append("populate[coverImage][fields][1]", "alternativeText");
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
