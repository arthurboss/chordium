import React from 'react';
import { usePropertyFilter } from '@/hooks/usePropertyFilter';
import { mapArtistsToSearchResults, mapSongsToSearchResults } from '@/search/utils/mappers/search-mappers';
import { filterSongsByArtistAndTitle } from '@/search/utils/filtering/filterSongsByArtistAndTitle';
import { normalizeForSearch } from '@/search/utils/normalization/normalizeForSearch';
import { isSlugDerivedName } from '@/utils/url-slug-utils';
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
  
  // For song searches, filter by both artist and title
  const filteredSongs = React.useMemo(() => {
    if (searchType === 'song') {
      return filterSongsByArtistAndTitle(songs, filterArtist, filterSong);
    }
    // For other search types, use simple title filtering
    if (!filterSong) return songs;
    const normalizedFilter = normalizeForSearch(filterSong);
    return songs.filter(song => 
      normalizeForSearch(song.title).includes(normalizedFilter)
    );
  }, [songs, filterArtist, filterSong, searchType]);

  // Build the view model (results + click handler) in a memo for stability
  const viewModel = React.useMemo(() => {
    if (!isDefault) {
      return { results: [] as SearchResult[], onResultClick: (_: SearchResult) => {} };
    }

    if (searchType === 'artist') {
      if (activeArtist && artistSongs) {
        // Prefer activeArtist.displayName unless it's an untouched slug guess
        // (e.g. "Ac Dc" for path "ac-dc") - in that case a scraped song's real
        // artist name (e.g. "AC/DC") is more trustworthy. A confirmed
        // displayName (from the search API, cache, or sessionStorage) always
        // wins, since it can't be recovered from a per-song scrape.
        const trustedArtistName =
          activeArtist.displayName && !isSlugDerivedName(activeArtist.displayName, activeArtist.path)
            ? activeArtist.displayName
            : undefined;
        const results = mapSongsToSearchResults(filteredArtistSongs.map(s => ({ ...s, artist: trustedArtistName || s.artist || activeArtist?.displayName })));
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


