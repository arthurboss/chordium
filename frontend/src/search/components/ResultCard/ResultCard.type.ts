import type { SearchResult } from "@/search/components/SearchResults/SearchResultsLayout/SearchResultsLayout.types";

export interface ResultCardProps {
  result: SearchResult;
  onClick: (item: SearchResult) => void;
}
