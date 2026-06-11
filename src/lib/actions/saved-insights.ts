'use server';

import { getSession } from './auth';
import { getStrapiBaseUrl, toAbsoluteUrl, extractMediaUrl } from '@/lib/strapi';
import { type Locale } from '@/lib/i18n';
import { revalidatePath } from 'next/cache';

export async function isInsightSavedAction(insightId: string, insightType: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  try {
    const params = new URLSearchParams();
    params.append('filters[user][id][$eq]', session.user.id.toString());
    params.append('filters[insightId][$eq]', insightId);
    params.append('filters[insightType][$eq]', insightType);

    const res = await fetch(`${getStrapiBaseUrl()}/api/saved-insights?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return false;
    const payload = await res.json();
    return (payload.data || []).length > 0;
  } catch (err) {
    console.error('Error checking save status:', err);
    return false;
  }
}

export async function toggleSaveInsightAction(insightId: string, insightType: string): Promise<{ success: boolean; saved?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    // Check if it already exists
    const params = new URLSearchParams();
    params.append('filters[user][id][$eq]', session.user.id.toString());
    params.append('filters[insightId][$eq]', insightId);
    params.append('filters[insightType][$eq]', insightType);

    const checkRes = await fetch(`${getStrapiBaseUrl()}/api/saved-insights?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
      cache: 'no-store',
    });

    if (!checkRes.ok) {
      return { success: false, error: 'Failed to verify existing save status' };
    }

    const checkPayload = await checkRes.json();
    const existingEntries = checkPayload.data || [];

    if (existingEntries.length > 0) {
      // It is already saved, so delete it (unsave)
      // Strapi v5 documentId or id is needed for deletion
      const entryId = existingEntries[0].documentId || existingEntries[0].id;
      const deleteRes = await fetch(`${getStrapiBaseUrl()}/api/saved-insights/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
      });

      if (!deleteRes.ok) {
        return { success: false, error: 'Failed to unsave insight' };
      }

      return { success: true, saved: false };
    } else {
      // It is not saved, so save it
      const createRes = await fetch(`${getStrapiBaseUrl()}/api/saved-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({
          data: {
            user: session.user.id,
            insightId: insightId,
            insightType: insightType,
          },
        }),
      });

      if (!createRes.ok) {
        const errPayload = await createRes.json();
        return { success: false, error: errPayload.error?.message || 'Failed to save insight' };
      }

      return { success: true, saved: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}

export type SavedInsightsData = {
  articles: any[];
  newsItems: any[];
  magazineIssues: any[];
  majlises: any[];
  podcasts: any[];
};

export async function getSavedInsightsAction(locale: Locale): Promise<SavedInsightsData> {
  const session = await getSession();
  const defaultData: SavedInsightsData = {
    articles: [],
    newsItems: [],
    magazineIssues: [],
    majlises: [],
    podcasts: [],
  };

  if (!session) return defaultData;

  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/saved-insights?filters[user][id][$eq]=${session.user.id}&pagination[pageSize]=100`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return defaultData;
    const payload = await res.json();
    const entries = payload.data || [];

    const idsByType: Record<string, string[]> = {
      'article': [],
      'news-item': [],
      'magazine-issue': [],
      'majlis': [],
      'podcast': [],
    };

    entries.forEach((entry: any) => {
      const type = entry.insightType;
      const id = entry.insightId;
      if (idsByType[type]) {
        idsByType[type].push(id);
      }
    });

    const [articles, newsItems, magazineIssues, majlises, podcasts] = await Promise.all([
      fetchDetailsByType('/api/articles', idsByType['article'], locale, session.jwt),
      fetchDetailsByType('/api/news-items', idsByType['news-item'], locale, session.jwt),
      fetchDetailsByType('/api/magazine-issues', idsByType['magazine-issue'], locale, session.jwt),
      fetchDetailsByType('/api/majlises', idsByType['majlis'], locale, session.jwt),
      fetchDetailsByType('/api/podcasts', idsByType['podcast'], locale, session.jwt),
    ]);

    return {
      articles,
      newsItems,
      magazineIssues,
      majlises,
      podcasts,
    };
  } catch (err) {
    console.error('Error fetching user saved insights:', err);
    return defaultData;
  }
}

export async function getSavedInsightIdsAction(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const res = await fetch(`${getStrapiBaseUrl()}/api/saved-insights?filters[user][id][$eq]=${session.user.id}&pagination[pageSize]=100&fields[0]=insightId`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const payload = await res.json();
    return (payload.data || []).map((item: any) => item.insightId as string);
  } catch (err) {
    console.error('Error fetching saved insight IDs:', err);
    return [];
  }
}

async function fetchDetailsByType(endpoint: string, documentIds: string[], locale: Locale, jwt: string): Promise<any[]> {
  if (documentIds.length === 0) return [];

  try {
    const params = new URLSearchParams();
    params.append('locale', locale);
    params.append('populate', 'cover_image');
    
    // In Strapi v4/v5 we query filters[documentId][$in][0]=id1&filters[documentId][$in][1]=id2...
    documentIds.forEach((id, idx) => {
      params.append(`filters[documentId][$in][${idx}]`, id);
    });

    const res = await fetch(`${getStrapiBaseUrl()}${endpoint}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const payload = await res.json();
    return (payload.data || []).map((item: any) => {
      if (item.cover_image) {
        item.cover_image.url = toAbsoluteUrl(extractMediaUrl(item.cover_image));
      }
      return item;
    });
  } catch (err) {
    console.error(`Error fetching details for ${endpoint}:`, err);
    return [];
  }
}
