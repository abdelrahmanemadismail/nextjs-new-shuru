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
  bottomLinks?: StrapiFooterLink[] | null;
};

type StrapiFooterColumn = {
  id: number;
  title: string;
  links?: StrapiFooterLink[] | null;
};

type StrapiFooterLink = {
  id?: number;
  label?: string | null;
  url?: string | null;
  openInNewTab?: boolean | null;
  order?: number | null;
  onFooter?: boolean | null;
  onHeader?: boolean | null;
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
  onFooter: boolean;
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

const normalizeLink = (item: StrapiFooterLink): FooterLink | null => {
  const label = item.label?.trim() || "";
  const url = item.url?.trim() || "";

  if (!label || !url) {
    return null;
  }

  const onFooter =
    item.onFooter !== undefined && item.onFooter !== null
      ? Boolean(item.onFooter)
      : item.onHeader !== undefined && item.onHeader !== null
      ? Boolean(item.onHeader)
      : true;

  return {
    label,
    url,
    openInNewTab: Boolean(item.openInNewTab),
    order: item.order ?? 0,
    onFooter,
  };
};

const normalizeColumn = (col: StrapiFooterColumn): FooterColumn | null => {
  const title = col.title?.trim();
  if (!title) return null;

  const links = (col.links ?? [])
    .map(normalizeLink)
    .filter((link): link is FooterLink => link !== null && link.onFooter !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
    .filter((link): link is FooterLink => link !== null && link.onFooter !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
  const baseUrl = getStrapiBaseUrl();
  const headers = getStrapiRequestHeaders();

  // Try populating all fields (works with layout.footer-link)
  const params1 = new URLSearchParams();
  params1.append("locale", locale);
  params1.append("populate[lightLogoImage][fields][0]", "url");
  params1.append("populate[darkLogoImage][fields][0]", "url");
  params1.append("populate[columns][populate]", "*");
  params1.append("populate[socialLinks]", "*");
  params1.append("populate[bottomLinks]", "*");

  let response = await fetch(`${baseUrl}/api/footer?${params1.toString()}`, {
    headers,
    next: { revalidate: 60, tags: [FOOTER_SETTINGS_TAG] },
  });

  // Fallback if legacy layout.navigation-item was still in place
  if (!response.ok && response.status !== 404) {
    const params2 = new URLSearchParams();
    params2.append("locale", locale);
    params2.append("populate[lightLogoImage][fields][0]", "url");
    params2.append("populate[darkLogoImage][fields][0]", "url");
    params2.append("populate[columns][populate][links][fields][0]", "label");
    params2.append("populate[columns][populate][links][fields][1]", "url");
    params2.append("populate[columns][populate][links][fields][2]", "openInNewTab");
    params2.append("populate[columns][populate][links][fields][3]", "order");
    params2.append("populate[socialLinks][fields][0]", "platform");
    params2.append("populate[socialLinks][fields][1]", "url");
    params2.append("populate[bottomLinks][fields][0]", "label");
    params2.append("populate[bottomLinks][fields][1]", "url");
    params2.append("populate[bottomLinks][fields][2]", "openInNewTab");
    params2.append("populate[bottomLinks][fields][3]", "order");

    response = await fetch(`${baseUrl}/api/footer?${params2.toString()}`, {
      headers,
      next: { revalidate: 60, tags: [FOOTER_SETTINGS_TAG] },
    });
  }

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
    revalidate: 60,
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
