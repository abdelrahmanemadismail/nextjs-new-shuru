import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n';
import { getMagazineIssueBySlugCached } from '@/strapi/insights';
import { MagazineReadClient } from './magazine-read-client';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    return {
      title: 'Not Found',
    };
  }

  const title = locale === 'ar' 
    ? `قراءة: ${issue.title} - العدد ${issue.issue_number || ''}`
    : `Read: ${issue.title} - Issue ${issue.issue_number || ''}`;

  return {
    title: issue.seo?.meta_title || title,
    description: issue.seo?.meta_description || issue.description || undefined,
  };
}

export default async function MagazineReadPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Fetch data on the server side
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue || !issue.pdf_attachment?.url) {
    notFound();
  }

  const pdfUrl = issue.pdf_attachment.url;
  const magazineTitle = locale === 'ar'
    ? `${issue.title} - العدد ${issue.issue_number || ''}`
    : `${issue.title} - Issue ${issue.issue_number || ''}`;

  return (
    <MagazineReadClient
      pdfUrl={pdfUrl}
      magazineTitle={magazineTitle}
      magazineSlug={slug}
      downloadUrl={pdfUrl}
    />
  );
}
