import { useState, ReactNode } from 'react';
import { SearchLoadingContext } from './SearchLoadingContext';

/**
 * Provider component for search loading state
 * This provider manages the global loading state for search operations
 * without directly coupling to the search results hook
 */
export const SearchLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isSearching, setIsSearching] = useState(false);
  
  // Function to manually set loading state
  const setSearchLoading = (loading: boolean) => {
    setIsSearching(loading);
  };

  return (
    <SearchLoadingContext.Provider value={{ isSearching, setSearchLoading }}>
      {children}
    </SearchLoadingContext.Provider>
  );
};
