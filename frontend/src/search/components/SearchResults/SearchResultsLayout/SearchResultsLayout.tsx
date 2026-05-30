import React from "react";
import { useTranslation } from "react-i18next";
import ResultsList from "@/components/ui/ResultsList";
import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";
import type { SearchResultsLayoutProps } from "./SearchResultsLayout.types";
import { ResultCard } from "../../ResultCard";

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  results = [],
  onResultClick,
  searchType,
  artistQuery,
  songQuery,
  activeArtist,
}) => {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500" data-cy="search-no-chord-sheets-found">
        {t("searchResults.noResults")}
      </div>
    );
  }

  const getSectionTitle = (): string => {
    if (activeArtist && results.length > 0 && results[0].type === "song") {
      return activeArtist.displayName;
    }
    switch (searchType) {
      case "artist":
        return artistQuery || t("searchResults.artists");
      case "artist-song":
        return activeArtist?.displayName || artistQuery || t("searchResults.songs");
      case "song":
        return songQuery || t("searchResults.songs");
      default:
        return t("searchResults.results");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <SearchResultsSection title={getSectionTitle()} count={results.length}>
        <ResultsList
          items={results}
          renderItem={({ item }) => (
            <ResultCard key={item.path} result={item} onClick={onResultClick} />
          )}
        />
      </SearchResultsSection>
    </div>
  );
};

export default SearchResultsLayout;
