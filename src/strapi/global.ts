import { unstable_cache } from "next/cache";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { extractMediaUrl, getStrapiBaseUrl, getStrapiRequestHeaders, toAbsoluteUrl, type StrapiMedia, type StrapiSeo } from "@/lib/strapi";


type StrapiGlobalPayload = {
  data?: StrapiGlobalEntry | null;
  meta?: Record<string, unknown>;
};

type StrapiGlobalEntry = {
  id?: number;
  documentId?: string;
  siteName?: string;
  siteDescription?: string;
  favicon?: StrapiMedia | null;
  defaultSeo?: StrapiSeo | null;
};



export type GlobalSettings = {
  locale: Locale;
  siteName: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  ogImageUrl?: string | null;
  faviconUrl: string | null;
};

export const GLOBAL_SETTINGS_TAG = "global-settings";


const normalizeGlobal = (locale: Locale, payload: StrapiGlobalPayload): GlobalSettings | null => {
  const data = payload.data;

  if (!data) {
    return null;
  }

  const siteName = data.siteName?.trim() || "";
  const siteDescription = data.siteDescription?.trim() || "";

  const seoTitle = data.defaultSeo?.meta_title?.trim() || siteName;
  const seoDescription = data.defaultSeo?.meta_description?.trim() || siteDescription;
  const seoKeywords = data.defaultSeo?.meta_keywords?.trim() || undefined;
  const ogImageUrl = toAbsoluteUrl(extractMediaUrl(data.defaultSeo?.og_image)); // TODO: Review back When we add S3
  const faviconUrl = toAbsoluteUrl(extractMediaUrl(data.favicon)); // TODO: Review back When we add S3

  return {
    locale,
    siteName,
    siteDescription,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImageUrl,
    faviconUrl,
  };
};

async function fetchGlobal(locale: Locale) {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("fields[0]", "siteName");
  params.append("fields[1]", "siteDescription");
  params.append("populate[defaultSeo][fields][0]", "meta_title");
  params.append("populate[defaultSeo][fields][1]", "meta_description");
  params.append("populate[defaultSeo][fields][2]", "meta_keywords");
  params.append("populate[defaultSeo][populate][og_image][fields][0]", "url");
  params.append("populate[favicon][fields][0]", "url");

  const response = await fetch(`${getStrapiBaseUrl()}/api/global?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { revalidate: 86400, tags: [GLOBAL_SETTINGS_TAG] },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Failed to fetch Strapi global (${response.status})`);
  }

  const payload = (await response.json()) as StrapiGlobalPayload;
  return normalizeGlobal(locale, payload);
}

const getGlobalSettingsCached = unstable_cache(
  async (locale: Locale) => fetchGlobal(locale),
  [GLOBAL_SETTINGS_TAG],
  {
    revalidate: 86400,
    tags: [GLOBAL_SETTINGS_TAG],
  }
);

export async function getGlobalSettings(locale: Locale): Promise<GlobalSettings | null> {
  try {
    const localized = await getGlobalSettingsCached(locale);
    if (localized) {
      return localized;
    }

    if (locale !== defaultLocale) {
      return await getGlobalSettingsCached(defaultLocale);
    }

    return null;
  } catch {
    if (locale !== defaultLocale) {
      try {
        return await getGlobalSettingsCached(defaultLocale);
      } catch {
        return null;
      }
    }

    return null;
  }
}
