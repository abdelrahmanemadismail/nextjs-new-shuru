import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { extractMediaUrl, getStrapiBaseUrl, getStrapiRequestHeaders, toAbsoluteUrl, type StrapiSeo } from "@/lib/strapi";
import type { StrapiHeroBlock, StrapiOverviewBlock, StrapiValueBlock, StrapiCtaFooterBlock, StrapiTestimonialsSectionBlock } from "./home";

export type StrapiChallengeCard = {
  id: number;
  pain: string;
  intervention: string;
  result: string;
};

export type StrapiChallengesSectionBlock = {
  __component: 'shared.challenges-section';
  id: number;
  title: string;
  introText?: string;
  challenges: StrapiChallengeCard[];
};

export type StrapiTimelineStep = {
  id: number;
  title: string;
  description: string;
  icon?: string;
};

export type StrapiTimelineSectionBlock = {
  __component: 'shared.timeline-section';
  id: number;
  title: string;
  steps: StrapiTimelineStep[];
};

export type StrapiQuoteSectionBlock = {
  __component: 'shared.quote-section';
  id: number;
  quoteText: string;
  author?: string;
};

export type StrapiSharedMediaBlock = {
  __component: 'shared.media';
  id: number;
  file?: any;
};

export type StrapiSharedQuoteBlock = {
  __component: 'shared.quote';
  id: number;
  title?: string;
  body?: string;
};

export type StrapiSharedRichTextBlock = {
  __component: 'shared.rich-text';
  id: number;
  body?: string;
};

export type StrapiSharedSliderBlock = {
  __component: 'shared.slider';
  id: number;
  files?: any[];
};

export type StrapiPageBlock =
  | StrapiHeroBlock
  | StrapiOverviewBlock
  | StrapiValueBlock
  | StrapiCtaFooterBlock
  | StrapiTestimonialsSectionBlock
  | StrapiChallengesSectionBlock
  | StrapiTimelineSectionBlock
  | StrapiQuoteSectionBlock
  | StrapiSharedMediaBlock
  | StrapiSharedQuoteBlock
  | StrapiSharedRichTextBlock
  | StrapiSharedSliderBlock;

export type StrapiPageEntry = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  seo?: StrapiSeo;
  blocks?: StrapiPageBlock[];
};

export type StrapiPagePayload = {
  data?: StrapiPageEntry[];
};

export const PAGE_TAG = "dynamic-pages";

const normalizePage = (payload: StrapiPagePayload): StrapiPageEntry | null => {
  const data = payload.data?.[0];
  if (!data) return null;

  // Normalize image URLs if they exist in a hero block
  data.blocks?.forEach((block) => {
    if (block.__component === 'home.hero' && block.image) {
      block.image.url = toAbsoluteUrl(extractMediaUrl(block.image));
    }
  });

  return data;
};

async function fetchPageBySlug(slug: string, locale: Locale) {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("filters[slug][$eq]", slug);
  params.append("populate[blocks][populate]", "*");
  params.append("populate[seo][populate]", "*");

  const response = await fetch(`${getStrapiBaseUrl()}/api/pages?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [PAGE_TAG, slug] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch Strapi page with slug ${slug} (${response.status})`);
  }

  const payload = (await response.json()) as StrapiPagePayload;
  return normalizePage(payload);
}

export const getPageCached = unstable_cache(
  async (slug: string, locale: Locale) => fetchPageBySlug(slug, locale),
  [PAGE_TAG],
  {
    revalidate: 3600,
  }
);