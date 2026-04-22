import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getMajlisCached } from "@/strapi/insights";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const majlises = await getMajlisCached(locale);

  return (
    <main className="container py-24 mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Majlis</h1>
      
      {majlises.length === 0 ? (
        <p>No majlis sessions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {majlises.map((item) => (
            <Link key={item.id} href={`/${locale}/insights/majlis/${item.slug}`} className="block group">
              <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                <div className="aspect-video bg-muted relative">
                  {item.cover_image?.url && (
                    <img
                      src={item.cover_image.url}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">{item.title}</h2>
                  {item.description && (
                    <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{item.description}</p>
                  )}
                  {item.majlis_date && (
                    <time dateTime={item.majlis_date} className="text-sm text-muted-foreground mt-auto">
                      {new Date(item.majlis_date).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
