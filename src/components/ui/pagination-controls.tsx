'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaginationControls({
  pageCount,
  currentPage,
}: {
  pageCount: number;
  currentPage: number;
}) {
  const t = useTranslations('Pagination');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(pageCount, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={createPageURL(currentPage - 1)} aria-label={t("go_to_previous_page")}>{t("previous")}</PaginationPrevious>
          </PaginationItem>
        )}
        
        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={createPageURL(1)}>1</PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis aria-label={t("more_pages")} />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createPageURL(page)}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {endPage < pageCount && (
          <>
            {endPage < pageCount - 1 && (
              <PaginationItem>
                <PaginationEllipsis aria-label={t("more_pages")} />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={createPageURL(pageCount)}>{pageCount}</PaginationLink>
            </PaginationItem>
          </>
        )}

        {currentPage < pageCount && (
          <PaginationItem>
            <PaginationNext href={createPageURL(currentPage + 1)} aria-label={t("go_to_next_page")}>{t("next")}</PaginationNext>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
