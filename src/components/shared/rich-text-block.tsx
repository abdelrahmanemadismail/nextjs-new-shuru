import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useLocale } from "next-intl";

type RichTextBlockProps = {
  block: {
    __component: "shared.rich-text";
    id: number;
    body?: string;
  };
};

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function RichTextBlock({ block }: RichTextBlockProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (!block.body) return null;

  // Automatically wrap raw YouTube URLs in markdown links so they trigger the custom anchor renderer
  const processedBody = block.body.replace(
    /(?<!\]\()(?<!href=["'])\b(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s<"]*)/g,
    "[$1]($1)"
  );

  return (
    <section 
      className={`my-12 px-4 max-w-3xl mx-auto w-full text-start ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="prose prose-lg md:prose-xl dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => <div className="parse-p mb-4" {...props} />,
            a: ({ node, href, children, ...props }) => {
              if (href) {
                const videoId = getYouTubeId(href);
                if (videoId) {
                  return (
                    <div className="my-8 relative w-full aspect-video rounded-xl overflow-hidden shadow-lg not-prose">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full border-0"
                      />
                    </div>
                  );
                }
              }
              return <a href={href} {...props}>{children}</a>;
            }
          }}
        >
          {processedBody}
        </ReactMarkdown>
      </div>
    </section>
  );
}
