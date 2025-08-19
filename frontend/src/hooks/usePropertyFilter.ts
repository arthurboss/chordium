import { useMemo } from "react";
import { normalizeForSearch } from "@/search/utils/normalization/normalizeForSearch";

/**
 * Generic hook to filter an array of objects by a given property and filter string.
 * @param items - The array of items to filter.
 * @param filter - The filter string.
 * @param property - The property of the item to filter by (must be a string or number property).
 */
export function usePropertyFilter<T>(
  items: T[],
  filter: string,
  property: keyof T
): T[] {
  return useMemo(() => {
    if (!filter) return items;
    const normalizedFilter = normalizeForSearch(filter);
    return items.filter((item) => {
      const value = item[property];
      if (typeof value === "string" || typeof value === "number") {
        const normalizedValue = normalizeForSearch(String(value));
        const match = normalizedValue.includes(normalizedFilter);
        return match;
      }
      return false;
    });
  }, [items, filter, property]);
}
