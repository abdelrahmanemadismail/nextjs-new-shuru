import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { extractMediaUrl, getStrapiBaseUrl, getStrapiRequestHeaders, toAbsoluteUrl } from "@/lib/strapi";
import type { StrapiMedia, StrapiSeo } from "@/lib/strapi";

// Testimonial Types
export type StrapiTestimonial = {
  id: number;
  documentId: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
};

type StrapiTestimonialPayload = {
  data: StrapiTestimonial[];
};

export const TESTIMONIALS_TAG = "testimonials";

async function fetchTestimonials(locale: Locale): Promise<StrapiTestimonial[]> {
  const params = new URLSearchParams();
  params.append("locale", locale);
  params.append("populate", "*");

  const response = await fetch(`${getStrapiBaseUrl()}/api/testimonials?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [TESTIMONIALS_TAG] },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch Strapi testimonials (${response.status})`);
  }

  const payload = (await response.json()) as StrapiTestimonialPayload;
  return payload.data || [];
}

export const getTestimonialsCached = unstable_cache(
  async (locale: Locale) => fetchTestimonials(locale),
  [TESTIMONIALS_TAG],
  {
    revalidate: 3600,
    tags: [TESTIMONIALS_TAG],
  }
);


// Home Types
export type StrapiHomePayload = {
  data?: StrapiHomeEntry | null;
};

export type StrapiHeroBlock = {
  __component: 'home.hero';
  id: number;
  title: string;
  subtitle?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image?: StrapiMedia;
};

export type StrapiOverviewBlock = {
  __component: 'home.overview';
  id: number;
  title: string;
  introText?: string;
  cards: {
    id: number;
    title: string;
    description: string;
    iconName?: string;
  }[];
  ctaText?: string;
  ctaLink?: string;
};

export type StrapiValueBlock = {
  __component: 'home.value';
  id: number;
  title: string;
  introText?: string;
  points: {
    id: number;
    title: string;
    description?: string;
    iconName?: string;
  }[];
  ctaText?: string;
  ctaLink?: string;
};

export type StrapiTestimonialsSectionBlock = {
  __component: 'home.testimonials-section';
  id: number;
  title: string;
  introText?: string;
  ctaText?: string;
  ctaLink?: string;
  showSection?: boolean;
};

export type StrapiCtaFooterBlock = {
  __component: 'home.cta-footer';
  id: number;
  headline: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  alternativeText?: string;
  alternativeLink?: string;
};

export type StrapiHomeBlock =
  | StrapiHeroBlock
  | StrapiOverviewBlock
  | StrapiValueBlock
  | StrapiTestimonialsSectionBlock
  | StrapiCtaFooterBlock
  | { __component: 'shared.challenges-section'; [key: string]: any }
  | { __component: 'shared.timeline-section'; [key: string]: any }
  | { __component: 'shared.quote-section'; [key: string]: any }
  | { __component: 'shared.media'; [key: string]: any }
  | { __component: 'shared.quote'; [key: string]: any }
  | { __component: 'shared.rich-text'; [key: string]: any }
  | { __component: 'shared.slider'; [key: string]: any };

export type StrapiHomeEntry = {
  id: number;
  documentId: string;
  title: string;
  seo?: StrapiSeo;
  blocks?: StrapiHomeBlock[];
};

export const HOME_TAG = "home-page";

const normalizeHome = (payload: StrapiHomePayload): StrapiHomeEntry | null => {
  const data = payload.data;
  if (!data) return null;

  // Normalize image URLs if they exist in a hero block
  data.blocks?.forEach((block) => {
    if (block.__component === 'home.hero' && block.image) {
      block.image.url = toAbsoluteUrl(extractMediaUrl(block.image));
    }
  });

  return data;
};

async function fetchHome(locale: Locale) {
  const params = new URLSearchParams();
  params.append("locale", locale);
  // Populate the blocks dynamic zone and all its nested properties (like cards, points, images)
  params.append("populate[blocks][populate]", "*");
  params.append("populate[seo][populate]", "*");

  const response = await fetch(`${getStrapiBaseUrl()}/api/home?${params.toString()}`, {
    headers: getStrapiRequestHeaders(),
    next: { tags: [HOME_TAG] },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch Strapi home (${response.status})`);
  }

  const payload = (await response.json()) as StrapiHomePayload;
  return normalizeHome(payload);
}

export const getHomeCached = unstable_cache(
  async (locale: Locale) => fetchHome(locale),
  [HOME_TAG],
  {
    revalidate: 3600,
    tags: [HOME_TAG],
  }
);
