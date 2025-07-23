/**
 * Props interface for SearchResultsLayout component
 */
import type { Artist, Song } from '@chordium/types';

export interface SearchResultsLayoutProps {
  artists: Artist[];
  songs: Song[];
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
  onArtistSelect?: (artist: Artist) => void;
  hasSearched?: boolean;
}
