import { getGlobalSettings } from "@/strapi/global";
import { getHeaderSettings } from "@/strapi/header";
import { locales, hrefLang, defaultLocale, siteUrl, type Locale } from "@/lib/i18n";
import { toAbsoluteUrl } from "@/lib/strapi";
import type { Metadata } from "next";

export interface BuildMetadataOptions {
  locale: Locale;
  path: string; // e.g. "/insights/articles" or "/contact"
  title?: string;
  description?: string;
  ogImage?: {
    url?: string | null;
    width?: number;
    height?: number;
    alt?: string | null;
  } | null;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  noIndex?: boolean;
  ogType?: "hero" | "insight" | "article" | "news" | "podcast" | "magazine" | "majlis" | "page" | string;
  slug?: string;
  cta1?: string;
  cta2?: string;
}

export function getOptimizedOgImageUrl(
  url: string | null | undefined,
  title?: string,
  description?: string,
  locale?: string,
  logoUrl?: string | null,
  ogType?: string,
  cta1?: string,
  cta2?: string,
  slug?: string
): string | null {
  if (!url) {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (description) params.set('description', description);
    if (locale) params.set('locale', locale);
    if (logoUrl) params.set('logoUrl', logoUrl);
    if (ogType) params.set('type', ogType);
    if (slug) params.set('slug', slug);
    if (cta1) params.set('cta1', cta1);
    if (cta2) params.set('cta2', cta2);
    return `${siteUrl}/api/og?${params.toString()}`;
  }
  if (
    url.includes("web-app-manifest") ||
    url.endsWith(".svg") ||
    url.endsWith(".ico")
  ) {
    return url;
  }
  return `${siteUrl}/api/og/resize?url=${encodeURIComponent(url)}`;
}

export async function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
  type = "website",
  keywords,
  noIndex = false,
  ogType,
  slug,
  cta1,
  cta2,
}: BuildMetadataOptions): Promise<Metadata> {
  const globalData = await getGlobalSettings(locale);
  const siteName = globalData?.siteName || "Shuru";

  // Strip leading and trailing slashes for clean prefix matching
  const cleanPath = path.replace(/^\/|\/$/g, "");
  
  // Form canonical and localized link alternates
  const canonicalUrl = cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`;

  const languages = Object.fromEntries(
    locales.map((lang) => {
      const localizedPath = cleanPath ? `/${lang}/${cleanPath}` : `/${lang}`;
      return [hrefLang[lang], localizedPath];
    })
  );

  const finalTitle = title ? title : (globalData?.seoTitle || siteName);
  const defaultSeoTitle = globalData?.seoTitle || siteName;
  const isDefaultOrFullTitle =
    !title ||
    cleanPath === "" ||
    finalTitle === defaultSeoTitle ||
    finalTitle === siteName ||
    (siteName && finalTitle.includes(siteName)) ||
    (globalData?.seoTitle && finalTitle.includes(globalData.seoTitle));

  const finalDescription = description || globalData?.seoDescription || globalData?.siteDescription || "";

  const headerData = await getHeaderSettings(locale);
  const logoUrl = headerData?.darkLogoUrl || headerData?.lightLogoUrl;

  const ogImageUrl =
    toAbsoluteUrl(ogImage?.url) ||
    globalData?.ogImage?.url;

  const computedOgType = ogType || (cleanPath === "" ? "hero" : "insight");

  const finalOgImageUrl = getOptimizedOgImageUrl(
    ogImageUrl,
    finalTitle,
    finalDescription,
    locale,
    logoUrl,
    computedOgType,
    cta1,
    cta2,
    slug
  );
  const isOptimized = finalOgImageUrl && finalOgImageUrl.includes("/api/og");

  const robots = noIndex ? { index: false, follow: false } : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: isDefaultOrFullTitle ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    keywords: keywords || (globalData?.seoKeywords ? globalData.seoKeywords.split(",").map((kw) => kw.trim()) : undefined),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...languages,
        "x-default": cleanPath ? `/${defaultLocale}/${cleanPath}` : `/${defaultLocale}`,
      },
    },
    openGraph: {
      url: `${siteUrl}${canonicalUrl}`,
      locale,
      title: finalTitle,
      description: finalDescription,
      type,
      siteName,
      images: finalOgImageUrl
        ? [
            {
              url: finalOgImageUrl,
              width: isOptimized ? 1200 : (ogImage?.width || globalData?.ogImage?.width || 512),
              height: isOptimized ? 630 : (ogImage?.height || globalData?.ogImage?.height || 512),
              alt: ogImage?.alt || globalData?.ogImage?.alternativeText || finalTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: finalOgImageUrl ? "summary_large_image" : "summary",
      title: finalTitle,
      description: finalDescription,
      images: finalOgImageUrl ? [finalOgImageUrl] : undefined,
    },
    robots,
  };
}
