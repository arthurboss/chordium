/**
 * State interface for search filtering results
 */
import type { Artist, Song } from '@chordium/types';

export interface SearchFilterState {
  filteredArtists: Artist[];
  filteredSongs: Song[];
}
