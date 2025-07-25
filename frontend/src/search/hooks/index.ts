// Re-export the main hook
export { useSearchState } from "./useSearchState";

// Re-export navigation hooks
export { useArtistNavigation } from "./useArtistNavigation";
export { useSearchRedirect } from "./use-search-redirect";

// Re-export modular components for testing/debugging if needed
export { initialSearchState } from "./useSearchState/core/initialSearchState";
export { searchStateReducer } from "./useSearchState/core/searchStateReducer";
export { determineUIState } from "./useSearchState/utils/determineUIState";
export { filterArtistSongsByTitle } from "./useSearchState/utils/filterArtistSongsByTitle";
