'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiMajlis } from '@/strapi/insights';
import { SaveButton } from './save-button';

type MajlisGridProps = {
  majlises: StrapiMajlis[];
  locale: Locale;
  labels: Record<string, string>;
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

export function MajlisGrid({
  majlises,
  locale,
  labels,
  savedIds = [],
  isLoggedIn = false,
}: MajlisGridProps) {
  const isRtl = locale === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  if (!majlises.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {majlises.map((majlis) => (
        <div
          key={majlis.id}
        >
          <div
            className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Absolute link overlay */}
            <Link
              href={`/${locale}/insights/majlis/${majlis.slug}`}
              className="absolute inset-0 z-10"
              aria-label={majlis.title}
            />

            {/* Cover image - landscape left side */}
            {majlis.cover_image?.url ? (
              <div className="relative w-full sm:w-[40%] md:w-[45%] lg:w-[480px] xl:w-[540px] aspect-[1376/768] shrink-0 overflow-hidden">
                <Image
                  src={majlis.cover_image.url}
                  alt={majlis.title || majlis.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 480px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
                />
                <div className="absolute top-3 end-3 z-20">
                  <SaveButton
                    insightId={majlis.documentId}
                    insightType="majlis"
                    initialIsSaved={savedIds.includes(majlis.documentId)}
                    isLoggedIn={isLoggedIn}
                    locale={locale}
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-full sm:w-[40%] md:w-[45%] lg:w-[480px] xl:w-[540px] aspect-[1376/768] bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                <Users className="h-12 w-12 text-primary/30" />
                <div className="absolute top-3 end-3 z-20">
                  <SaveButton
                    insightId={majlis.documentId}
                    insightType="majlis"
                    initialIsSaved={savedIds.includes(majlis.documentId)}
                    isLoggedIn={isLoggedIn}
                    locale={locale}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col flex-1 p-5 sm:p-6 z-20 pointer-events-none">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(majlis.majlis_date, locale)}</span>
              </div>

              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                {majlis.title}
              </h3>

              {majlis.description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {majlis.description}
                </p>
              )}

              <div className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
                {labels.readMore}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
