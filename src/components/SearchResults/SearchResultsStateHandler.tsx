import React from 'react';
import { Song } from '@/types/song';
import { Artist } from '@/types/artist';
import { SearchResultItem } from '@/utils/search-result-item';
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
  | { state: 'songs-view'; activeArtist?: Artist; artistSongs?: Song[]; songs?: SearchResultItem[]; searchType: 'artist' | 'song'; hasSongs: boolean }
  | { state: 'hasSearched'; hasSongs: boolean }
  | { state: 'default' };

interface SearchResultsStateHandlerProps {
  stateData: UIState;
  artists: Artist[];
  songs: SearchResultItem[];
  filteredSongs: Song[];
  filterSong: string;
  onView: (songData: Song | SearchResultItem) => void;
  onAdd: (songId: string) => void;
  onArtistSelect: (artist: Artist) => void;
}

export const SearchResultsStateHandler: React.FC<SearchResultsStateHandlerProps> = ({
  stateData,
  artists,
  songs,
  filteredSongs,
  filterSong,
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
    
    case 'songs-view':
      return (
        <SongsView
          activeArtist={stateData.activeArtist}
          filteredSongs={stateData.searchType === 'artist' ? filteredSongs : undefined}
          songs={stateData.searchType === 'song' ? stateData.songs : undefined}
          filterSong={filterSong}
          onView={onView}
          onAdd={onAdd}
          searchType={stateData.searchType}
        />
      );
    
    case 'hasSearched':
      return (
        <SearchResultsLayout
          artists={artists}
          songs={songs}
          onView={onView}
          onDelete={onAdd}
          onArtistSelect={onArtistSelect}
        />
      );
    
    case 'default':
    default:
      return null;
  }
};

export default SearchResultsStateHandler;
