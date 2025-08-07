import React from 'react';
import { SearchResultsStateHandlerProps } from './SearchResultsStateHandler.types';
import SongsView from '../SongsView';
import ErrorState from '@/components/ErrorState';
import SearchResultsLayout from '../SearchResultsLayout/SearchResultsLayout';
import LoadingState from '@/components/LoadingState';


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
      return <LoadingState />;
    case 'error':
      return <ErrorState error={String(stateData.error)} />;
    case 'artist-songs-loading':
      return <LoadingState message="Loading artist songs..." />;
    case 'artist-songs-error':
      return <ErrorState error={String(stateData.artistSongsError)} />;
    case 'artist-songs-empty':
      return <div style={{ padding: 32, textAlign: 'center' }}><h3>No songs found for {stateData.activeArtist?.displayName || 'this artist'}.</h3><p>Try searching for another artist or song.</p></div>;
    case 'songs-view':
      // For artist search results, show artists; for song search results, show songs
      if (stateData.searchType === 'artist' && stateData.activeArtist && stateData.artistSongs) {
        // Artist songs view (when an artist is selected)
        return <SongsView activeArtist={stateData.activeArtist} filteredSongs={filteredSongs} songs={undefined} filterSong={filterSong} filterArtist={filterArtist} onView={onView} onAdd={onAdd} searchType={stateData.searchType} />;
      } else if (stateData.searchType === 'artist') {
        // Artist search results - show artists, not songs
        const filteredArtists = filterArtist
          ? artists.filter(artist =>
            artist.displayName.toLowerCase().includes(filterArtist.toLowerCase())
          )
          : artists;
        return <SearchResultsLayout results={filteredArtists} onView={onView} onArtistSelect={onArtistSelect} hasSearched={true} />;
      } else {
        // Song search results
        return <SongsView activeArtist={stateData.activeArtist} filteredSongs={undefined} songs={stateData.songs} filterSong={filterSong} filterArtist={filterArtist} onView={onView} onAdd={onAdd} searchType={stateData.searchType} />;
      }
    case 'hasSearched': {
      // Filter artists by the artist filter input
      const filteredArtists = filterArtist
        ? artists.filter(artist =>
          artist.displayName.toLowerCase().includes(filterArtist.toLowerCase())
        )
        : artists;

      return <SearchResultsLayout results={[...filteredArtists, ...songs]} onView={onView} onArtistSelect={onArtistSelect} hasSearched={true} />;
    }
    case 'default':
    default:
      return <div data-cy="search-results-default-null" />;
  }
};

export default SearchResultsStateHandler;