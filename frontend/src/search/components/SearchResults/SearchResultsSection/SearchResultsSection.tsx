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
  hideDivider = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const displayCount = count !== undefined && count > 999 ? "999+" : count;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={`w-full ${className}`}>
      <div className="flex items-center gap-1.5">
        <CollapsibleTrigger
          // Turned from the state we already hold rather than a group-data
          // variant, which this build does not generate. Nothing here changes
          // size on toggle - the chevron below is the only thing that moves.
          className="flex flex-1 items-center gap-1.5 rounded-md py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* Same colors as the tabs above: muted while shut, foreground once
              open - open here plays the part active does there. */}
          <h3
            className={`flex-1 truncate text-base font-semibold tracking-tight ${
              open ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {title}
          </h3>
          {/* Fixed width, so a count never nudges anything else over. Caps out
              at "999+" instead of growing wider for whatever comes after it. */}
          {displayCount !== undefined && (
            <span className="flex w-10 shrink-0 items-center justify-center self-stretch rounded-md border border-border/70 bg-background font-mono text-[11px] tabular-nums text-muted-foreground">
              {displayCount}
            </span>
          )}
          {/* Right when shut, like a closed disclosure triangle; turns to point
              down and lights up purple once its list is open. Kept at the far
              right, the edge a reader's eye lands on for a disclosure control. */}
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-[transform,color,filter] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              open
                ? 'rotate-0 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.65)]'
                : '-rotate-90 text-muted-foreground'
            }`}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        {action}
      </div>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        {children}
      </CollapsibleContent>
      {/* Divides this closed heading from the next one. Gone once expanded -
          the content itself fills that role - and skipped on the last section,
          where there's no next heading left to divide from. */}
      {!hideDivider && !open && (
        <div
          className="h-px bg-linear-to-r from-border/60 from-25% to-transparent"
          aria-hidden="true"
        />
      )}
    </Collapsible>
  );
};

export default SearchResultsSection;
