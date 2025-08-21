import type { NavigationData } from "../chord-viewer.types";

/**
 * Extracts navigation data from location state with type safety
 * 
 * @param locationState - Router location state object
 * @returns Navigation data if available, undefined otherwise
 */
export function extractNavigationData(locationState?: unknown): NavigationData | undefined {
  if (!locationState || typeof locationState !== 'object') {
    return undefined;
  }
  
  const state = locationState as Record<string, unknown>;
  const song = state.song;
  
  if (!song || typeof song !== 'object') {
    return undefined;
  }
  
  const songData = song as Record<string, unknown>;
  
  if (
    typeof songData.path === 'string' &&
    typeof songData.title === 'string' &&
    typeof songData.artist === 'string'
  ) {
    return {
      path: songData.path,
      title: songData.title,
      artist: songData.artist
    };
  }
  
  return undefined;
}
