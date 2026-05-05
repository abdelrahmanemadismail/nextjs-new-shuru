'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiMajlis } from '@/strapi/insights';

type MajlisGridProps = {
  majlises: StrapiMajlis[];
  locale: Locale;
  labels: Record<string, string>;
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
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' as const },
  }),
};

export function MajlisGrid({ majlises, locale, labels }: MajlisGridProps) {
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
      {majlises.map((majlis, i) => (
        <motion.div
          key={majlis.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link
            href={`/${locale}/insights/majlis/${majlis.slug}`}
            className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Cover image - landscape left side */}
            {majlis.cover_image?.url ? (
              <div className="relative sm:w-56 h-44 sm:h-auto overflow-hidden shrink-0">
                <Image
                  src={majlis.cover_image.url}
                  alt={majlis.title || majlis.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="sm:w-56 h-44 sm:h-auto bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                <Users className="h-12 w-12 text-primary/30" />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col flex-1 p-5 sm:p-6">
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
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
