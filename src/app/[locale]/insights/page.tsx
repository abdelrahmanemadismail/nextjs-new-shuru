import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import {
  getArticlesCached,
  getNewsCached,
  getMagazineIssuesCached,
  getMajlisCached,
  getPodcastsCached
} from "@/strapi/insights";
import { InsightsContent } from "@/components/insights/insights-content";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const [articles, news, magazines, majlises, podcasts] = await Promise.all([
    getArticlesCached(locale),
    getNewsCached(locale),
    getMagazineIssuesCached(locale),
    getMajlisCached(locale),
    getPodcastsCached(locale),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      <InsightsContent
        locale={locale}
        articles={articles}
        news={news}
        magazines={magazines}
        majlises={majlises}
        podcasts={podcasts}
      />
    </main>
  );
}
