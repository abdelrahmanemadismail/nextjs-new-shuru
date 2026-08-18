'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  MessageCircleQuestion,
  Search,
  ArrowRight,
  Headphones,
  Sparkles,
} from 'lucide-react';
import type { StrapiFaqItem } from '@/strapi/page';
import { locales, type Locale } from '@/lib/i18n';

const localePathPattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
const isExternalUrl = (url: string) =>
  url.startsWith('http://') ||
  url.startsWith('https://') ||
  url.startsWith('mailto:') ||
  url.startsWith('tel:');

function toLocaleAwareUrl(url: string, locale: string) {
  if (!url || isExternalUrl(url) || url.startsWith('#')) return url;
  if (!url.startsWith('/')) return `/${locale}/${url}`;
  if (localePathPattern.test(url)) return url;
  return url === '/' ? `/${locale}` : `/${locale}${url}`;
}

export interface FaqSectionProps {
  badge?: string;
  title: string;
  introText?: string;
  items: StrapiFaqItem[];
  contactText?: string;
  contactLinkText?: string;
  contactLink?: string;
  locale?: Locale;
}

export function FaqSection({
  badge,
  title,
  introText,
  items = [],
  contactText,
  contactLinkText,
  contactLink,
  locale = 'ar',
}: FaqSectionProps) {
  const t = useTranslations('shared.faqSection');
  const [openIndices, setOpenIndices] = useState<number[]>([0]); // Open first item by default
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayBadge = badge || t('defaultBadge');
  const displayTitle = title || t('defaultTitle');
  const displayIntro = introText;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return Array.from(set);
  }, [items]);

  // Filter items based on active category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'ALL' || item.category?.trim() === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const toggleItem = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background via-muted/15 to-background border-t border-border/40 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -start-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -end-48 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          {displayBadge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{displayBadge}</span>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {displayTitle}
          </h2>

          {displayIntro && (
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {displayIntro}
            </p>
          )}
        </div>

        {/* Search & Category Filter (shown if > 4 items or if categories exist) */}
        {(items.length >= 5 || categories.length > 0) && (
          <div className="mb-10 space-y-4 max-w-2xl mx-auto">
            {items.length >= 5 && (
              <div className="relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full ps-11 pe-4 py-3 bg-card/80 backdrop-blur-sm border border-border/80 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                />
              </div>
            )}

            {categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('ALL')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === 'ALL'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {t('allCategories')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Accordion List */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const isOpen = openIndices.includes(index);
              return (
                <div
                  key={item.id || index}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden bg-card/90 backdrop-blur-sm ${
                    isOpen
                      ? 'border-primary/40 shadow-md ring-1 ring-primary/10'
                      : 'border-border/60 hover:border-border/90 shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-start group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                          isOpen
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                        }`}
                      >
                        <MessageCircleQuestion className="w-4 h-4" />
                      </span>
                      <span className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {item.question}
                      </span>
                    </div>

                    <div
                      className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-primary/15 border-primary/30 text-primary rotate-180'
                          : 'border-border bg-muted/40 text-muted-foreground group-hover:text-foreground group-hover:bg-muted'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/30 mt-1">
                          <div className="ps-11 whitespace-pre-line">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card/40">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm font-medium">
              {t('noResults')}
            </p>
          </div>
        )}

        {/* Contact Support Callout */}
        {(contactLink || contactText) && (
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  {contactText || t('defaultContactText')}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {locale === 'ar'
                    ? 'فريقنا متاح للإجابة على كافة استفساراتكم ومساعدتكم.'
                    : 'Our team is available to answer all your questions and assist you.'}
                </p>
              </div>
            </div>

            {contactLink && (
              <Link
                href={toLocaleAwareUrl(contactLink, locale)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shrink-0"
              >
                <span>{contactLinkText || t('defaultContactLinkText')}</span>
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
