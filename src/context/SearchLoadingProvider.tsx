import { useReducer, ReactNode, useMemo } from 'react';
import { SearchLoadingContext } from './SearchLoadingContext';

// ✅ Define reducer function to manage search state updates efficiently
const searchReducer = (state: { isSearching: boolean }, action: { type: string }) => {
  switch (action.type) {
    case "START_SEARCH":
      return { isSearching: true };
    case "STOP_SEARCH":
      return { isSearching: false };
    default:
      return state;
  }
};

/**
 * Provider component for search loading state
 * This provider manages the global loading state for search operations
 * using useReducer and memoization for optimized performance
 */
export const SearchLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(searchReducer, { isSearching: false });

  // ✅ Optimized functions to dispatch reducer actions
  const setSearchLoading = (loading: boolean) => {
    dispatch({ type: loading ? "START_SEARCH" : "STOP_SEARCH" });
  };

  // ✅ Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ isSearching: state.isSearching, setSearchLoading }), [state.isSearching]);

  return (
    <SearchLoadingContext.Provider value={contextValue}>
      {children}
    </SearchLoadingContext.Provider>
  );
};
