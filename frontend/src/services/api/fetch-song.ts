import type { ChordSheet, SongMetadata } from "@chordium/types";
import { getApiBaseUrl } from "@/utils/api-base-url";

export interface SongData extends ChordSheet, SongMetadata {}

/**
 * Fetches chord sheet + metadata in a single request (one browser launch).
 */
export async function fetchSongFromAPI(path: string): Promise<SongData | null> {
  try {
    const params = new URLSearchParams({ url: path.trim() });
    const response = await fetch(`${getApiBaseUrl()}/api/cifraclub-song?${params}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || typeof data !== "object") throw new Error("Invalid API response");
    return data as SongData;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error fetching song from API:", error);
    throw error;
  }
}
