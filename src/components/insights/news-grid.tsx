'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiNewsItem } from '@/strapi/insights';
import { SaveButton } from './save-button';

type NewsGridProps = {
  news: StrapiNewsItem[];
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

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function NewsGrid({
  news,
  locale,
  labels,
  savedIds = [],
  isLoggedIn = false,
}: NewsGridProps) {
  const isRtl = locale === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  if (!news.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg">{labels.empty}</p>
      </div>
    );
  }

  const featured = news.find((n) => n.is_featured);
  const rest = news.filter((n) => !n.is_featured || n.id !== featured?.id);

  return (
    <div className="space-y-8">
      {/* Featured news - wide card */}
      {featured && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div
            className="group relative flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Absolute link overlay */}
            <Link
              href={`/${locale}/insights/news/${featured.slug}`}
              className="absolute inset-0 z-10"
              aria-label={featured.title}
            />

            {featured.cover_image?.url ? (
              <div className="relative sm:w-1/2 aspect-[1536/1024] sm:aspect-auto sm:min-h-full overflow-hidden shrink-0">
                <Image
                  src={featured.cover_image.url}
                  alt={featured.title || featured.title}
                  fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                <div className="absolute top-4 end-4 z-20">
                  <SaveButton
                    insightId={featured.documentId}
                    insightType="news-item"
                    initialIsSaved={savedIds.includes(featured.documentId)}
                    isLoggedIn={isLoggedIn}
                    locale={locale}
                  />
                </div>
              </div>
            ) : (
              <div className="relative sm:w-1/2 aspect-[1536/1024] sm:aspect-auto sm:min-h-full bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
                <div className="absolute top-4 end-4 z-20">
                  <SaveButton
                    insightId={featured.documentId}
                    insightType="news-item"
                    initialIsSaved={savedIds.includes(featured.documentId)}
                    isLoggedIn={isLoggedIn}
                    locale={locale}
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col justify-center p-6 sm:p-8 flex-1 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1 self-start rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-4">
                <Star className="h-3 w-3" /> {labels.featured}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(featured.news_date, locale)}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
                {featured.title}
              </h3>
              {featured.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {featured.description}
                </p>
              )}
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary">
                {labels.readMore}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rest of news */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((item, i) => (
          <motion.div
            key={item.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 h-full"
            >
              {/* Absolute link overlay */}
              <Link
                href={`/${locale}/insights/news/${item.slug}`}
                className="absolute inset-0 z-10"
                aria-label={item.title}
              />

              {item.cover_image?.url ? (
                <div className="relative aspect-[1536/1024] overflow-hidden">
                  <Image
                    src={item.cover_image.url}
                    alt={item.title || item.title}
                    fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 end-4 z-20">
                    <SaveButton
                      insightId={item.documentId}
                      insightType="news-item"
                      initialIsSaved={savedIds.includes(item.documentId)}
                      isLoggedIn={isLoggedIn}
                      locale={locale}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[1536/1024] bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="absolute top-4 end-4 z-20">
                    <SaveButton
                      insightId={item.documentId}
                      insightType="news-item"
                      initialIsSaved={savedIds.includes(item.documentId)}
                      isLoggedIn={isLoggedIn}
                      locale={locale}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col flex-1 p-5 z-20 pointer-events-none">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(item.news_date, locale)}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-3 leading-snug">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  {labels.readMore}
                  <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
