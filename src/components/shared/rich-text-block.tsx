import ReactMarkdown from "react-markdown";

type RichTextBlockProps = {
  block: {
    __component: "shared.rich-text";
    id: number;
    body?: string;
  };
};

export function RichTextBlock({ block }: RichTextBlockProps) {
  if (!block.body) return null;

  return (
    <section className="my-12 px-4 max-w-3xl mx-auto w-full">
      <div className="prose prose-lg md:prose-xl dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none">
        <ReactMarkdown>{block.body}</ReactMarkdown>
      </div>
    </section>
  );
}
