import React from 'react';
import { ArtistSong } from '@/types/artistSong';
import { Artist } from '@/types/artist';
import { SearchResultItem } from '@/utils/search-result-item';
import SearchResultsLayout from '@/components/SearchResultsLayout';
import SearchLoadingState from './SearchLoadingState';
import SearchErrorState from './SearchErrorState';
import ArtistSongsLoadingState from './ArtistSongsLoadingState';
import ArtistSongsErrorState from './ArtistSongsErrorState';
import ArtistSongsView from './ArtistSongsView';
import SongsView from './SongsView';

// Define our UI state type based on the determineUIState function output
type UIState = 
  | { state: 'loading' }
  | { state: 'error'; error: Error }
  | { state: 'artist-songs-loading'; activeArtist: Artist | null }
  | { state: 'artist-songs-error'; artistSongsError: string; activeArtist: Artist | null }
  | { state: 'artist-songs-view'; activeArtist: Artist; hasSongs: boolean }
  | { state: 'songs-view'; songs: SearchResultItem[]; hasSongs: boolean }
  | { state: 'hasSearched'; hasSongs: boolean }
  | { state: 'default' };

interface SearchResultsStateHandlerProps {
  stateData: UIState;
  artists: Artist[];
  songs: SearchResultItem[];
  filteredSongs: ArtistSong[];
  filterSong: string;
  onView: (songData: ArtistSong | SearchResultItem) => void;
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
      return <ArtistSongsLoadingState activeArtist={stateData.activeArtist!} />;
    
    case 'artist-songs-error':
      return (
        <ArtistSongsErrorState 
          activeArtist={stateData.activeArtist!} 
          error={stateData.artistSongsError!} 
        />
      );
    
    case 'artist-songs-view':
      return (
        <ArtistSongsView
          activeArtist={stateData.activeArtist!}
          filteredSongs={filteredSongs}
          filterSong={filterSong}
          onView={onView}
          onAdd={onAdd}
        />
      );
    
    case 'songs-view':
      return (
        <SongsView
          songs={stateData.songs}
          filterSong={filterSong}
          onView={onView}
          onAdd={onAdd}
          searchType="song"
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
