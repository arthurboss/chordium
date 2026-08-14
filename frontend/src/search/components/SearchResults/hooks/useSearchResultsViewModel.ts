import React from 'react';
import { mapSongsToSearchResults } from '@/search/utils/mappers/search-mappers';
import { isSlugDerivedName } from '@/utils/url-slug-utils';
import type { Artist, SearchHit, Song } from '@chordium/types';
import type { SearchResult } from '../SearchResultsLayout/SearchResultsLayout.types';

interface UseSearchResultsViewModelParams {
  isDefault: boolean;
  activeArtist: Artist | null;
  /** A search's results: artists and songs in the order the source ranked them. */
  hits: SearchHit[];
  artistSongs: Song[] | null;
  filteredArtistSongs: Song[];
  handleView: (song: Song) => void;
  handleArtistSelect: (artist: Artist) => void;
}

export function useSearchResultsViewModel({
  isDefault,
  activeArtist,
  hits,
  artistSongs,
  filteredArtistSongs,
  handleView,
  handleArtistSelect,
}: UseSearchResultsViewModelParams) {
  return React.useMemo(() => {
    if (!isDefault) {
      return { results: [] as SearchResult[], onResultClick: (_: SearchResult) => {} };
    }

    // One artist's own song list, already narrowed by the field's current contents
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

      const results = mapSongsToSearchResults(
        filteredArtistSongs.map((song) => ({
          ...song,
          artist: trustedArtistName || song.artist || activeArtist.displayName,
        }))
      );

      return {
        results,
        onResultClick: (item: SearchResult) => {
          if (item.type === 'song') handleView(item);
        },
      };
    }

    // A search's results are rendered as they came back, so a click has to handle
    // either kind: a song opens its chord sheet, an artist opens their songs.
    return {
      results: hits,
      onResultClick: (item: SearchResult) => {
        if (item.type === 'song') handleView(item);
        else handleArtistSelect(item);
      },
    };
  }, [
    isDefault,
    activeArtist,
    artistSongs,
    filteredArtistSongs,
    hits,
    handleView,
    handleArtistSelect,
  ]);
}
