/**
 * Props interface for SearchResultsStateHandler component
 */
import type { Artist, Song, SearchType } from "@chordium/types";

export interface SearchResultsStateHandlerProps {
  stateData: {
    state: string;
    error?: Error;
    activeArtist?: Artist;
    artistSongsError?: string;
    artistSongs?: Song[];
    searchType?: SearchType;
    hasSongs?: boolean;
    songs?: Song[];
  };
  artists: Artist[];
  songs: Song[];
  onView: (song: Song) => void;
  onArtistSelect: (artist: Artist) => void;
}
