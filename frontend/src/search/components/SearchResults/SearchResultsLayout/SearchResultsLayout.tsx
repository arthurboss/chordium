import React from 'react';
import type { Artist, Song } from "@chordium/types";
import ResultsList from '@/components/ui/ResultsList';
import ResultCard from '@/components/ResultCard';
import { SEARCH_TYPES } from '@chordium/types';
import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";
import type { SearchResultsLayoutProps } from "./SearchResultsLayout.types";

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  results,
  searchType,
  onView,
  onArtistSelect,
  hasSearched = false
}) => {
  // Use searchType to avoid expensive filtering when possible
  let artists: Artist[] = [];
  let songs: Song[] = [];

  if (searchType === SEARCH_TYPES.ARTIST) {
    // When searchType is artist, all results should be artists
    artists = results as Artist[];
  } else if (searchType === SEARCH_TYPES.SONG) {
    // When searchType is song, all results should be songs
    songs = results as Song[];
  } else {
    // Fall back to type detection for mixed results or when searchType is not specified
    artists = results.filter((item): item is Artist => 'displayName' in item);
    songs = results.filter((item): item is Song => 'title' in item);
  }

  const hasArtists = artists && artists.length > 0;
  const hasSongs = songs && songs.length > 0;
  // Handle empty results
  if (!hasArtists && !hasSongs && hasSearched) {
    return (
      <div className="p-8 text-center text-gray-500" data-cy="search-no-chord-sheets-found">
        No Chord Sheets were found.
      </div>
    );
  }
  // If there are no artists or songs and the user hasn't searched yet, render nothing.
  if (!hasArtists && !hasSongs && !hasSearched) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {hasArtists && (
        <SearchResultsSection title="Artist Results">
          <ResultsList
            items={artists}
            renderItem={({ item }) => (
              <ResultCard
                searchType="artist"
                title={item.displayName}
                path={item.path}
                onClick={() => onArtistSelect?.(item)}
              />
            )}
          />
        </SearchResultsSection>
      )}

      {hasSongs && (
        <SearchResultsSection title="Songs">
          <ResultsList
            items={songs}
            renderItem={({ item }) => (
              <ResultCard
                searchType="song"
                title={item.title}
                subtitle={item.artist}
                path={item.path}
                onClick={() => onView?.(item)}
              />
            )}
          />
        </SearchResultsSection>
      )}
    </div>
  );
};

export default SearchResultsLayout;
