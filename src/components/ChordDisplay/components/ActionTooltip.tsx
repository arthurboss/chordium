import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface ActionTooltipProps {
  children: React.ReactNode;
  content: string;
  /** Whether to use the span wrapper to prevent issues with complex components */
  useWrapper?: boolean;
  /** Optional delay duration in ms */
  delayDuration?: number;
}

/**
 * Wrapper component for buttons that provides a consistent tooltip style
 * Modified to handle complex components and prevent nesting issues
 */
const ActionTooltip: React.FC<ActionTooltipProps> = ({ 
  children, 
  content, 
  useWrapper = false,
  delayDuration = 300
}) => (
  <TooltipProvider>
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {useWrapper ? <span>{children}</span> : children}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs bg-background border shadow-sm">
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default React.memo(ActionTooltip);
