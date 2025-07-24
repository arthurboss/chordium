/**
 * State interface for useSearchFetch hook
 */
import type { Artist, Song } from '@chordium/types';

export interface UseSearchFetchState {
  artists: Artist[] | null;
  songs: Song[] | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
}
