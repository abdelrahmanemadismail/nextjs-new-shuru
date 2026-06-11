import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getMagazineIssueBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import Link from "next/link";
import { ArticlesGrid } from "@/components/insights/articles-grid";
import ReactMarkdown from 'react-markdown';
import { DownloadPdfButton } from "@/components/ui/download-pdf-button";
import { Calendar, Eye, Download } from "lucide-react";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: issue.seo?.meta_title || issue.title,
    description: issue.seo?.meta_description || issue.description || undefined,
  };
}

export default async function MagazineIssuePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const issue = await getMagazineIssueBySlugCached(slug, locale);
  if (!issue) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'insights' });

  const issueNumberText = issue.issue_number 
    ? t('magazineSingle.issueNumber', { number: issue.issue_number }) 
    : issue.title;

  const publishDateText = issue.publish_date
    ? t('magazineSingle.publishDate', { date: new Date(issue.publish_date).toLocaleDateString(locale) })
    : '';

  const readPdfText = t('magazineSingle.readPdf');
  const downloadPdfText = t('magazineSingle.downloadPdf');
  const shareText = t('magazineSingle.share');
  const exploreOtherText = t('magazineSingle.exploreOther');
  const browseAllText = t('magazineSingle.browseAll');
  const articlesInIssueText = t('magazineSingle.articlesInIssue');

  const labels = {
    empty: locale === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found here.',
    readMore: locale === 'ar' ? 'اقرأ المزيد' : 'Read More',
    featured: locale === 'ar' ? 'مميز' : 'Featured',
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/magazine/${issue.slug}`;

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Breadcrumbs */}
      <nav className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/40 py-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs md:text-sm text-muted-foreground font-medium">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span className="text-neutral-400">/</span>
            <Link href={`/${locale}/insights`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرؤى' : 'Insights'}
            </Link>
            <span className="text-neutral-400">/</span>
            <Link href={`/${locale}/insights/magazine`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'المجلة' : 'Magazine'}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-foreground font-semibold truncate max-w-[120px] sm:max-w-none">
              {issueNumberText}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Details Section */}
      <section className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-start">
          {/* Cover Image Column */}
          <div className="lg:sticky lg:top-8 w-full max-w-sm mx-auto lg:col-span-1">
            <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-800 shadow-2xl rounded-2xl overflow-hidden border border-border/50">
              {issue.cover_image?.url ? (
                <Image
                  src={issue.cover_image.url}
                  alt={issue.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-muted-foreground">
                  No Cover
                </div>
              )}
            </div>
          </div>

          {/* Issue Details Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div>
              {issue.issue_number && (
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-extrabold mb-4 select-none">
                  {issueNumberText}
                </span>
              )}

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
                {issue.title}
              </h1>

              {issue.publish_date && (
                <div className="flex items-center text-muted-foreground text-sm gap-2 mb-6">
                  <Calendar className="w-4.5 h-4.5" />
                  <span>{publishDateText}</span>
                </div>
              )}

              {issue.description && (
                <div className="prose prose-neutral dark:prose-invert md:prose-lg max-w-none mb-6 leading-relaxed">
                  <ReactMarkdown>{issue.description}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Actions Section */}
            {issue.pdf_attachment?.url && (
              <div className="border-t border-border/50 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <Link
                    href={`/${locale}/insights/magazine/${issue.slug}/read`}
                    className="inline-flex items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] px-6 py-3.5 font-bold transition-all gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    {readPdfText}
                  </Link>
                  <DownloadPdfButton
                    pdfUrl={issue.pdf_attachment.url}
                    fileName={`${issue.slug}.pdf`}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted active:scale-[0.98] px-6 py-3.5 font-bold transition-all gap-2"
                    loadingText={locale === 'ar' ? 'جاري التحميل...' : 'Downloading...'}
                  >
                    <Download className="w-5 h-5" />
                    {downloadPdfText}
                  </DownloadPdfButton>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="border-t border-border/50 pt-6">
              <h3 className="text-xs font-extrabold text-foreground mb-3 uppercase tracking-wider select-none">
                {shareText}
              </h3>
              <div className="flex gap-3">
                <ShareButton platform="twitter" url={pageUrl} title={issue.title} />
                <ShareButton platform="facebook" url={pageUrl} title={issue.title} />
                <ShareButton platform="linkedin" url={pageUrl} title={issue.title} />
                <ShareButton platform="whatsapp" url={pageUrl} title={issue.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="container mx-auto px-4 mt-12 md:mt-16">
        {issue.articles && issue.articles.length > 0 && (
          <div className="pt-12 border-t border-border/50">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-8">
              {articlesInIssueText}
            </h2>
            <ArticlesGrid articles={issue.articles} locale={locale} labels={labels} />
          </div>
        )}
      </section>

      {/* Footer Explore Navigation */}
      <section className="container mx-auto px-4 mt-16 md:mt-24">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-border/40 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-4">
            {exploreOtherText}
          </h2>
          <Link
            href={`/${locale}/insights/magazine`}
            className="inline-flex items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] px-8 py-3.5 font-bold transition-all"
          >
            {browseAllText}
          </Link>
        </div>
      </section>
    </div>
  );
}

function ShareButton({ platform, url, title }: { platform: string; url: string; title: string }) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  };

  const icons = {
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    whatsapp: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>
    )
  };

  return (
    <a
      href={shareUrls[platform as keyof typeof shareUrls]}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground transition-all hover:scale-105 active:scale-95"
      aria-label={`Share on ${platform}`}
    >
      {icons[platform as keyof typeof icons]}
    </a>
  );
}
