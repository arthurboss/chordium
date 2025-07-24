// Re-export the main hook
export { useSearchState } from "./useSearchState";

// Re-export modular components for testing/debugging if needed
export { initialSearchState } from "./useSearchState/core/initialSearchState";
export { searchStateReducer } from "./useSearchState/core/searchStateReducer";
export { determineUIState } from "./useSearchState/utils/determineUIState";
export { filterArtistSongsByTitle } from "./useSearchState/utils/filterArtistSongsByTitle";
