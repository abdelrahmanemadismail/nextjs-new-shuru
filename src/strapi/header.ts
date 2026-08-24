import { type Locale } from "@/lib/i18n";
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
  showQuickLinks?: boolean | null;
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
  showQuickLinks: boolean;
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

  const attrs = ((data as any).attributes || data) as StrapiHeaderEntry;

  const lightLogoUrl = toAbsoluteUrl(extractMediaUrl(attrs.lightLogoImage));
  const darkLogoUrl = toAbsoluteUrl(extractMediaUrl(attrs.darkLogoImage));
  const logoAlt = attrs.alt?.trim() || "Site logo";
  const showQuickLinks = attrs.showQuickLinks !== false;
  const navigationItems = (attrs.navigation?.primaryMenuItems ?? [])
    .map(normalizeItem)
    .filter((item): item is HeaderMenuItem => item !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return {
    locale,
    lightLogoUrl,
    darkLogoUrl,
    logoAlt,
    showQuickLinks,
    navigationItems,
    topBar: attrs.topBar || null,
  };
};

export async function getHeaderSettings(locale: Locale): Promise<HeaderSettings | null> {
  try {
    const params = new URLSearchParams();
    params.append("locale", locale);
    params.append("populate[lightLogoImage][fields][0]", "url");
    params.append("populate[darkLogoImage][fields][0]", "url");
    params.append("populate[navigation][populate][primaryMenuItems][populate][subItems]", "*");
    params.append("populate[topBar][populate]", "*");

    const response = await fetch(`${getStrapiBaseUrl()}/api/header?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { tags: [HEADER_SETTINGS_TAG] },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error(`Failed to fetch Strapi header (${response.status})`);
      return null;
    }

    const payload = (await response.json()) as StrapiHeaderPayload;
    return normalizeHeader(locale, payload);
  } catch (err) {
    console.error("Error in getHeaderSettings:", err);
    return null;
  }
}