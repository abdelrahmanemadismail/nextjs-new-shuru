'use client';

import { motion } from 'framer-motion';
import { BookOpen, Newspaper, BookMarked, Users, Mic } from 'lucide-react';
import { type Locale } from '@/lib/i18n';

const tabs = [
  { id: 'articles', icon: BookOpen },
  { id: 'news', icon: Newspaper },
  { id: 'magazine', icon: BookMarked },
  { id: 'majlis', icon: Users },
  { id: 'podcasts', icon: Mic },
] as const;

type InsightsHeroProps = {
  locale: Locale;
  activeTab: string;
  onTabChange: (tab: string) => void;
  labels: Record<string, string>;
};

export function InsightsHero({ locale, activeTab, onTabChange, labels }: InsightsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-0">
      {/* Gradient background */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      <div className="absolute top-1/4 -start-32 -z-10 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px] opacity-40" />
      <div className="absolute top-1/4 -end-32 -z-10 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px] opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <BookOpen className="h-4 w-4" />
            {labels.badge}
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 dark:from-white dark:via-gray-200 dark:to-gray-400">
              {labels.title}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {labels.subtitle}
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm p-1.5 shadow-sm flex-wrap justify-center">
            {tabs.map(({ id, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{labels[id]}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="relative z-10 mt-12 h-12 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
