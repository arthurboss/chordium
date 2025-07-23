/**
 * Options interface for useSearchResults hook
 */
export interface UseSearchResultsOptions {
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  shouldFetch?: boolean;
  onFetchComplete?: () => void;
}
