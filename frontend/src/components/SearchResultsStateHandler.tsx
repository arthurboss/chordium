import React from 'react';
import { Song } from '@/types/song';
import { Artist } from '@/types/artist';
import SearchResultsLayout from './SearchResultsLayout';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface SearchResultsStateHandlerProps {
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

const SearchResultsStateHandler: React.FC<SearchResultsStateHandlerProps> = ({
  stateData,
  artists,
  songs,
  filteredSongs,
  filterSong,
  filterArtist,
  onView,
  onAdd,
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
      if (stateData.searchType === 'artist' && stateData.activeArtist && stateData.artistSongs) {
        return (
          <SearchResultsLayout
            results={stateData.artistSongs}
            onView={onView}
            onDelete={(_songId: string) => {}}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      } else if (stateData.searchType === 'song' && stateData.songs) {
        return (
          <SearchResultsLayout
            results={stateData.songs}
            onView={onView}
            onDelete={(_songId: string) => {}}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      } else {
        return (
          <SearchResultsLayout
            results={[...artists, ...songs]}
            onView={onView}
            onDelete={(_songId: string) => {}}
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