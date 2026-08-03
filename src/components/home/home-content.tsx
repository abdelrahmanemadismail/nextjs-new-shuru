
import { type Locale } from '@/lib/i18n';
import { type StrapiHomeEntry, type StrapiTestimonial } from '@/strapi/home';
import { BlockRenderer } from '@/components/page/block-renderer';
import { JourneySection } from '@/components/home/journey-section';
import { TrustSection } from '@/components/home/trust-section';

type HomeContentProps = {
  locale: Locale;
  homeData: StrapiHomeEntry;
  testimonials: StrapiTestimonial[];
};

export function HomeContent({ locale, homeData, testimonials }: HomeContentProps) {
  return (
    <div className="flex w-full flex-col min-h-dvh">
      {homeData.blocks?.map((block, index) => {
        const uniqueKey = `${block.__component}-${block.id}-${index}`;
        // @ts-ignore - The block definitions overlap perfectly
        return (
          <div key={uniqueKey}>
            <BlockRenderer block={block as any} locale={locale} testimonials={testimonials} />
            {block.__component === 'home.overview' && (
              <>
                <JourneySection />
                <TrustSection />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
