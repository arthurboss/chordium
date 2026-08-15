import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SearchResultsSectionProps } from './SearchResultsSection.types';

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  title,
  children,
  className = '',
  count,
  action,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const tally = count !== undefined ? `(${count})` : null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger
          className="flex flex-1 items-center gap-2 rounded py-1 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* Turned from the state we already hold rather than a group-data
              variant, which this build does not generate. */}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
          <h2 className="text-lg font-medium">
            {title}
            {tally && (
              <span className="ml-2 text-sm text-muted-foreground font-normal">{tally}</span>
            )}
          </h2>
        </CollapsibleTrigger>
        {action}
      </div>
      {/* Holds its weight under the heading, then fades out across the rest of
          the width rather than stopping at a hard edge. */}
      <div
        className="h-px bg-linear-to-r from-border/60 from-25% to-transparent"
        aria-hidden="true"
      />
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SearchResultsSection;
