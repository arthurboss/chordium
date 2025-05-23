import React from 'react';
import { SongData } from '@/types/song';
import { Artist } from '@/types/artist';
import { SearchResultStateData } from '@/utils/search-result-states';
import SearchResultsLayout from '@/components/SearchResultsLayout';
import SearchLoadingState from './SearchLoadingState';
import SearchErrorState from './SearchErrorState';
import ArtistSongsLoadingState from './ArtistSongsLoadingState';
import ArtistSongsErrorState from './ArtistSongsErrorState';
import ArtistSongsView from './ArtistSongsView';

interface SearchResultsStateHandlerProps {
  stateData: SearchResultStateData;
  artists: Artist[];
  filteredSongs: SongData[];
  filterSong: string;
  onView: (songData: SongData) => void;
  onAdd: (songId: string) => void;
  onArtistSelect: (artist: Artist) => void;
  hasSearched?: boolean;
}

export const SearchResultsStateHandler: React.FC<SearchResultsStateHandlerProps> = ({
  stateData,
  artists,
  filteredSongs,
  filterSong,
  onView,
  onAdd,
  onArtistSelect,
  hasSearched
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
    
    case 'default':
    default:
      if (!hasSearched) return null;
      return (
        <SearchResultsLayout
          artists={artists}
          songs={[]}
          onView={onView}
          onDelete={onAdd}
          onArtistSelect={onArtistSelect}
        />
      );
  }
};

export default SearchResultsStateHandler;
