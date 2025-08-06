
import React from 'react';
import { SearchResultsSectionProps } from './SearchResultsSection.types';

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <section className={`w-full ${className}`}>
      <h2 className="text-lg font-medium mb-2 text-center">{title}</h2>
      {children}
    </section>
  );
};

export default SearchResultsSection;
