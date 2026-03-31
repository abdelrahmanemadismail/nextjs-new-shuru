import { unstable_cache } from "next/cache";
import { defaultLocale, type Locale } from "@/lib/i18n";
import {
  extractMediaUrl,
  getStrapiBaseUrl,
  getStrapiRequestHeaders,
  toAbsoluteUrl,
  type StrapiMedia,
} from "@/lib/strapi";

type StrapiHeaderPayload = {
  data?: StrapiHeaderEntry | null;
  meta?: Record<string, unknown>;
};

export type StrapiTopBar = {
  isVisible?: boolean;
  message?: string;
  linkText?: string;
  linkUrl?: string;
};

type StrapiHeaderEntry = {
  id?: number;
  documentId?: string;
  lightLogoImage?: StrapiMedia | null;
  darkLogoImage?: StrapiMedia | null;
  alt?: string | null;
  navigation?: {
    primaryMenuItems?: StrapiNavigationItem[] | null;
  } | null;
  topBar?: StrapiTopBar | null;
};

type StrapiNavigationItem = {
  label?: string | null;
  url?: string | null;
  openInNewTab?: boolean | null;
  order?: number | null;
  onHeader?: boolean | null;
  onSideBar?: boolean | null;
  subItems?: StrapiNavigationSubItem[] | null;
};

type StrapiNavigationSubItem = {
  label?: string | null;
  url?: string | null;
  openInNewTab?: boolean | null;
  order?: number | null;
};

export type HeaderSubItem = {
  label: string;
  url: string;
  openInNewTab: boolean;
  order: number;
};

export type HeaderMenuItem = {
  label: string;
  url: string;
  openInNewTab: boolean;
  order: number;
  onHeader: boolean;
  onSideBar: boolean;
  subItems: HeaderSubItem[];
};

export type HeaderSettings = {
  locale: Locale;
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
  logoAlt: string;
  navigationItems: HeaderMenuItem[];
  topBar: StrapiTopBar | null;
};

export const HEADER_SETTINGS_TAG = "header";

const normalizeSubItem = (item: StrapiNavigationSubItem): HeaderSubItem | null => {
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

const normalizeItem = (item: StrapiNavigationItem): HeaderMenuItem | null => {
  const label = item.label?.trim() || "";
  const url = item.url?.trim() || "";

  if (!label || !url) {
    return null;
  }

  const subItems = (item.subItems ?? [])
    .map(normalizeSubItem)
    .filter((subItem): subItem is HeaderSubItem => subItem !== null)
    .sort((a, b) => a.order - b.order);

  return {
    label,
    url,
    openInNewTab: Boolean(item.openInNewTab),
    order: item.order ?? 0,
    onHeader: Boolean(item.onHeader),
    onSideBar: Boolean(item.onSideBar),
    subItems,
  };
};

const normalizeHeader = (locale: Locale, payload: StrapiHeaderPayload): HeaderSettings | null => {
  const data = payload.data;

  if (!data) {
    return null;
  }

  const lightLogoUrl = toAbsoluteUrl(extractMediaUrl(data.lightLogoImage));
  const darkLogoUrl = toAbsoluteUrl(extractMediaUrl(data.darkLogoImage));
  const logoAlt = data.alt?.trim() || "Site logo";
  const navigationItems = (data.navigation?.primaryMenuItems ?? [])
    .map(normalizeItem)
    .filter((item): item is HeaderMenuItem => item !== null)
    .sort((a, b) => a.order - b.order);

  return {
    locale,
    lightLogoUrl,
    darkLogoUrl,
    logoAlt,
    navigationItems,
    topBar: data.topBar || null,
  };
};

async function fetchHeader(locale: Locale) {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("fields[0]", "alt");
  params.append("populate[lightLogoImage][fields][0]", "url");
  params.append("populate[darkLogoImage][fields][0]", "url");
  params.append("populate[navigation][populate][primaryMenuItems][fields][0]", "label");
  params.append("populate[navigation][populate][primaryMenuItems][fields][1]", "url");
  params.append("populate[navigation][populate][primaryMenuItems][fields][2]", "openInNewTab");
  params.append("populate[navigation][populate][primaryMenuItems][fields][3]", "order");
  params.append("populate[navigation][populate][primaryMenuItems][fields][4]", "onHeader");
  params.append("populate[navigation][populate][primaryMenuItems][fields][5]", "onSideBar");
  params.append("populate[navigation][populate][primaryMenuItems][populate][subItems][fields][0]", "label");
  params.append("populate[navigation][populate][primaryMenuItems][populate][subItems][fields][1]", "url");
  params.append("populate[navigation][populate][primaryMenuItems][populate][subItems][fields][2]", "openInNewTab");
  params.append("populate[navigation][populate][primaryMenuItems][populate][subItems][fields][3]", "order");
  params.append("populate[topBar][populate]", "*");

  const response = await fetch(`${getStrapiBaseUrl()}/api/header?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { revalidate: 86400, tags: [HEADER_SETTINGS_TAG] },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Failed to fetch Strapi header (${response.status})`);
  }

  const payload = (await response.json()) as StrapiHeaderPayload;
  return normalizeHeader(locale, payload);
}

const getHeaderSettingsCached = unstable_cache(
  async (locale: Locale) => fetchHeader(locale),
  [HEADER_SETTINGS_TAG],
  {
    revalidate: 86400,
    tags: [HEADER_SETTINGS_TAG],
  }
);

export async function getHeaderSettings(locale: Locale): Promise<HeaderSettings | null> {
  try {
    const localized = await getHeaderSettingsCached(locale);
    if (localized) {
      return localized;
    }

    if (locale !== defaultLocale) {
      return await getHeaderSettingsCached(defaultLocale);
    }

    return null;
  } catch {
    if (locale !== defaultLocale) {
      try {
        return await getHeaderSettingsCached(defaultLocale);
      } catch {
        return null;
      }
    }

    return null;
  }
}