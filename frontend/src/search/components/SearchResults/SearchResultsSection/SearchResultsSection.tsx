
import React from 'react';
import { SearchResultsSectionProps } from './SearchResultsSection.types';

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  title,
  children,
  className = '',
  count,
}) => {
  return (
    <section className={`w-full ${className}`}>
      <h2 className="text-lg font-medium mb-2 text-center">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({count} result{count !== 1 ? 's' : ''})
          </span>
        )}
      </h2>
      {children}
    </section>
  );
};

export default SearchResultsSection;
