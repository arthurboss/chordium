import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ResultsList from "@/components/ui/ResultsList";
import SearchResultsSection from "../SearchResultsSection/SearchResultsSection";
import type { SearchResult, SearchResultsLayoutProps } from "./SearchResultsLayout.types";
import { ResultCard } from "../../ResultCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "default" | "az" | "za";

function sortResults(items: SearchResult[], sort: SortOption): SearchResult[] {
  if (sort === "default") return items;
  const arr = [...items];
  const label = (r: SearchResult) => r.type === "song" ? r.title : r.displayName;
  return arr.sort((a, b) =>
    sort === "az"
      ? label(a).localeCompare(label(b))
      : label(b).localeCompare(label(a))
  );
}

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  results = [],
  onResultClick,
  searchType,
  artistQuery,
  songQuery,
  activeArtist,
}) => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortOption>("default");

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground" data-cy="search-no-chord-sheets-found">
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

  const sorted = sortResults(results, sort);

  return (
    <div className="flex flex-col gap-8 w-full">
      <SearchResultsSection title={getSectionTitle()} count={results.length}>
        <div className="flex justify-end mb-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-36 [&>span]:text-left">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t("sort.default")}</SelectItem>
              <SelectItem value="az">{t("sort.az")}</SelectItem>
              <SelectItem value="za">{t("sort.za")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ResultsList
          items={sorted}
          renderItem={({ item }) => (
            <ResultCard key={item.path} result={item} onClick={onResultClick} />
          )}
        />
      </SearchResultsSection>
    </div>
  );
};

export default SearchResultsLayout;
