import { QuoteIcon } from "lucide-react";

type QuoteBlockProps = {
  block: {
    __component: "shared.quote";
    id: number;
    title?: string;
    body?: string;
  };
};

export function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <section className="my-12 px-4 max-w-4xl mx-auto w-full">
      <figure className="relative p-8 md:p-12 rounded-2xl bg-secondary/50 border border-border/50 text-center">
        <QuoteIcon className="w-10 h-10 md:w-12 md:h-12 text-primary/20 absolute top-4 left-6 md:top-6 md:left-10" />
        <blockquote className="relative z-10">
          <p className="text-xl md:text-3xl font-semibold leading-relaxed tracking-tight text-foreground">
            &quot;{block.body}&quot;
          </p>
        </blockquote>
        {block.title && (
          <figcaption className="mt-6 md:mt-8 flex items-center justify-center space-x-3 text-base md:text-lg text-muted-foreground font-medium">
            <div className="w-8 h-px bg-primary/40"></div>
            <span>{block.title}</span>
            <div className="w-8 h-px bg-primary/40"></div>
          </figcaption>
        )}
      </figure>
    </section>
  );
}
