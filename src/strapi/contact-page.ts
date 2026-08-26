import { unstable_cache } from "next/cache";
import { type Locale } from "@/lib/i18n";
import { getStrapiBaseUrl, getStrapiRequestHeaders, type StrapiSeo } from "@/lib/strapi";
import type { StrapiPageBlock } from "./page";

export interface StrapiContactPage {
  id: number;
  documentId?: string;
  title: string;
  badge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  step1Title?: string;
  entityTypeLabel?: string;
  entityTypeOptions?: string[];
  desiredServiceLabel?: string;
  desiredServiceOptions?: string[];
  challengeLabel?: string;
  challengeOptions?: string[];
  step2Title?: string;
  fullNameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  companyLabel?: string;
  preferredDateLabel?: string;
  messageLabel?: string;
  submitButtonText?: string;
  submittingButtonText?: string;
  successMessage?: string;
  blocks?: StrapiPageBlock[];
  seo?: StrapiSeo;
}

export const CONTACT_PAGE_TAG = "contact-page";

const normalizeOptions = (raw: any): string[] | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const list = raw
      .map((item) => (typeof item === "string" ? item.trim() : (item?.label || item?.value || "").trim()))
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  if (typeof raw === "string") {
    const list = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  return undefined;
};

async function fetchContactPage(locale: Locale): Promise<StrapiContactPage | null> {
  try {
    const params = new URLSearchParams();
    params.append("locale", locale);
    params.append("populate[blocks][populate]", "*");
    params.append("populate[seo][populate]", "*");

    // 1. Try /api/contact-page
    let response = await fetch(`${getStrapiBaseUrl()}/api/contact-page?${params.toString()}`, {
      headers: getStrapiRequestHeaders(),
      next: { tags: [CONTACT_PAGE_TAG] },
    });

    // 2. Try /api/contact
    if (!response.ok) {
      response = await fetch(`${getStrapiBaseUrl()}/api/contact?${params.toString()}`, {
        headers: getStrapiRequestHeaders(),
        next: { tags: [CONTACT_PAGE_TAG] },
      });
    }

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!item) return null;

    const attrs = item.attributes || item;

    return {
      id: item.id,
      documentId: item.documentId || String(item.id),
      title: attrs.title || "",
      badge: attrs.badge,
      heroTitle: attrs.heroTitle,
      heroSubtitle: attrs.heroSubtitle,
      step1Title: attrs.step1Title,
      entityTypeLabel: attrs.entityTypeLabel,
      entityTypeOptions: normalizeOptions(attrs.entityTypeOptions),
      desiredServiceLabel: attrs.desiredServiceLabel,
      desiredServiceOptions: normalizeOptions(attrs.desiredServiceOptions),
      challengeLabel: attrs.challengeLabel,
      challengeOptions: normalizeOptions(attrs.challengeOptions),
      step2Title: attrs.step2Title,
      fullNameLabel: attrs.fullNameLabel,
      emailLabel: attrs.emailLabel,
      phoneLabel: attrs.phoneLabel,
      companyLabel: attrs.companyLabel,
      preferredDateLabel: attrs.preferredDateLabel,
      messageLabel: attrs.messageLabel,
      submitButtonText: attrs.submitButtonText,
      submittingButtonText: attrs.submittingButtonText,
      successMessage: attrs.successMessage,
      blocks: attrs.blocks || [],
      seo: attrs.seo,
    };
  } catch (error) {
    console.error("Error fetching contact page data:", error);
    return null;
  }
}

export const getContactPageCached = unstable_cache(
  async (locale: Locale) => fetchContactPage(locale),
  [CONTACT_PAGE_TAG],
  {
    revalidate: 3600,
  }
);
