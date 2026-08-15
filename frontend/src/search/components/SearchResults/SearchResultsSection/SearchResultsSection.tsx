import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SearchResultsSectionProps } from './SearchResultsSection.types';

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  title,
  children,
  className = '',
  count,
  total,
  action,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const trimmed = total !== undefined && count !== undefined && total > count;
  const tally = trimmed
    ? `(${count} of ${total})`
    : count !== undefined
      ? `(${count} result${count !== 1 ? 's' : ''})`
      : null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={`w-full ${className}`}>
      {/* The heading stays centred over the full width, so the sort control is
          pinned rather than placed in the flow beside it. */}
      <div className="relative border-b border-border/60">
        <CollapsibleTrigger
          className="flex w-full items-center justify-center gap-2 rounded-md py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* Turned from the state we already hold rather than a group-data
              variant, which this build does not generate. */}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          <h2 className="text-lg font-medium">
            {title}
            {tally && (
              <span className="ml-2 text-sm text-muted-foreground font-normal">{tally}</span>
            )}
          </h2>
        </CollapsibleTrigger>
        {action && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">{action}</div>
        )}
      </div>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SearchResultsSection;
