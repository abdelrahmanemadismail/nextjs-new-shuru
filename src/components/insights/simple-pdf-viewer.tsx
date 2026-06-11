'use client';

import React from 'react';
import { DownloadPdfButton } from '@/components/ui/download-pdf-button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface SimplePdfViewerProps {
  pdfUrl: string;
  magazineTitle: string;
  magazineSlug: string;
  downloadUrl?: string;
}

export function SimplePdfViewer({
  pdfUrl,
  magazineTitle,
  magazineSlug,
  downloadUrl,
}: SimplePdfViewerProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isRtl = locale === 'ar';

  const backLabel = isRtl ? 'رجوع' : 'Back';
  const downloadLabel = isRtl ? 'تحميل' : 'Download';
  const loadingLabel = isRtl ? 'جاري التحميل...' : 'Downloading...';

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-900 text-white font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700 select-none">
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <Link
            href={`/${locale}/insights/magazine/${magazineSlug}`}
            className="p-2 hover:bg-neutral-700 rounded-full transition-colors inline-flex items-center justify-center shrink-0"
            title={backLabel}
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <h1 className="text-sm md:text-base font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl text-neutral-100">
            {magazineTitle}
          </h1>
        </div>
        
        {downloadUrl && (
          <DownloadPdfButton
            pdfUrl={downloadUrl}
            fileName={`${magazineSlug}.pdf`}
            className="inline-flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98] px-4 py-1.5 text-xs md:text-sm font-bold transition-all shrink-0"
            loadingText={loadingLabel}
          >
            {downloadLabel}
          </DownloadPdfButton>
        )}
      </header>
      
      {/* PDF Container */}
      <div className="flex-1 w-full bg-neutral-950 relative overflow-hidden">
        <iframe
          src={`${pdfUrl}#toolbar=1`}
          className="w-full h-full border-none"
          title={magazineTitle}
        />
      </div>
    </div>
  );
}
