import type { StrapiPageEntry } from "@/strapi/page";
import { type Locale } from "@/lib/i18n";
import { BlockRenderer } from "./block-renderer";

import { type StrapiTestimonial } from "@/strapi/home";

export function PageContent({ page, locale, testimonials }: { page: StrapiPageEntry; locale: Locale; testimonials: StrapiTestimonial[] }) {
  return (
    <>
      {page.blocks?.map((block) => (
        <BlockRenderer key={block.id} block={block} locale={locale} testimonials={testimonials} />
      ))}
    </>
  );
}