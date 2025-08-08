import React from 'react';
import ResultsList from '@/components/ui/ResultsList';

import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";

import type { SearchResultsLayoutProps } from "./SearchResultsLayout.types";
import { ResultCard } from '../../ResultCard';


const SearchResultsLayout: React.FC<Omit<SearchResultsLayoutProps, 'searchType'>> = ({
  results = [],
  onResultClick
}) => {
    // Handle empty results
    if (results.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500" data-cy="search-no-chord-sheets-found">
          No results were found.
        </div>
      );
    }

  // Infer type from first result
  const firstType = results[0].type;
  const sectionTitle = firstType === 'artist' ? 'Artist Results' : 'Song Results';

  return (
    <div className="flex flex-col gap-8 w-full">
      <SearchResultsSection title={sectionTitle}>
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
