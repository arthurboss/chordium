import React from 'react';
import { Song } from '@/types/song';
import { Artist } from '@/types/artist';
import SearchResultsLayout from './SearchResultsLayout';
import ArtistSongsView from './ArtistSongsView';
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
  console.log('[SearchResultsStateHandler] RENDER:', { 
    state: stateData.state, 
    artistsLength: artists.length, 
    songsLength: songs.length,
    filteredSongsLength: filteredSongs.length,
    activeArtist: stateData.activeArtist?.displayName,
    searchType: stateData.searchType
  });

  switch (stateData.state) {
    case 'loading':
      console.log('[SearchResultsStateHandler] RENDERING LOADING STATE');
      return <LoadingState />;

    case 'error':
      console.log('[SearchResultsStateHandler] RENDERING ERROR STATE:', stateData.error);
      return <ErrorState error={stateData.error} />;

    case 'artist-songs-loading':
      console.log('[SearchResultsStateHandler] RENDERING ARTIST SONGS LOADING');
      return <LoadingState />;

    case 'artist-songs-error':
      console.log('[SearchResultsStateHandler] RENDERING ARTIST SONGS ERROR:', stateData.artistSongsError);
      return <ErrorState error={new Error(stateData.artistSongsError)} />;

    case 'songs-view':
      if (stateData.searchType === 'artist' && stateData.activeArtist && stateData.artistSongs) {
        console.log('[SearchResultsStateHandler] RENDERING ARTIST SONGS VIEW');
        return (
          <ArtistSongsView
            artist={stateData.activeArtist}
            songs={stateData.artistSongs}
            onView={onView}
            onAdd={onAdd}
            filterSong={filterSong}
          />
        );
      } else if (stateData.searchType === 'song' && stateData.songs) {
        console.log('[SearchResultsStateHandler] RENDERING SONG SEARCH RESULTS');
        return (
          <SearchResultsLayout
            artists={[]}
            songs={stateData.songs}
            onView={onView}
            onDelete={() => {}}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      } else {
        console.log('[SearchResultsStateHandler] RENDERING DEFAULT SEARCH RESULTS');
        return (
          <SearchResultsLayout
            artists={artists}
            songs={songs}
            onView={onView}
            onDelete={() => {}}
            onArtistSelect={onArtistSelect}
            hasSearched={true}
          />
        );
      }

    case 'artist-songs-empty':
      console.log('[SearchResultsStateHandler] RENDERING EMPTY ARTIST SONGS');
      return (
        <div className="p-8 text-center text-gray-500">
          No songs found for {stateData.activeArtist?.displayName}.
        </div>
      );

    case 'hasSearched':
      console.log('[SearchResultsStateHandler] RENDERING NO RESULTS');
      return (
        <div className="p-8 text-center text-gray-500">
          No results found. Try adjusting your search terms.
        </div>
      );

    default:
      console.log('[SearchResultsStateHandler] RENDERING DEFAULT STATE');
      return null;
  }
};

export default SearchResultsStateHandler; 