"use client";

import { useState } from "react";
import Link from "next/link";
import type { FooterColumn } from "@/strapi/footer";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

const localePathPattern = new RegExp(`^/(${locales.join("|")})(/|$)`);
const isExternalUrl = (url: string) =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("mailto:") ||
  url.startsWith("tel:") ||
  url.startsWith("//");

function toLocaleAwareUrl(url: string, locale: Locale) {
  if (!url || isExternalUrl(url) || url.startsWith("#")) return url;
  if (!url.startsWith("/")) return `/${locale}/${url}`;
  if (localePathPattern.test(url)) return url;
  return url === "/" ? `/${locale}` : `/${locale}${url}`;
}

export function FooterAccordion({ columns, locale }: { columns: FooterColumn[]; locale: Locale }) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleMobileAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!columns || columns.length === 0) return null;

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-8 lg:gap-12">
      {columns.map((col, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={index}
            className="border-b border-border/40 pb-3.5 sm:border-none sm:pb-0 flex flex-col"
          >
            {/* Header: Interactive button on mobile (< sm), static header on normal screens (>= sm) */}
            <button
              type="button"
              onClick={() => toggleMobileAccordion(index)}
              className="w-full flex items-center justify-between py-1.5 text-start font-semibold text-sm text-foreground cursor-pointer sm:cursor-default sm:pointer-events-none select-none"
            >
              <span>{col.title}</span>
            </button>

            {/* Links List: Collapsible on mobile (< sm), always flex expanded on normal screens (sm:flex) */}
            <ul
              className={`flex-col gap-2.5 mt-2 transition-all duration-200 ${
                isOpen ? "flex" : "hidden sm:flex"
              }`}
            >
              {col.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link
                    href={toLocaleAwareUrl(link.url, locale)}
                    target={link.openInNewTab ? "_blank" : undefined}
                    rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
