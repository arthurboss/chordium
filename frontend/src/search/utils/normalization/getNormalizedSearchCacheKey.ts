import type { SearchEntryKind } from "@/search/types/SearchDataState";
import { normalizeForSearch } from "../";

/**
 * Generates a normalized cache key for search cache operations.
 * Always use this to build the cache key, so that the same search typed with
 * different casing or accents resolves to one entry.
 *
 * @param query The phrase that was searched for, or an artist path for that
 *              artist's song list.
 */
export function getNormalizedSearchCacheKey(
  query: string,
  kind: SearchEntryKind
): string {
  return `${normalizeForSearch(query || "")}|${kind}`;
}
