import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getPodcastsCached } from "@/strapi/insights";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const podcasts = await getPodcastsCached(locale);

  return (
    <main className="container py-24 mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Podcasts</h1>
      
      {podcasts.length === 0 ? (
        <p>No podcasts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map((podcast) => (
            <Link key={podcast.id} href={`/${locale}/insights/podcasts/${podcast.slug}`} className="block group">
              <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                <div className="aspect-square bg-muted relative">
                  {podcast.cover_image?.url && (
                    <img
                      src={podcast.cover_image.url}
                      alt={podcast.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">{podcast.title}</h2>
                  {podcast.description && (
                    <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{podcast.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                    {podcast.podcast_date && (
                      <time dateTime={podcast.podcast_date}>
                        {new Date(podcast.podcast_date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    )}
                    {podcast.duration && (
                      <span>{podcast.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
