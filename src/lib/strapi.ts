
export type FullStrapiMedia = {
  id?: number;
  documentId?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  focalPoint?: unknown;
  width?: number;
  height?: number;
  formats?: Record<string, StrapiMediaFormat>;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  url?: string | null;
  previewUrl?: string | null;
  provider?: string;
  provider_metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export type StrapiMediaFormat = {
  name?: string;
  hash?: string;
  ext?: string;
  mime?: string;
  path?: string | null;
  width?: number;
  height?: number;
  size?: number;
  sizeInBytes?: number;
  url?: string;
};
export type StrapiMedia = {
  id?: number;
  documentId?: string;
  url?: string | null;
};

export type StrapiSeo = {
  id?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string | null;
  og_image?: OGImageMedia | null;
};

export type OGImageMedia = {
  id?: number;
  documentId?: string;
  name?: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  url?: string | null;
};
const fallbackStrapiUrl = "http://localhost:1337";

export const getStrapiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_STRAPI_URL || fallbackStrapiUrl).replace(/\/$/, "");

const getStrapiAuthToken = () =>
  process.env.STRAPI_READ_ONLY_API_TOKEN || "";

export const getStrapiRequestHeaders = (): HeadersInit => {
  const token = getStrapiAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const toAbsoluteUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${getStrapiBaseUrl()}${url}`;
};// TODO: Review back When we add S3


export const extractMediaUrl = (media: StrapiMedia | null | undefined) => {
  if (!media) {
    return null;
  }

  return media.url ?? null;
};
