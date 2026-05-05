'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Hash, ArrowRight, ArrowLeft } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiMagazineIssue } from '@/strapi/insights';

type MagazineGridProps = {
  issues: StrapiMagazineIssue[];
  locale: Locale;
  labels: Record<string, string>;
};

function formatDate(dateStr: string, locale: Locale) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return dateStr;
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

export function MagazineGrid({ issues, locale, labels }: MagazineGridProps) {
  const isRtl = locale === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  if (!issues.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {issues.map((issue, i) => (
        <motion.div
          key={issue.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link
            href={`/${locale}/insights/magazine/${issue.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-2 transition-all duration-300 h-full"
          >
            {/* Magazine cover - portrait aspect ratio */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              {issue.cover_image?.url ? (
                <Image
                  src={issue.cover_image.url}
                  alt={issue.title || issue.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hash className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
              )}
              {issue.issue_number && (
                <div className="absolute top-2 end-2 rounded-full bg-primary/90 text-white text-[11px] font-bold px-2.5 py-1">
                  #{issue.issue_number}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                  {labels.readMore}
                  <Arrow className="h-3 w-3" />
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {issue.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(issue.publish_date, locale)}</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
