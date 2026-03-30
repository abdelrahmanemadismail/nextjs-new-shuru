'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, languageLabels, type Locale } from '@/lib/i18n';
import { setLocale } from '@/lib/locale-actions';
import { usePathname, useRouter } from 'next/navigation';

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  const buildLocalizedPath = React.useCallback(
    (targetLocale: Locale) => {
      const segments = pathname.split('/').filter(Boolean);
      const [, ...rest] = segments;
      return `/${[targetLocale, ...rest].join('/')}`;
    },
    [pathname]
  );

  const handleLocaleChange = (locale: Locale) => {
    startTransition(async () => {
      await setLocale(locale);
      router.replace(buildLocalizedPath(locale));
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            {languageLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
