'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiPodcast } from '@/strapi/insights';
import { SaveButton } from './save-button';

type PodcastsGridProps = {
  podcasts: StrapiPodcast[];
  locale: Locale;
  labels?: Record<string, string>;
  savedIds?: string[];
  isLoggedIn?: boolean;
};

function formatDate(dateStr: string, locale: Locale) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function PodcastsGrid({
  podcasts,
  locale,
  labels,
  savedIds = [],
  isLoggedIn = false,
}: PodcastsGridProps) {
  const emptyMessage = locale === 'ar' ? 'لم يتم العثور على بودكاست.' : 'No podcasts found.';

  if (!podcasts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
        <p className="text-lg font-medium">{labels?.empty || emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {podcasts.map((podcast) => (
        <div
          key={podcast.id}
          className="h-full"
        >
          <div className="group relative flex flex-col h-full rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-300">
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
              {podcast.cover_image?.url ? (
                <>
                  <Image
                    src={podcast.cover_image.url}
                    alt={podcast.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 end-3 z-20">
                    <SaveButton
                      insightId={podcast.documentId}
                      insightType="podcast"
                      initialIsSaved={savedIds.includes(podcast.documentId)}
                      isLoggedIn={isLoggedIn}
                      locale={locale}
                    />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-wider font-bold">
                  {locale === 'ar' ? 'بودكاست' : 'Podcast'}
                  <div className="absolute top-3 end-3 z-20">
                    <SaveButton
                      insightId={podcast.documentId}
                      insightType="podcast"
                      initialIsSaved={savedIds.includes(podcast.documentId)}
                      isLoggedIn={isLoggedIn}
                      locale={locale}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                <Link href={`/${locale}/insights/podcasts/${podcast.slug}`} className="after:absolute after:inset-0 outline-none">
                  {podcast.title}
                </Link>
              </h3>

              {podcast.description && (
                <p className="text-muted-foreground text-xs line-clamp-3 mb-6 leading-relaxed">
                  {podcast.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                {podcast.podcast_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={podcast.podcast_date}>
                      {formatDate(podcast.podcast_date, locale)}
                    </time>
                  </div>
                )}
                {podcast.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{podcast.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
