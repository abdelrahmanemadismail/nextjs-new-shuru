'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ClientRedirect({ to = '/' }: { to?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace(to);
    } else {
      router.replace(to);
    }
  }, [to, router]);

  return null;
}
