import React from 'react';
import ResultsList from '@/components/ui/ResultsList';

import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";

import type { SearchResultsLayoutProps } from "./SearchResultsLayout.types";
import { ResultCard } from '../../ResultCard';


const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  results = [],
  onResultClick,
  searchType,
  artistQuery,
  songQuery,
  activeArtist
}) => {
  // Handle empty results
  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500" data-cy="search-no-chord-sheets-found">
        No results were found.
      </div>
    );
  }

  // Generate dynamic title based on search type and user queries
  const getSectionTitle = (): string => {
    let title: string;
    
    // If we have an activeArtist and we're showing songs (not artists), show the artist name
    if (activeArtist && results.length > 0 && results[0].type === 'song') {
      title = activeArtist.displayName;
    } else {
      // Otherwise, use the original logic based on search type
      switch (searchType) {
        case 'artist':
          title = artistQuery || 'Artists';
          break;
        case 'artist-song':
          title = activeArtist?.displayName || artistQuery || 'Songs';
          break;
        case 'song':
          title = songQuery || 'Songs';
          break;
        default:
          title = 'Results';
      }
    }

    return title;
  };

  const sectionTitle = getSectionTitle();

  return (
    <div className="flex flex-col gap-8 w-full">
      <SearchResultsSection title={sectionTitle} count={results.length}>
        <ResultsList
          items={results}
          renderItem={({ item }) => (
            <ResultCard
              key={item.path}
              result={item}
              onClick={onResultClick}
            />
          )}
        />
      </SearchResultsSection>
    </div>
  );
};

export default SearchResultsLayout;
