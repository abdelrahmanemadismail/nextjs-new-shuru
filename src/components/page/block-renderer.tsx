import dynamic from 'next/dynamic';
import { HeroSection } from "@/components/home/hero-section";
import type { StrapiPageBlock } from "@/strapi/page";
import { type Locale } from "@/lib/i18n";
import type { StrapiTestimonial } from "@/strapi/home";

// Dynamically import below-the-fold components to reduce initial page bundle sizes
const OverviewSection = dynamic(() =>
  import("@/components/home/overview-section").then((mod) => mod.OverviewSection)
);
const ValueSection = dynamic(() =>
  import("@/components/home/value-section").then((mod) => mod.ValueSection)
);
const TrustSection = dynamic(() =>
  import("@/components/home/trust-section").then((mod) => mod.TrustSection)
);
const TestimonialsSection = dynamic(() =>
  import("@/components/home/testimonials-section").then((mod) => mod.TestimonialsSection)
);
const CtaFooterSection = dynamic(() =>
  import("@/components/home/cta-footer-section").then((mod) => mod.CtaFooterSection)
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
const FaqSection = dynamic(() =>
  import("@/components/shared/faq-section").then((mod) => mod.FaqSection)
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
      return <ValueSection value={block} />;

    case "home.trust-section":
      return <TrustSection block={block as any} />;

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
          badge={block.badge}
          title={block.title}
          introText={block.introText}
          steps={block.steps}
          ctaText={block.ctaText}
          ctaLink={block.ctaLink}
          locale={locale}
        />
      );

    case "shared.quote-section":
      return (
        <QuoteSection
          quoteText={block.quoteText}
          author={block.author}
        />
      );

    case "shared.faq-section":
      return (
        <FaqSection
          badge={block.badge}
          title={block.title}
          introText={block.introText}
          items={block.items}
          contactText={block.contactText}
          contactLinkText={block.contactLinkText}
          contactLink={block.contactLink}
          locale={locale}
        />
      );

    case "shared.media":
      return <MediaBlock block={block as any} />;
    case "shared.quote":
      return <QuoteBlock block={block as any} />;
    case "shared.rich-text":
      return <RichTextBlock block={block as any} />;
    case "shared.slider":
      return <SliderBlock block={block as any} />;

    default:
      console.warn(`Block component not found: ${(block as any).__component}`);
      return null;
  }
}