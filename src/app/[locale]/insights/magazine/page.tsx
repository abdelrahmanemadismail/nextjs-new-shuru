import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getMagazineIssuesCached } from "@/strapi/insights";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const issues = await getMagazineIssuesCached(locale);

  return (
    <main className="container py-24 mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Magazine</h1>
      
      {issues.length === 0 ? (
        <p>No magazine issues found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {issues.map((issue) => (
            <Link key={issue.id} href={`/${locale}/insights/magazine/${issue.slug}`} className="block group">
              <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                <div className="aspect-[3/4] bg-muted relative">
                  {issue.cover_image?.url && (
                    <img
                      src={issue.cover_image.url}
                      alt={issue.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  {issue.issue_number && (
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Issue {issue.issue_number}</span>
                  )}
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">{issue.title}</h2>
                  {issue.description && (
                    <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{issue.description}</p>
                  )}
                  {issue.publish_date && (
                    <time dateTime={issue.publish_date} className="text-sm text-muted-foreground mt-auto">
                      {new Date(issue.publish_date).toLocaleDateString(locale, {
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
