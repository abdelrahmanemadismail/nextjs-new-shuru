'use client';

import React, { useState } from 'react';

interface DownloadPdfButtonProps {
  pdfUrl: string;
  fileName: string;
  className?: string;
  children?: React.ReactNode;
  loadingText?: string;
}

export function DownloadPdfButton({
  pdfUrl,
  fileName,
  className,
  children,
  loadingText = 'جاري التحميل...'
}: DownloadPdfButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('حدث خطأ في تحميل الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={className}
    >
      {downloading ? (
        <>
          <svg className="w-5 h-5 ml-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
