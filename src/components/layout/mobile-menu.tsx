"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/lib/i18n";
import type { HeaderMenuItem } from "@/strapi/header";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  items: HeaderMenuItem[];
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

export default function MobileMenu({ isOpen, onClose, locale, items }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const menuItems = useMemo(() => {
    const sideItems = items.filter((item) => item.onSideBar);
    return sideItems.length > 0 ? sideItems : items;
  }, [items]);

  const toggleExpanded = (itemOrder: number) => {
    setExpandedItems((prev) =>
      prev.includes(itemOrder) ? prev.filter((value) => value !== itemOrder) : [...prev, itemOrder]
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/75 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 end-0 z-50 w-[280px] border-s border-border bg-card p-3 shadow-2xl transition-transform duration-300 sm:w-[320px]",
          isOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        )}
        aria-label="Mobile menu"
      >
        <div className="mb-3 border-b border-border pb-3 pt-2">
          {menuItems.map((item) => {
            const hasSubItems = item.subItems.length > 0;
            const expanded = expandedItems.includes(item.order);

            return (
              <div key={`${item.label}-${item.url}`}>
                {hasSubItems ? (
                  <Button
                    variant="ghost"
                    size="default"
                    className="min-h-12 w-full justify-between px-3 py-3 text-base font-medium"
                    onClick={() => toggleExpanded(item.order)}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180" : "rotate-0")} />
                  </Button>
                ) : (
                  <Link
                    href={toLocaleAwareUrl(item.url, locale)}
                    {...getLinkProps(item.openInNewTab)}
                    onClick={onClose}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-md px-3 py-3 text-base font-medium hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                )}

                {hasSubItems && expanded ? (
                  <div className="mb-2 mt-1 space-y-1 rounded-md bg-accent/60 p-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={`${subItem.label}-${subItem.url}`}
                        href={toLocaleAwareUrl(subItem.url, locale)}
                        {...getLinkProps(subItem.openInNewTab)}
                        onClick={onClose}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-md px-3 py-2 text-sm hover:bg-card"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="space-y-2 px-2">
          <Link href={`/${locale}/auth/login`} onClick={onClose} className="block">
            <Button variant="outline" className="w-full justify-center">
              <LogIn className="me-2 h-4 w-4" />
              Login
            </Button>
          </Link>

          <Link href={`/${locale}/subscribe`} onClick={onClose} className="block">
            <Button className="w-full justify-center">Subscribe now</Button>
          </Link>
        </div>
      </aside>
    </>
  );
}