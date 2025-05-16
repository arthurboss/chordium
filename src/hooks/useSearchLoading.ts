import { useContext } from 'react';
import { SearchLoadingContext } from '@/context/SearchLoadingContext';

/**
 * Custom hook to access search loading state and control functions
 */
export const useSearchLoading = () => {
  const context = useContext(SearchLoadingContext);
  
  if (context === undefined) {
    throw new Error('useSearchLoading must be used within a SearchLoadingProvider');
  }
  
  return context;
};
