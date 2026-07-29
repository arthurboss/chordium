import type { ChordSheet, SongMetadata } from "@chordium/types";
import { getApiBaseUrl } from "@/utils/api-base-url";

export type ArrangementVariant = "simplified" | "full" | "regular";

export interface SongData extends ChordSheet, SongMetadata {
  /** Which source arrangement this content came from. */
  variant?: ArrangementVariant;
  /** Whether the content contains tab blocks. */
  hasTabs?: boolean;
}

/**
 * Fetches a song preferring the simplified arrangement (single request).
 * The response carries `variant` and `hasTabs` describing what was fetched.
 */
export async function fetchSongFromAPI(path: string, options?: { lyricsOnly?: boolean }): Promise<SongData | null> {
  try {
    const params = new URLSearchParams({ url: path.trim() });
    if (options?.lyricsOnly) params.set('lyricsOnly', 'true');
    const response = await fetch(`${getApiBaseUrl()}/api/cifraclub-song?${params}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to load chord sheet");
    }

    const data = await response.json();
    if (!data || typeof data !== "object") throw new Error("Invalid API response");
    return data as SongData;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error fetching song from API:", error);
    throw error;
  }
}

/**
 * Fetches the full arrangement (with tabs) of a song for the simplified/full
 * toggle. Returns null on 404 (no full version reachable).
 */
export async function fetchFullSongFromAPI(path: string): Promise<SongData | null> {
  try {
    const params = new URLSearchParams({ url: path.trim() });
    const response = await fetch(`${getApiBaseUrl()}/api/cifraclub-song-full?${params}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to load full chord sheet");
    }

    const data = await response.json();
    if (!data || typeof data !== "object") throw new Error("Invalid API response");
    return data as SongData;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error fetching full song from API:", error);
    return null;
  }
}
