import type { SearchHit } from "@chordium/types";

/**
 * A search result as the UI renders it.
 *
 * Defined by the shared type so that the one ranked list the source returns
 * survives the trip from the API to the screen without being split apart.
 */
export type SearchResult = SearchHit;
