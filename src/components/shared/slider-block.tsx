"use client"
import { extractMediaUrl, toAbsoluteUrl, type FullStrapiMedia } from "@/lib/strapi";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type SliderBlockProps = {
  block: {
    __component: "shared.slider";
    id: number;
    files?: { data?: FullStrapiMedia[] }; // Updated according to Strapi v4 populate structure usually
  };
};

export function SliderBlock({ block }: SliderBlockProps) {
  // Try to find the files array within standard strapi response variations
  const files = Array.isArray(block.files) ? block.files : ((block as any).files?.data || []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  if (!files || files.length === 0) return null;

  return (
    <section className="my-12 px-4 max-w-6xl mx-auto w-full relative">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {files.map((file: FullStrapiMedia, index: number) => {
            const url = toAbsoluteUrl(extractMediaUrl(file));
            if (!url) return null;
            return (
              <div key={file.id || index} className="relative flex-[0_0_100%] min-w-0 aspect-video md:aspect-[21/9]">
                <Image
                  src={url}
                  alt={file.alternativeText || `Slider image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {files.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background/90"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!prevBtnEnabled}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background/90"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!nextBtnEnabled}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </section>
  );
}
