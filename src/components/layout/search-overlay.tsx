"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/lib/i18n";
import type { HeaderMenuItem } from "@/strapi/header";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  items: HeaderMenuItem[];
};

type SearchEntry = {
  label: string;
  url: string;
  openInNewTab: boolean;
};

const localePathPattern = new RegExp(`^/(${locales.join("|")})(/|$)`);

const isExternalUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("mailto:") ||
  value.startsWith("tel:");

const toLocaleAwareUrl = (url: string, locale: Locale) => {
  if (isExternalUrl(url) || url.startsWith("#")) {
    return url;
  }

  if (!url.startsWith("/")) {
    return `/${locale}/${url}`;
  }

  if (localePathPattern.test(url)) {
    return url;
  }

  return url === "/" ? `/${locale}` : `/${locale}${url}`;
};

const getLinkProps = (openInNewTab: boolean) =>
  openInNewTab
    ? {
        target: "_blank" as const,
        rel: "noopener noreferrer" as const,
      }
    : {};

export default function SearchOverlay({ isOpen, onClose, locale, items }: SearchOverlayProps) {
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTerm("");
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const allEntries = useMemo<SearchEntry[]>(() => {
    return items.flatMap((item) => [
      {
        label: item.label,
        url: item.url,
        openInNewTab: item.openInNewTab,
      },
      ...item.subItems.map((subItem) => ({
        label: subItem.label,
        url: subItem.url,
        openInNewTab: subItem.openInNewTab,
      })),
    ]);
  }, [items]);

  const results = useMemo(() => {
    const query = term.trim().toLowerCase();

    if (!query) {
      return [] as SearchEntry[];
    }

    return allEntries
      .filter((entry) => entry.label.toLowerCase().includes(query))
      .slice(0, 12);
  }, [allEntries, term]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background ps-10 pe-3 text-sm outline-none ring-ring/60 transition focus:ring-2"
              autoFocus
            />
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {term ? (
          <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card p-3">
            {results.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No results found for "{term}".
              </p>
            ) : (
              <ul className="space-y-2">
                {results.map((entry) => (
                  <li key={`${entry.label}-${entry.url}`}>
                    <Link
                      href={toLocaleAwareUrl(entry.url, locale)}
                      {...getLinkProps(entry.openInNewTab)}
                      className="block rounded-lg border border-transparent px-3 py-2 text-sm hover:border-border hover:bg-accent"
                      onClick={onClose}
                    >
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}