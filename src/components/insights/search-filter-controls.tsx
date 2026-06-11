'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type SearchFilterControlsProps = {
  searchQuery: string;
  sortOrder: 'newest' | 'oldest';
  categories?: CategoryOption[];
  selectedCategory?: string;
  showCategoryFilter?: boolean;
};

export function SearchFilterControls({
  searchQuery,
  sortOrder,
  categories = [],
  selectedCategory = 'all',
  showCategoryFilter = false,
}: SearchFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('search');

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync state if searchQuery prop changes (e.g. cleared externally)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search query URL synchronization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (localSearch) {
          params.set('q', localSearch);
        } else {
          params.delete('q');
        }
        params.set('page', '1'); // Reset pagination on new search
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, searchParams, pathname, router]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full bg-card border border-border/40 rounded-2xl p-4 md:p-6 shadow-xs backdrop-blur-md mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full h-12 ps-11 pe-10 bg-background/50 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={t('filter.clear')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          {showCategoryFilter && (
            <div className="relative flex items-center min-w-[160px] flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-muted-foreground">
                <Filter className="h-4 w-4" />
              </div>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full h-12 ps-9 pe-8 bg-background/50 border border-border/80 rounded-xl text-foreground text-sm outline-none cursor-pointer transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none font-medium"
              >
                <option value="all">{t('filter.allCategories')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Sort Order */}
          <div className="relative flex items-center min-w-[140px] flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="w-full h-12 ps-9 pe-8 bg-background/50 border border-border/80 rounded-xl text-foreground text-sm outline-none cursor-pointer transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none font-medium"
            >
              <option value="newest">{t('filter.newest')}</option>
              <option value="oldest">{t('filter.oldest')}</option>
            </select>
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
