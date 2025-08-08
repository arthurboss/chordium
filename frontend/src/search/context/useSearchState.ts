import { useContext } from "react";
import { SearchStateContext } from "./SearchStateContext";

export function useSearchState() {
  const ctx = useContext(SearchStateContext);
  if (!ctx) throw new Error("useSearchState must be used within a SearchStateProvider");
  return ctx;
}
