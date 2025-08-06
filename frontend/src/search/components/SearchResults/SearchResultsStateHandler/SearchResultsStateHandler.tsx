import React from 'react';
import { SEARCH_TYPES } from '@chordium/types';
import { SearchResultsLayout } from '..';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { SearchResultsStateHandlerProps } from './SearchResultsStateHandler.types';

const SearchResultsStateHandler: React.FC<SearchResultsStateHandlerProps> = ({
  stateData,
  artists,
  songs,
  onView,
  onArtistSelect,
}) => {
  switch (stateData.state) {
    case 'loading':
      return <LoadingState message="Loading results..." />;

    case 'error':
      return <ErrorState error={stateData.error?.message || 'Unknown error'} />;

    case 'artist-songs-loading':
      return <LoadingState message="Loading artist songs..." />;

    case 'artist-songs-error':
      return <ErrorState error={stateData.artistSongsError || 'Unknown error'} />;

    case 'songs-view':
      if (stateData.searchType === SEARCH_TYPES.ARTIST && stateData.activeArtist && stateData.artistSongs) {
        return (
          <SearchResultsLayout
            results={stateData.artistSongs}
            searchType={SEARCH_TYPES.SONG}
            onView={onView}
            onDelete={(_songId: string) => { }}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      } else if (stateData.searchType === SEARCH_TYPES.SONG && stateData.songs) {
        return (
          <SearchResultsLayout
            results={stateData.songs}
            searchType={SEARCH_TYPES.SONG}
            onView={onView}
            onDelete={(_songId: string) => { }}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      } else {
        return (
          <SearchResultsLayout
            results={[...artists, ...songs]}
            searchType={stateData.searchType}
            onView={onView}
            onDelete={(_songId: string) => { }}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      }

    case 'artist-songs-empty':
      return (
        <div className="p-8 text-center text-gray-500">
          No songs found for {stateData.activeArtist?.displayName}.
        </div>
      );

    case 'hasSearched':
      return (
        <div className="p-8 text-center text-gray-500">
          No results found. Try adjusting your search terms.
        </div>
      );

    default:
      return null;
  }
};

export default SearchResultsStateHandler;