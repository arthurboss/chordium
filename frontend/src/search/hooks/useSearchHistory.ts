import { useState, useEffect, useCallback } from "react";
import { getAllSearchCache } from "@/storage/stores/search-cache/operations";
import type { SearchEntryKind } from "@/search/types/SearchDataState";
import type { SearchCacheEntry } from "@/storage/types/search-cache";

export interface SearchHistoryEntry {
  kind: SearchEntryKind;
  /** The phrase searched for, or the artist's path for that artist's song list. */
  query: string;
  /** The artist's real name, on the entries that have one. */
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

      const seen = new Set<string>();
      const unique: SearchHistoryEntry[] = [];

      // Sort newest first, then deduplicate
      const sorted = [...entries].sort(
        (a, b) => b.storage.timestamp - a.storage.timestamp
      );

      for (const entry of sorted) {
        const { query, kind, displayName } = entry.search;
        if (!query) continue;

        const key = `${kind}|${query}`;
        if (seen.has(key)) continue;
        seen.add(key);

        unique.push({
          kind,
          query,
          displayName: displayName ?? "",
          timestamp: entry.storage.timestamp,
        });

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
