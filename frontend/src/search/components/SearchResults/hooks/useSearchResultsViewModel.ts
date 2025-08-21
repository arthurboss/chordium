import React from 'react';
import { usePropertyFilter } from '@/hooks/usePropertyFilter';
import { mapArtistsToSearchResults, mapSongsToSearchResults } from '@/search/utils/mappers/search-mappers';
import type { Artist, Song, SearchType } from '@chordium/types';
import type { SearchResult } from '../SearchResultsLayout/SearchResultsLayout.types';

interface UseSearchResultsViewModelParams {
  isDefault: boolean;
  searchType: SearchType;
  activeArtist: Artist | null;
  artists: Artist[];
  songs: Song[];
  artistSongs: Song[] | null;
  filterArtist: string;
  filterSong: string;
  handleView: (song: Song) => void;
  handleArtistSelect: (artist: Artist) => void;
}

export function useSearchResultsViewModel({
  isDefault,
  searchType,
  activeArtist,
  artists,
  songs,
  artistSongs,
  filterArtist,
  filterSong,
  handleView,
  handleArtistSelect,
}: UseSearchResultsViewModelParams) {
  // Filtering hooks (must be called unconditionally)
  const filteredArtists = usePropertyFilter(artists, filterArtist, 'displayName');
  const filteredArtistSongs = usePropertyFilter(artistSongs || [], filterSong, 'title');
  const filteredSongs = usePropertyFilter(songs, filterSong, 'title');

  // Build the view model (results + click handler) in a memo for stability
  const viewModel = React.useMemo(() => {
    if (!isDefault) {
      return { results: [] as SearchResult[], onResultClick: (_: SearchResult) => {} };
    }

    if (searchType === 'artist') {
      if (activeArtist && artistSongs) {
        const results = mapSongsToSearchResults(filteredArtistSongs);
        return {
          results,
          onResultClick: (item: SearchResult) => {
            if (item.type === 'song') handleView(item);
          },
        };
      }

      const results = mapArtistsToSearchResults(filteredArtists);
      return {
        results,
        onResultClick: (item: SearchResult) => {
          if (item.type === 'artist') handleArtistSelect(item);
        },
      };
    }

    // song search
    const results = mapSongsToSearchResults(filteredSongs);
    return {
      results,
      onResultClick: (item: SearchResult) => {
        if (item.type === 'song') handleView(item);
      },
    };
  }, [
    isDefault,
    searchType,
    activeArtist,
    artistSongs,
    filteredArtistSongs,
    filteredArtists,
    filteredSongs,
    handleView,
    handleArtistSelect,
  ]);

  return viewModel;
}


