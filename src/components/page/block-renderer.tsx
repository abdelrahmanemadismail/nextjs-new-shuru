import { HeroSection } from "@/components/home/hero-section";
import dynamic from "next/dynamic";
import type { StrapiPageBlock } from "@/strapi/page";
import { LazySection } from "@/components/shared/lazy-section";

import { type Locale } from "@/lib/i18n";
import type { StrapiTestimonial } from "@/strapi/home";

const OverviewSection = dynamic(() =>
  import("@/components/home/overview-section").then((mod) => mod.OverviewSection)
);
const ValueSection = dynamic(() =>
  import("@/components/home/value-section").then((mod) => mod.ValueSection)
);
const CtaFooterSection = dynamic(() =>
  import("@/components/home/cta-footer-section").then((mod) => mod.CtaFooterSection)
);
const TestimonialsSection = dynamic(() =>
  import("@/components/home/testimonials-section").then((mod) => mod.TestimonialsSection)
);
const ChallengesSection = dynamic(() =>
  import("@/components/shared/challenges-section").then((mod) => mod.ChallengesSection)
);
const TimelineSection = dynamic(() =>
  import("@/components/shared/timeline-section").then((mod) => mod.TimelineSection)
);
const QuoteSection = dynamic(() =>
  import("@/components/shared/quote-section").then((mod) => mod.QuoteSection)
);
const MediaBlock = dynamic(() =>
  import("@/components/shared/media-block").then((mod) => mod.MediaBlock)
);
const QuoteBlock = dynamic(() =>
  import("@/components/shared/quote-block").then((mod) => mod.QuoteBlock)
);
const RichTextBlock = dynamic(() =>
  import("@/components/shared/rich-text-block").then((mod) => mod.RichTextBlock)
);
const SliderBlock = dynamic(() =>
  import("@/components/shared/slider-block").then((mod) => mod.SliderBlock)
);

export function BlockRenderer({ block, locale, testimonials }: { block: StrapiPageBlock; locale: Locale; testimonials: StrapiTestimonial[] }) {
  switch (block.__component) {
    case "home.hero":
      return <HeroSection hero={block} locale={locale} />;

    case "home.overview":
      return <OverviewSection overview={block} />;

    case "home.value":
      return (
        <LazySection placeholderHeight={450}>
          <ValueSection value={block} />
        </LazySection>
      );

    case "home.testimonials-section":
      return (
        <LazySection placeholderHeight={350}>
          <TestimonialsSection section={block} testimonials={testimonials} />
        </LazySection>
      );

    case "home.cta-footer":
      return (
        <LazySection placeholderHeight={300}>
          <CtaFooterSection cta={block} locale={locale} />
        </LazySection>
      );

    case "shared.challenges-section":
      return (
        <LazySection placeholderHeight={400}>
          <ChallengesSection
            title={block.title}
            introText={block.introText}
            challenges={block.challenges}
          />
        </LazySection>
      );

    case "shared.timeline-section":
      return (
        <LazySection placeholderHeight={500}>
          <TimelineSection
            title={block.title}
            steps={block.steps}
          />
        </LazySection>
      );

    case "shared.quote-section":
      return (
        <LazySection placeholderHeight={250}>
          <QuoteSection
            quoteText={block.quoteText}
            author={block.author}
          />
        </LazySection>
      );

    case "shared.media":
      return (
        <LazySection placeholderHeight={300}>
          <MediaBlock block={block as any} />
        </LazySection>
      );
    case "shared.quote":
      return (
        <LazySection placeholderHeight={200}>
          <QuoteBlock block={block as any} />
        </LazySection>
      );
    case "shared.rich-text":
      return (
        <LazySection placeholderHeight={300}>
          <RichTextBlock block={block as any} />
        </LazySection>
      );
    case "shared.slider":
      return (
        <LazySection placeholderHeight={400}>
          <SliderBlock block={block as any} />
        </LazySection>
      );

    default:
      console.warn(`Block component not found: ${(block as any).__component}`);
      return null;
  }
}