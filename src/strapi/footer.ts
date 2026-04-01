import { unstable_cache } from "next/cache";
import { defaultLocale, type Locale } from "@/lib/i18n";
import {
  extractMediaUrl,
  getStrapiBaseUrl,
  getStrapiRequestHeaders,
  toAbsoluteUrl,
  type StrapiMedia,
} from "@/lib/strapi";

type StrapiFooterPayload = {
  data?: StrapiFooterEntry | null;
  meta?: Record<string, unknown>;
};

type StrapiFooterEntry = {
  id?: number;
  documentId?: string;
  lightLogoImage?: StrapiMedia | null;
  darkLogoImage?: StrapiMedia | null;
  description?: string | null;
  columns?: StrapiFooterColumn[] | null;
  socialLinks?: StrapiSocialLink[] | null;
  bottomLinks?: StrapiNavigationSubItem[] | null;
};

type StrapiFooterColumn = {
  id: number;
  title: string;
  links?: StrapiNavigationSubItem[] | null;
};

type StrapiNavigationSubItem = {
  id: number;
  label?: string | null;
  url?: string | null;
  openInNewTab?: boolean | null;
  order?: number | null;
};

type StrapiSocialLink = {
  id: number;
  platform: "Facebook" | "Twitter" | "Instagram" | "LinkedIn" | "YouTube" | "TikTok" | "GitHub";
  url: string;
};

export type FooterLink = {
  label: string;
  url: string;
  openInNewTab: boolean;
  order: number;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type FooterSettings = {
  locale: Locale;
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
  description: string;
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  bottomLinks: FooterLink[];
};

export const FOOTER_SETTINGS_TAG = "footer";

const normalizeLink = (item: StrapiNavigationSubItem): FooterLink | null => {
  const label = item.label?.trim() || "";
  const url = item.url?.trim() || "";

  if (!label || !url) {
    return null;
  }

  return {
    label,
    url,
    openInNewTab: Boolean(item.openInNewTab),
    order: item.order ?? 0,
  };
};

const normalizeColumn = (col: StrapiFooterColumn): FooterColumn | null => {
  const title = col.title?.trim();
  if (!title) return null;

  const links = (col.links ?? [])
    .map(normalizeLink)
    .filter((link): link is FooterLink => link !== null)
    .sort((a, b) => a.order - b.order);

  return {
    title,
    links,
  };
};

const normalizeFooter = (locale: Locale, payload: StrapiFooterPayload): FooterSettings | null => {
  const data = payload.data;

  if (!data) {
    return null;
  }

  const lightLogoUrl = toAbsoluteUrl(extractMediaUrl(data.lightLogoImage));
  const darkLogoUrl = toAbsoluteUrl(extractMediaUrl(data.darkLogoImage));
  const description = data.description?.trim() || "";

  const columns = (data.columns ?? [])
    .map(normalizeColumn)
    .filter((col): col is FooterColumn => col !== null);

  const socialLinks = (data.socialLinks ?? []).map(link => ({
    platform: link.platform,
    url: link.url
  }));

  const bottomLinks = (data.bottomLinks ?? [])
    .map(normalizeLink)
    .filter((link): link is FooterLink => link !== null)
    .sort((a, b) => a.order - b.order);

  return {
    locale,
    lightLogoUrl,
    darkLogoUrl,
    description,
    columns,
    socialLinks,
    bottomLinks,
  };
};

async function fetchFooter(locale: Locale) {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate[lightLogoImage][fields][0]", "url");
  params.append("populate[darkLogoImage][fields][0]", "url");
  params.append("populate[columns][populate][links][fields][0]", "label");
  params.append("populate[columns][populate][links][fields][1]", "url");
  params.append("populate[columns][populate][links][fields][2]", "openInNewTab");
  params.append("populate[columns][populate][links][fields][3]", "order");
  params.append("populate[socialLinks][fields][0]", "platform");
  params.append("populate[socialLinks][fields][1]", "url");
  params.append("populate[bottomLinks][fields][0]", "label");
  params.append("populate[bottomLinks][fields][1]", "url");
  params.append("populate[bottomLinks][fields][2]", "openInNewTab");
  params.append("populate[bottomLinks][fields][3]", "order");

  const response = await fetch(`${getStrapiBaseUrl()}/api/footer?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { revalidate: 86400, tags: [FOOTER_SETTINGS_TAG] },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Failed to fetch Strapi footer (${response.status})`);
  }

  const payload = (await response.json()) as StrapiFooterPayload;
  return normalizeFooter(locale, payload);
}

const getFooterSettingsCached = unstable_cache(
  async (locale: Locale) => fetchFooter(locale),
  [FOOTER_SETTINGS_TAG],
  {
    revalidate: 86400,
    tags: [FOOTER_SETTINGS_TAG],
  }
);

export async function getFooterSettings(locale: Locale): Promise<FooterSettings | null> {
  try {
    const localized = await getFooterSettingsCached(locale);
    if (localized) {
      return localized;
    }

    if (locale !== defaultLocale) {
      return await getFooterSettingsCached(defaultLocale);
    }

    return null;
  } catch {
    if (locale !== defaultLocale) {
      try {
        return await getFooterSettingsCached(defaultLocale);
      } catch {
        return null;
      }
    }

    return null;
  }
}
