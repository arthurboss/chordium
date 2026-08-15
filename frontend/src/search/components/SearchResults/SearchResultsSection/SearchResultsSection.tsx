import React from 'react';
import { SearchResultsSectionProps } from './SearchResultsSection.types';

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  title,
  children,
  className = '',
  count,
  total,
  action,
}) => {
  const trimmed = total !== undefined && count !== undefined && total > count;

  return (
    <section className={`w-full ${className}`}>
      {/* Equal-width spacers on both sides keep the heading centred whether or
          not there is an action beside it. */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1" />
        <h2 className="text-lg font-medium text-center">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              {trimmed
                ? `(${count} of ${total})`
                : `(${count} result${count !== 1 ? 's' : ''})`}
            </span>
          )}
        </h2>
        <div className="flex-1 flex justify-end">{action}</div>
      </div>
      {children}
    </section>
  );
};

export default SearchResultsSection;
