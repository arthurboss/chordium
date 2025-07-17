import React from 'react';

interface SearchErrorStateProps {
  error: Error;
}

export const SearchErrorState: React.FC<SearchErrorStateProps> = ({ error }) => (
  <div className="p-8 text-center text-red-500">Error: {error.message}</div>
);

export default SearchErrorState;
