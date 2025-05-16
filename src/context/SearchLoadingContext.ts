import { createContext } from 'react';

// Define the shape of our context
export interface SearchLoadingContextType {
  isSearching: boolean;
  setSearchLoading: (loading: boolean) => void;
}

// Create the context with undefined as initial value for better type safety
// This forces consumers to use the context within a provider
export const SearchLoadingContext = createContext<SearchLoadingContextType | undefined>(undefined);
