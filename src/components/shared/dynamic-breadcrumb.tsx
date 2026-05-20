'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface DynamicBreadcrumbProps {
  locale: string;
}

export function DynamicBreadcrumb({ locale }: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const isRtl = locale === 'ar';

  // Remove locale prefix from path, e.g. "/en/insights/categories" -> "insights/categories"
  let pathWithoutLocale = pathname;
  if (pathname === `/${locale}`) {
    pathWithoutLocale = '';
  } else if (pathname.startsWith(`/${locale}/`)) {
    pathWithoutLocale = pathname.substring(locale.length + 2);
  } else if (pathname.startsWith('/')) {
    pathWithoutLocale = pathname.substring(1);
  }

  if (!pathWithoutLocale) {
    return null; // Don't show breadcrumb on home page
  }

  const segments = pathWithoutLocale.split('/').filter(Boolean);

  // Map of static segment translations
  const dictionary: Record<string, { en: string, ar: string }> = {
    'insights': { en: 'Insights', ar: 'الرؤى' },
    'categories': { en: 'Categories', ar: 'الفئات' },
    'articles': { en: 'Articles', ar: 'المقالات' },
    'contact': { en: 'Contact', ar: 'اتصل بنا' },
    'about': { en: 'About Us', ar: 'من نحن' }
  };

  const getSegmentName = (segment: string) => {
    // Check dictionary
    if (dictionary[segment]) {
      return dictionary[segment][locale as 'en' | 'ar'] || segment;
    }
    // Handle slugs visually (capitalize and replace hyphens)
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 30) + (segment.length > 30 ? '...' : '');
  };

  const buildPath = (index: number) => {
    const route = segments.slice(0, index + 1).join('/');
    return `/${locale}/${route}`;
  };

  return (
    <div className="container mx-auto px-4 py-4 mt-top">
      <Breadcrumb dir={isRtl ? 'rtl' : 'ltr'}>
        <BreadcrumbList>
          {/* Home Link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}`} aria-label={locale === 'ar' ? 'الرئيسية' : 'Home'}>
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const path = buildPath(index);
            const name = getSegmentName(segment);

            return (
              <React.Fragment key={path}>
                <BreadcrumbSeparator>
                  {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-primary">{name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={path}>{name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}