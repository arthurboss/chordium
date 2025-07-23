/**
 * Props interface for SearchResultsStateHandler component
 */
import type { Artist, Song } from '@chordium/types';

export interface SearchResultsStateHandlerProps {
  stateData: {
    state: string;
    error?: Error;
    activeArtist?: Artist;
    artistSongsError?: string;
    artistSongs?: Song[];
    searchType?: 'artist' | 'song';
    hasSongs?: boolean;
    songs?: Song[];
  };
  artists: Artist[];
  songs: Song[];
  filteredSongs: Song[];
  filterSong: string;
  filterArtist: string;
  onView: (song: Song) => void;
  onAdd: (songId: string) => void;
  onArtistSelect: (artist: Artist) => void;
}
