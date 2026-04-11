import { HeroSection } from "@/components/home/hero-section";
import { OverviewSection } from "@/components/home/overview-section";
import { ValueSection } from "@/components/home/value-section";
import { CtaFooterSection } from "@/components/home/cta-footer-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ChallengesSection } from "@/components/shared/challenges-section";
import { TimelineSection } from "@/components/shared/timeline-section";
import { QuoteSection } from "@/components/shared/quote-section";
import type { StrapiPageBlock } from "@/strapi/page";

import { type Locale } from "@/lib/i18n";
import type { StrapiTestimonial } from "@/strapi/home";

export function BlockRenderer({ block, locale, testimonials }: { block: StrapiPageBlock; locale: Locale; testimonials: StrapiTestimonial[] }) {
  switch (block.__component) {
    case "home.hero":
      return <HeroSection hero={block} locale={locale} />;

    case "home.overview":
      return <OverviewSection overview={block} />;

    case "home.value":
      return <ValueSection value={block} />;

    case "home.testimonials-section":
      return <TestimonialsSection section={block} testimonials={testimonials} />;


    case "home.cta-footer":
      return <CtaFooterSection cta={block} locale={locale} />;

    case "shared.challenges-section":
      return (
        <ChallengesSection
          title={block.title}
          introText={block.introText}
          challenges={block.challenges}
        />
      );

    case "shared.timeline-section":
      return (
        <TimelineSection
          title={block.title}
          steps={block.steps}
        />
      );

    case "shared.quote-section":
      return (
        <QuoteSection
          quoteText={block.quoteText}
          author={block.author}
        />
      );

    default:
      console.warn(`Block component not found: ${(block as any).__component}`);
      return null;
  }
}