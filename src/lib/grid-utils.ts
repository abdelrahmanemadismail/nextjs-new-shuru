import { cn } from "@/lib/utils";

/**
 * Universal adaptive responsive card layouts for Shuru.
 * 
 * Rules:
 * - 1 card: 1 centered column (max-w-lg)
 * - 2 cards: 2 columns in 1 row (md:grid-cols-2 max-w-4xl)
 * - 3 cards: 3 columns in 1 row next to each other (md:grid-cols-3 max-w-7xl)
 * - 4 cards: 2 in each row (md:grid-cols-2 max-w-5xl)
 * - 5 or more cards:
 *   - If count % 3 === 2 (e.g. 5, 8, 11): 3 in each full row, and the last 2 cards in the last row alone & centered!
 *   - If count % 3 === 1 (e.g. 7, 10, 13): 3 in each full row, and the last 1 card in the last row alone & centered!
 *   - If count % 3 === 0 (e.g. 6, 9, 12): 3 in each row.
 */

export function getCardGridContainerClasses(totalCount: number, customClasses = ""): string {
  let layoutClass = "";

  if (totalCount <= 1) {
    layoutClass = "grid grid-cols-1 max-w-lg mx-auto";
  } else if (totalCount === 2) {
    layoutClass = "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto";
  } else if (totalCount === 3) {
    layoutClass = "grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto";
  } else if (totalCount === 4) {
    // 2 in each row (2x2)
    layoutClass = "grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto";
  } else {
    // 5 or more items: 6-column underlying grid allows perfect 3-col rows (span 2)
    // and centered 2-col (start 2) or 1-col (start 3) in the last row
    layoutClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 max-w-7xl mx-auto";
  }

  return cn(layoutClass, customClasses);
}

export function getCardItemClasses(totalCount: number, index: number, customClasses = ""): string {
  let itemClass = "";

  if (totalCount >= 5) {
    const remainder = totalCount % 3;

    if (remainder === 2) {
      // e.g. 5, 8, 11 items: the last two items should be alone and centered in the last row
      if (index === totalCount - 2) {
        // Penultimate item: starts at column 2 (leaving col 1 empty)
        itemClass = "lg:col-span-2 lg:col-start-2";
      } else if (index === totalCount - 1) {
        // Last item: occupies columns 4-5 (leaving col 6 empty)
        // Also centered on tablet (md)
        itemClass = "lg:col-span-2 md:col-span-2 md:max-w-md md:mx-auto md:w-full lg:max-w-none";
      } else {
        // All previous items span 2 columns (3 items per full row)
        itemClass = "lg:col-span-2";
      }
    } else if (remainder === 1) {
      // e.g. 7, 10, 13 items: the last single item is centered in the last row
      if (index === totalCount - 1) {
        // Starts at column 3 (leaving cols 1-2 empty and cols 5-6 empty)
        itemClass = "lg:col-span-2 lg:col-start-3 md:col-span-2 md:max-w-md md:mx-auto md:w-full lg:max-w-none";
      } else {
        itemClass = "lg:col-span-2";
      }
    } else {
      // Remainder is 0 (e.g. 6, 9, 12 items): each item spans 2 columns
      itemClass = "lg:col-span-2";
    }
  }

  return cn(itemClass, customClasses);
}
