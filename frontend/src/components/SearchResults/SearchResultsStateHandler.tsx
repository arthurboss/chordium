import React from 'react';
import { Song } from '@/types/song';
import { Artist } from '@/types/artist';
import SearchResultsLayout from '@/components/SearchResultsLayout';
import SearchLoadingState from './SearchLoadingState';
import SearchErrorState from './SearchErrorState';
import SongsView from './SongsView';

// Define our UI state type based on the determineUIState function output
type UIState = 
  | { state: 'loading' }
  | { state: 'error'; error: Error }
  | { state: 'artist-songs-loading'; activeArtist: Artist | null }
  | { state: 'artist-songs-error'; artistSongsError: string; activeArtist: Artist | null }
  | { state: 'artist-songs-empty'; activeArtist: Artist }
  | { state: 'songs-view'; activeArtist?: Artist; artistSongs?: Song[]; songs?: Song[]; searchType: 'artist' | 'song'; hasSongs: boolean }
  | { state: 'hasSearched'; hasSongs: boolean }
  | { state: 'default' };

interface SearchResultsStateHandlerProps {
  stateData: UIState;
  artists: Artist[];
  songs: Song[];
  filteredSongs: Song[];
  filterSong: string;
  filterArtist?: string; // <-- add this
  onView: (songData: Song) => void;
  onAdd: (songId: string) => void;
  onArtistSelect: (artist: Artist) => void;
}

export const SearchResultsStateHandler: React.FC<SearchResultsStateHandlerProps> = ({
  stateData,
  artists,
  songs,
  filteredSongs,
  filterSong,
  filterArtist = '', // <-- default
  onView,
  onAdd,
  onArtistSelect
}) => {
  switch (stateData.state) {
    case 'loading':
      return <SearchLoadingState />;
    case 'error':
      return <SearchErrorState error={stateData.error!} />;
    case 'artist-songs-loading':
      return <SearchLoadingState />;
    case 'artist-songs-error':
      return <SearchErrorState error={new Error(stateData.artistSongsError!)} />;
    case 'artist-songs-empty':
      return <div style={{ padding: 32, textAlign: 'center' }}><h3>No songs found for {stateData.activeArtist?.displayName || 'this artist'}.</h3><p>Try searching for another artist or song.</p></div>;
    case 'songs-view':
      return <SongsView activeArtist={stateData.activeArtist} filteredSongs={stateData.searchType === 'artist' ? filteredSongs : undefined} songs={stateData.searchType === 'song' ? stateData.songs : undefined} filterSong={filterSong} filterArtist={stateData.searchType === 'song' ? filterArtist : ''} onView={onView} onAdd={onAdd} searchType={stateData.searchType} />;
    case 'hasSearched':
      return <div data-cy="search-results-layout-wrapper"><SearchResultsLayout artists={artists} songs={songs} onView={onView} onDelete={onAdd} onArtistSelect={onArtistSelect} hasSearched={true} /></div>;
    case 'default':
    default:
      return <div data-cy="search-results-default-null" />;
  }
};

export default SearchResultsStateHandler;
