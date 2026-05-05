'use client';
import { useEffect, useState } from 'react';

export function useHasHeaders(containerId: string) {
  const [hasHeaders, setHasHeaders] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const headers = container.querySelectorAll('h2, h3');
    setHasHeaders(headers.length > 0);
  }, [containerId]);

  return hasHeaders;
}