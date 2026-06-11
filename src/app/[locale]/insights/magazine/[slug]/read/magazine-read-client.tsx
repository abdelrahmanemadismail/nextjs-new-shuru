'use client';

import { SimplePdfViewer } from '@/components/insights/simple-pdf-viewer';

interface MagazineReadClientProps {
  pdfUrl: string;
  magazineTitle: string;
  magazineSlug: string;
  downloadUrl?: string;
}

export function MagazineReadClient({
  pdfUrl,
  magazineTitle,
  magazineSlug,
  downloadUrl,
}: MagazineReadClientProps) {
  return (
    <SimplePdfViewer
      pdfUrl={pdfUrl}
      magazineTitle={magazineTitle}
      magazineSlug={magazineSlug}
      downloadUrl={downloadUrl}
    />
  );
}
