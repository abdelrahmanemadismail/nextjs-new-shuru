'use client';

import { type Locale } from '@/lib/i18n';
import { type StrapiHomeEntry, type StrapiTestimonial } from '@/strapi/home';
import { HeroSection } from './hero-section';
import { OverviewSection } from './overview-section';
import { ValueSection } from './value-section';
import { TestimonialsSection } from './testimonials-section';
import { CtaFooterSection } from './cta-footer-section';

type HomeContentProps = {
  locale: Locale;
  homeData: StrapiHomeEntry;
  testimonials: StrapiTestimonial[];
};

export function HomeContent({ locale, homeData, testimonials }: HomeContentProps) {
  return (
    <div className="flex w-full flex-col min-h-screen">
      {homeData.blocks?.map((block, index) => {
        const uniqueKey = `${block.__component}-${block.id}-${index}`;
        switch (block.__component) {
          case 'home.hero':
            return <HeroSection key={uniqueKey} hero={block} locale={locale} />;
          case 'home.overview':
            return <OverviewSection key={uniqueKey} overview={block} />;
          case 'home.value':
            return <ValueSection key={uniqueKey} value={block} />;
          case 'home.testimonials-section':
            return (
              <TestimonialsSection
                key={uniqueKey}
                section={block}
                testimonials={testimonials}
              />
            );
          case 'home.cta-footer':
            return <CtaFooterSection key={uniqueKey} cta={block} locale={locale} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
