import { useState, useEffect, useCallback } from "react";
import { getAllSearchCache } from "@/storage/stores/search-cache/operations";
import type { SearchCacheEntry } from "@/storage/types/search-cache";

export interface SearchHistoryEntry {
  artist: string;
  song: string;
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
          unique.push({ artist, song, timestamp: entry.storage.timestamp });
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
