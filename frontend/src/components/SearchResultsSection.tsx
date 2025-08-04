
import React from 'react';

interface SearchResultsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

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
