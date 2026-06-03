import { useState, useEffect, useCallback } from "react";
import { getAllSearchCache } from "@/storage/stores/search-cache/operations";
import { normalizeForSearch } from "@/search/utils/normalization/normalizeForSearch";
import type { SearchCacheEntry } from "@/storage/types/search-cache";

export interface SearchHistoryEntry {
  artist: string;
  song: string;
  searchType: string;
  displayName: string;
  timestamp: number;
}

export function useSearchHistory(): {
  history: SearchHistoryEntry[];
  refresh: () => void;
} {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  const load = useCallback(async () => {
    try {
      const entries: SearchCacheEntry[] = await getAllSearchCache();

      // Build a map of artist query -> displayName from artist-type entries
      const artistDisplayNames = new Map<string, string>();
      for (const entry of entries) {
        if (entry.search.searchType === "artist" && entry.results.length > 0) {
          const firstResult = entry.results[0] as any;
          if (firstResult?.displayName) {
            artistDisplayNames.set(normalizeForSearch(entry.search.query.artist ?? ""), firstResult.displayName);
          }
        }
      }

      const seen = new Set<string>();
      const unique: SearchHistoryEntry[] = [];

      // Sort newest first, then deduplicate by query pair
      const sorted = [...entries].sort(
        (a, b) => b.storage.timestamp - a.storage.timestamp
      );

      for (const entry of sorted) {
        const artist = entry.search.query.artist ?? "";
        const song = entry.search.query.song ?? "";
        const key = `${artist}|${song}`;
        if (!seen.has(key)) {
          seen.add(key);
          const firstResult = entry.results[0] as any;
          // Prefer displayName from Artist results, then look up from artist cache, then fall back
          const displayName = firstResult?.displayName
            ?? artistDisplayNames.get(normalizeForSearch(artist))
            ?? firstResult?.artist
            ?? "";
          unique.push({ artist, song, searchType: entry.search.searchType, displayName, timestamp: entry.storage.timestamp });
        }
        if (unique.length >= 10) break;
      }

      setHistory(unique);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, refresh: load };
}
