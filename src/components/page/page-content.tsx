import type { StrapiPageEntry } from "@/strapi/page";
import { type Locale } from "@/lib/i18n";
import { BlockRenderer } from "./block-renderer";
import { type StrapiTestimonial } from "@/strapi/home";
import type { StrapiServiceEntry } from "@/strapi/services";

export function PageContent({
  page,
  locale,
  testimonials = [],
  services = [],
}: {
  page: StrapiPageEntry;
  locale: Locale;
  testimonials?: StrapiTestimonial[];
  services?: StrapiServiceEntry[];
}) {
  return (
    <>
      {page.blocks?.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          locale={locale}
          testimonials={testimonials}
          services={services}
        />
      ))}
    </>
  );
}