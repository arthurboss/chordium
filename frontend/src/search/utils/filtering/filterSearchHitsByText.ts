/**
 * Filters an already-fetched page of unified search hits by a single text
 * term, entirely client-side - no network call, since every hit shown here
 * was already fetched for the section it lives in.
 *
 * Matches an artist's display name or path, or a song's title or artist -
 * whichever the hit actually is - the same "match either field" shape the
 * pre-unified-search filtering used, just collapsed onto the one hit type
 * this branch's results carry.
 */
import type { SearchHit } from "@chordium/types";
import { normalizeForSearch } from "../normalization/normalizeForSearch";

export function filterSearchHitsByText(hits: SearchHit[], filter: string): SearchHit[] {
  if (!filter) return hits;

  const normalizedFilter = normalizeForSearch(filter);

  return hits.filter((hit) => {
    if (hit.type === "artist") {
      return (
        normalizeForSearch(hit.displayName).includes(normalizedFilter) ||
        normalizeForSearch(hit.path).includes(normalizedFilter)
      );
    }
    return (
      normalizeForSearch(hit.title).includes(normalizedFilter) ||
      normalizeForSearch(hit.artist).includes(normalizedFilter)
    );
  });
}
